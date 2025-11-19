# DEBUG: Q2 2023 Retrieval Issue

## Problem Statement
User asked: "When is payday AND what is my net profit in Q2 2023 AND what is the requirements for Project Alpha?"

System response was missing Q2 2023 data despite user saying the data exists in database.

---

## Diagnostic Questions

### 1. Is Q2 2023 data in the database?

**Check what documents exist:**
```sql
SELECT 
  id,
  filename,
  status,
  created_at,
  file_size
FROM documents
WHERE filename LIKE '%Q2%' OR filename LIKE '%2023%'
ORDER BY created_at DESC;
```

**Expected result:** Should see at least one Q2 2023 document with status='completed'

---

### 2. Are chunks extracted from Q2 2023?

```sql
SELECT 
  d.filename,
  COUNT(c.id) as chunk_count,
  MIN(LEFT(c.content, 50)) as first_chunk_preview
FROM documents d
LEFT JOIN chunks c ON c.document_id = d.id
WHERE d.filename LIKE '%Q2%'
GROUP BY d.id, d.filename;
```

**Expected:** Should show chunks with content like "Net Profit", "Q2 2023", financial data

**If 0 chunks:** Problem is in document processing
**If chunks exist but no content:** Problem is in chunking logic
**If chunks have binary data:** Problem is in Excel/file parsing

---

### 3. Are embeddings generated?

```sql
SELECT 
  COUNT(e.id) as total_embeddings,
  COUNT(DISTINCT e.chunk_id) as chunks_with_embeddings
FROM embeddings e
WHERE e.chunk_id IN (
  SELECT c.id FROM chunks c 
  JOIN documents d ON c.document_id = d.id
  WHERE d.filename LIKE '%Q2%'
);
```

**Expected:** total_embeddings should equal chunk count

**If 0:** Embedding generation failed
**If less than chunk count:** Some embeddings missing

---

### 4. Are Q2 2023 chunks retrievable?

**Search test:**
```sql
SELECT 
  c.id,
  c.content,
  d.filename
FROM chunks c
JOIN documents d ON c.document_id = d.id
WHERE d.filename LIKE '%Q2%'
LIMIT 5;
```

**Check if content looks normal:**
- ✅ Contains readable text about finances
- ❌ Contains binary/XML characters (parsing issue)
- ❌ Is mostly empty (extraction issue)

---

### 5. Why isn't similarity search finding it?

**Test similarity search manually:**

The query-rag function splits "payday AND net profit Q2 2023" into parts and searches for each.

For the "Q2 2023 net profit" part:
1. System embeds: "net profit Q2 2023"
2. System searches all chunks with this embedding
3. System calculates cosine similarity to each chunk
4. System gets top 10 by similarity

**Possible issues:**
- Q2 2023 chunks are there but similarity is below 0.25 threshold
- Q2 2023 chunks aren't being searched (document excluded?)
- Embedding generation failed for Q2 2023
- Q2 2023 data isn't actually in the chunks (parsing issue)

---

## Action Plan to Debug

1. **Check documents table** - Does Q2 2023 exist with status='completed'?
2. **Check chunks table** - Can you read the content?
3. **Check embeddings table** - Are they generated?
4. **Check similarities** - Run manual test to see if Q2 2023 chunks are found

## Root Cause Hypothesis

Most likely: **Q2 2023 document exists but has status='processing' or 'failed'**
- Edge function hasn't completed processing
- OR Edge function encountered an error
- System can't query documents with status != 'completed'

Next likely: **Q2 2023 chunks exist but similarity search threshold is too high (0.25)**
- If Q2 2023 info is very different from "net profit" query, similarity might be 0.18
- Could increase threshold or improve question parsing

---

## Verification Steps

1. Go to Supabase console
2. Find documents table
3. Search for Q2 2023
4. Check its status (should be 'completed')
5. If not completed, check for error_message
6. If completed, look at chunks table for that document
7. Read first few characters of chunk.content
8. Should see readable financial text, not binary data
