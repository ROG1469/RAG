# RAG System Retrieval & Query Analysis

## Executive Summary

After deep analysis of the RAG system, I've identified **several critical issues** preventing effective retrieval and multi-part query handling:

---

## 🔴 CRITICAL ISSUES FOUND

### Issue 1: EMBEDDING MODEL MISMATCH
**Severity: 🔴 CRITICAL**

**Location:** `supabase/functions/process-document/index.ts` (Step 3) & `supabase/functions/query-rag/index.ts` (Step 1)

**Problem:**
```typescript
// ❌ WRONG in process-document
const model = genAI.getGenerativeModel({ model: 'embedding-001' })

// ✅ CORRECT in query-rag
const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" })
```

**Why This Breaks Retrieval:**
- Documents are embedded using **embedding-001** model
- Queries are embedded using **text-embedding-004** model
- These models produce **incompatible vector spaces**
- Cosine similarity between mismatched embeddings = **unreliable/zero**
- System retrieves NO relevant chunks because vectors don't align

**Impact:** Explains why you can't retrieve uploaded documents!

**Fix:**
```typescript
// Both must use the SAME model
const model = genAI.getGenerativeModel({ 
  model: 'models/text-embedding-004'  // Use this consistently
})
```

---

### Issue 2: DATABASE SCHEMA MISSING CRITICAL COLUMN
**Severity: 🔴 CRITICAL**

**Location:** `migrations/20241117000001_initial_schema.sql`

**Problem:**
```sql
-- Current embeddings table schema
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id UUID NOT NULL REFERENCES public.chunks(id) ON DELETE CASCADE,
  embedding vector(768),  -- Stores vector
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Missing Column:**
The database is storing embeddings DIRECTLY in vector column, but there's NO way to distinguish:
- **Embeddings for document chunks** (should exist)
- **Embeddings for queries** (shouldn't be stored)

**Current Query Retrieval (query-rag):**
```typescript
const { data: chunks } = await supabase
  .from("chunks")
  .select(`
    id,
    content,
    document_id,
    documents(filename),
    embeddings(embedding)  // ⚠️ Attempts to fetch embedding directly
  `)
  .in("document_id", documentIds)
  .limit(1000);
```

**What's happening in the code:**
```typescript
const rawEmbedding = item.embeddings?.[0]?.embedding;
```

**If no embeddings exist:**
- `item.embeddings` = undefined
- `item.embeddings?.[0]` = undefined
- `rawEmbedding` = undefined
- `embeddingArray` = undefined
- Similarity calculation fails silently, returns 0
- Chunk gets sorted to bottom

**Why chunks might not have embeddings:**
1. `process-document` generates embeddings but stores them (may fail)
2. `generate-embeddings` might not be called
3. Embedding insertion might fail silently with no error logging
4. No validation that embeddings exist before similarity search

---

### Issue 3: NO MULTI-PART QUERY HANDLING
**Severity: 🔴 CRITICAL**

**Location:** `supabase/functions/query-rag/index.ts` (Step 5 - Gemini Prompt)

**Current Behavior:**
The system treats multi-part questions as a single query:
```
User: "when is payday AND contact details for TechSolutions AND Q3 2023 summary"
System: Sends ALL parts to Gemini at once with top 10 chunks
Result: Answers what it can from those 10 chunks, misses parts not in top 10
```

**Why This Fails:**
- User has 3 completely different questions
- Each needs different context chunks
- Top 10 global chunks may not be best for each part
- System doesn't re-query for unanswered parts
- Gemini guesses or says "I don't have info" instead of retrieving more

**Evidence from logs:**
```
Question: 'I wanted to know when is the pay day and the contact details of TechSolutions 
and also the summary from Q3 2023 report'

Answer: "... I don't have information about the contact details for a company named 
'TechSolutions' in the provided context. ... I don't have information about a Q3 2023 
report in the provided context."
```

**What SHOULD happen:**
1. Parse multi-part question: `["payday", "TechSolutions contact", "Q3 2023 summary"]`
2. Run 3 separate similarity searches (top 5-10 per part)
3. Combine all relevant chunks
4. Answer ALL parts with targeted context

---

### Issue 4: INADEQUATE ERROR HANDLING IN CHUNKS FETCH
**Severity: 🟠 HIGH**

**Location:** `supabase/functions/query-rag/index.ts` (Step 3)

**Current Code:**
```typescript
const { data: chunks } = await supabase
  .from("chunks")
  .select(`
    id,
    content,
    document_id,
    documents(filename),
    embeddings(embedding)
  `)
  .in("document_id", documentIds)
  .limit(1000);

if (!chunks || chunks.length === 0) {
  return new Response(
    JSON.stringify({ error: "No processed chunks found." }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
}
```

**Problems:**
1. **No error logging** - If `.select()` fails, we don't know why
2. **Silent embedding failures** - If embeddings aren't in DB, chunks still return (with empty embeddings array)
3. **No validation** - Don't check if `embeddings` field is actually populated:
   ```typescript
   chunks.forEach(chunk => {
     if (!chunk.embeddings || chunk.embeddings.length === 0) {
       console.warn(`Chunk ${chunk.id} has no embeddings!`);
     }
   });
   ```
4. **Cascading failures** - Missing embeddings cause similarity to be 0, all chunks sorted to bottom

---

### Issue 5: WEAK SIMILARITY THRESHOLD
**Severity: 🟠 HIGH**

**Location:** `supabase/functions/query-rag/index.ts` (Step 4)

**Current Behavior:**
```typescript
const scored = chunks
  .map((item: any) => ({
    // ... embeddings calculation
    similarity: cosineSimilarity(questionEmbedding, embeddingArray),
  }))
  .sort((a: any, b: any) => b.similarity - a.similarity)
  .slice(0, 10);

if (scored.length === 0) {
  // Return error
}
```

**Issues:**
1. **No minimum similarity threshold** - Includes chunks with similarity 0.1 (very low)
2. **No quality check** - Accepts top 10 even if all are poor matches
3. **Garbage in = Garbage out** - If embeddings are misaligned, top 10 are still garbage

**What happens:**
```
Query: "Q3 2023 financial report"
Top 10 chunks by similarity:
  1. 0.32 - "General company overview" ❌ Not financial
  2. 0.28 - "Employee handbook" ❌ Not financial
  3. 0.25 - "Office locations" ❌ Not financial
  ...
  10. 0.18 - Random text ❌ Below useful threshold

Result: Gemini gets 10 irrelevant chunks, can't answer properly
```

---

### Issue 6: EMBEDDING GENERATION MIGHT NOT BE CALLED
**Severity: 🟡 MEDIUM**

**Location:** `supabase/functions/process-document/index.ts` (Step 3)

**Problem:**
The `process-document` function generates embeddings inline (Step 3), BUT:
1. There's a separate `generate-embeddings` function that's never explicitly called
2. If `process-document` fails during embedding generation, embeddings are never created
3. No fallback to `generate-embeddings` function

**Current Flow:**
```
Document Upload
  ↓
process-document (in Edge Function):
  1. Parse document
  2. Chunk text
  3. Generate embeddings ← May fail here
  4. Store chunks + embeddings
  5. Update status to "completed"

❌ If step 3 fails: Chunks exist but embeddings don't
❌ generate-embeddings function never called as backup
```

**Validation:**
There's no verification that embeddings actually exist:
```typescript
// No check like this exists:
const { data: embeddingCount } = await supabase
  .from("embeddings")
  .select("id", { count: "exact", head: true })
  .eq("chunk_id", chunk.id);

if (embeddingCount === 0) {
  throw new Error(`Chunk ${chunk.id} has no embeddings!`);
}
```

---

## 📊 QUERY RETRIEVAL FLOW ANALYSIS

### Current Flow (Broken):
```
Query: "When is payday AND contact details AND Q3 2023 summary"
  ↓
[Query-RAG Function]
  1. Embed question using text-embedding-004 ✅
  2. Get user's completed documents ✅
  3. Fetch ALL chunks + embeddings (may be empty!) ⚠️
  4. Calculate similarity:
     - Embedding model mismatch? → similarity ≈ 0
     - Missing embeddings? → embeddingArray = undefined → similarity = 0
     - Low similarity? → chunk filtered out anyway
  5. Take top 10 (even if all are bad matches) ⚠️
  6. Send to Gemini with all 3 questions + generic 10 chunks
  7. Gemini tries to answer all parts from 10 chunks:
     - Part 1: May find in top 10 ✓
     - Part 2: Not in top 10 ✗
     - Part 3: Not in top 10 ✗
  8. Save incomplete answer to chat_history
```

### What SHOULD Happen (Fixed):
```
Query: "When is payday AND contact details AND Q3 2023 summary"
  ↓
[Enhanced Query-RAG Function]
  1. Parse multi-part question into: ["payday", "TechSolutions", "Q3 2023"]
  2. For each part:
     a. Embed part-specific question
     b. Search for top 10-15 chunks per part
     c. Validate embeddings exist
     d. Filter by minimum similarity (0.3+)
     e. Combine unique chunks
  3. Validate all embeddings are populated
  4. Generate context with targeted chunks for each part
  5. Send to Gemini: "Answer each part separately using provided context"
  6. Gemini answers all 3 parts with targeted chunks
  7. Save complete answer
```

---

## 🔍 ROOT CAUSE SUMMARY

| Issue | Root Cause | Impact | Priority |
|-------|-----------|--------|----------|
| Embedding mismatch | Different models (embedding-001 vs text-embedding-004) | Zero similarity, no retrieval | 🔴 P0 |
| Missing embeddings | process-document may fail silently | Can't calculate similarity | 🔴 P0 |
| No multi-part handling | Single query to Gemini | Incomplete answers | 🔴 P0 |
| No similarity threshold | Accepts any chunks | Poor context quality | 🟠 P1 |
| No validation | Doesn't check if embeddings exist | Silent failures | 🟠 P1 |
| Wrong embedding model in processor | Hard-coded to embedding-001 | Incompatible vectors | 🔴 P0 |

---

## ✅ RECOMMENDED FIXES (In Priority Order)

### Fix 1: Unify Embedding Models (CRITICAL)
**File:** `supabase/functions/process-document/index.ts`
```typescript
// Change from:
const model = genAI.getGenerativeModel({ model: 'embedding-001' })

// To:
const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })
```

### Fix 2: Add Embedding Validation
**File:** `supabase/functions/query-rag/index.ts`
```typescript
// Before similarity calculation:
const scored = chunks
  .filter(item => {
    const embedding = item.embeddings?.[0]?.embedding;
    if (!embedding) {
      console.warn(`Chunk ${item.id} missing embedding!`);
      return false;
    }
    return true;
  })
  .map(item => {
    // ... rest of code
  })
```

### Fix 3: Add Similarity Threshold
**File:** `supabase/functions/query-rag/index.ts`
```typescript
// After sorting:
.slice(0, 10)
.filter(chunk => chunk.similarity > 0.3) // Add minimum threshold
```

### Fix 4: Implement Multi-Part Query Handling
**File:** `supabase/functions/query-rag/index.ts`
```typescript
// Parse question into multiple parts:
function parseMultiPartQuestion(question: string): string[] {
  // Split by "and", "also", commas, semicolons
  // Filter empty parts
  // Return array of sub-questions
}

// For each part, run separate similarity search:
for (const part of parsedParts) {
  const partEmbedding = await embeddingModel.embedContent(part);
  const partScored = // ... similarity search for this part
  allScored.push(...partScored);
}
```

### Fix 5: Add Comprehensive Logging
**File:** `supabase/functions/query-rag/index.ts`
```typescript
chunks.forEach(chunk => {
  const embedding = chunk.embeddings?.[0]?.embedding;
  console.log(`Chunk ${chunk.id}:`, {
    hasEmbedding: !!embedding,
    embeddingType: typeof embedding,
    contentLength: chunk.content.length,
  });
});
```

---

## 🧪 TESTING CHECKLIST

After fixes:
- [ ] Verify both embeddings use same model
- [ ] Test: Upload document → Check embeddings table has data
- [ ] Test: Simple query → Verify top chunk similarity > 0.5
- [ ] Test: Multi-part question → All parts answered
- [ ] Test: Missing document → Proper error message
- [ ] Test: Check server logs for validation warnings
- [ ] Test: Verify chunks have embeddings before similarity search

---

## 📝 DETAILED TECHNICAL BREAKDOWN

### Cosine Similarity Function
```typescript
function cosineSimilarity(a: number[], b: number[]) {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Issue:** If `b` is undefined (missing embedding), this returns 0 silently instead of throwing error.

### Correct Embedding Dimensions
- `text-embedding-004`: **768 dimensions** ✅ (matches DB schema)
- `embedding-001`: **1536 dimensions** ❌ (conflicts with 768)

---

## 🎯 NEXT STEPS

1. **IMMEDIATE:** Fix embedding model mismatch (Fix 1)
2. **URGENT:** Add embedding validation (Fix 2)
3. **IMPORTANT:** Add similarity threshold (Fix 3)
4. **IMPORTANT:** Implement multi-part query (Fix 4)
5. **ONGOING:** Add comprehensive logging (Fix 5)

