// Supabase Edge Function: query-rag
// RESPONSIBILITY: Handle RAG queries - embed question, search, generate answer
/* eslint-disable @typescript-eslint/no-explicit-any */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";

console.log("✅ query-rag initialized");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { question, userId, customerMode } = await req.json();
    console.log(`💬 Query from user ${userId}: "${question}" (customerMode: ${customerMode})`);

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Missing question" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(geminiKey);

    // STEP 1 — Generate embedding for question
    console.log("🔢 Generating question embedding...");

    const embeddingModel = genAI.getGenerativeModel({
      model: "models/text-embedding-004",
    });

    const embedResult = await embeddingModel.embedContent(question);
    const questionEmbedding = embedResult.embedding.values;

    // STEP 2 — Get documents based on mode
    let documentIds: string[] = [];

    if (customerMode) {
      // Customer mode: only accessible_by_customers documents
      const { data: customerDocs } = await supabase
        .from("documents")
        .select("id")
        .eq("accessible_by_customers", true)
        .eq("status", "completed");

      documentIds = customerDocs?.map((d: any) => d.id) || [];
      console.log(`🌍 Customer mode: Searching ${documentIds.length} customer-accessible documents`);
    } else if (userId) {
      // User mode: user's own documents (filtered by role permissions at query time)
      const { data: userDocuments } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");

      documentIds = userDocuments?.map((d: any) => d.id) || [];
      console.log(`👤 User mode: Searching ${documentIds.length} user documents`);
    }

    if (documentIds.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No documents available. Upload and process documents first.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 3 — Fetch chunks + embeddings with proper limit
    const { data: chunks } = await supabase
      .from("chunks")
      .select(
        `
      id,
      content,
      document_id,
      documents(filename),
      embeddings(embedding)
    `
      )
      .in("document_id", documentIds)
      .limit(1000); // Explicit limit to ensure we fetch all available chunks

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No processed chunks found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🔍 Found ${chunks.length} chunks to search`);

    // STEP 4 — Validate embeddings exist
    let validChunks = 0;
    let missingEmbeddingCount = 0;
    
    chunks.forEach((item: any) => {
      if (item.embeddings && item.embeddings.length > 0) {
        validChunks++;
      } else {
        missingEmbeddingCount++;
        console.warn(`⚠️ Chunk ${item.id} missing embedding!`);
      }
    });
    
    console.log(`📊 Valid chunks with embeddings: ${validChunks}/${chunks.length} (${missingEmbeddingCount} missing)`);

    if (validChunks === 0) {
      return new Response(
        JSON.stringify({
          error: "No embeddings found for document chunks. Documents may not have been processed correctly.",
          answer: "I cannot search the documents because they have not been properly processed with embeddings yet. Please re-upload your documents.",
          sources: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 5 — Parse multi-part question and run similarity searches
    console.log(`💬 Analyzing question for multiple parts...`);
    const queryParts = parseMultiPartQuestion(question);
    console.log(`📋 Found ${queryParts.length} question part(s): ${queryParts.map(p => `"${p.substring(0, 30)}..."`).join(', ')}`);
    
    // Log document distribution for debugging
    const docTypes = chunks.reduce((acc: any, item: any) => {
      const filename = item.documents?.filename ?? "Unknown";
      acc[filename] = (acc[filename] || 0) + 1;
      return acc;
    }, {});
    console.log(`📂 Documents in search space:`, Object.entries(docTypes).map(([name, count]) => `${name} (${count} chunks)`).join(", "));

    let allScored: any[] = [];
    const processedParts = new Set<string>();

    for (const part of queryParts) {
      if (processedParts.has(part.toLowerCase())) continue;
      processedParts.add(part.toLowerCase());

      console.log(`🔍 Searching for: "${part}"`);
      
      // Generate embedding for this part
      const partEmbedResult = await embeddingModel.embedContent(part);
      const partEmbedding = partEmbedResult.embedding.values;

      // Calculate similarities for this part
      const scoredChunks = chunks
        .filter((item: any) => item.embeddings && item.embeddings.length > 0) // Only valid chunks
        .map((item: any) => {
          const rawEmbedding = item.embeddings[0].embedding;
          const embeddingArray = typeof rawEmbedding === "string"
            ? JSON.parse(rawEmbedding)
            : rawEmbedding;

          return {
            chunk_id: item.id,
            content: item.content,
            document_id: item.document_id,
            filename: item.documents?.filename ?? "Unknown",
            similarity: cosineSimilarity(partEmbedding, embeddingArray),
            query_part: part,
          };
        })
        .sort((a: any, b: any) => b.similarity - a.similarity);

      // For multi-part questions, be more aggressive: get more chunks and lower threshold
      const isMultiPart = queryParts.length > 1;
      const threshold = isMultiPart ? 0.15 : 0.25; // Lower threshold for multi-part to catch all relevant info
      const resultsLimit = isMultiPart ? 15 : 10; // Get more results for multi-part questions
      
      const partScored = scoredChunks
        .filter((item: any) => item.similarity >= threshold)
        .slice(0, resultsLimit);

      console.log(`  → Found ${partScored.length} relevant chunks (multi-part: ${isMultiPart}, threshold: ${threshold}), top similarity: ${scoredChunks[0]?.similarity.toFixed(3) ?? 'N/A'}`);
      
      // Log which documents these chunks come from
      if (partScored.length > 0) {
        const sourceCount = new Set(partScored.map((c: any) => c.filename)).size;
        console.log(`  → From ${sourceCount} document(s): ${Array.from(new Set(partScored.map((c: any) => c.filename))).join(", ")}`);
        console.log(`  → Similarity range: ${Math.min(...partScored.map((c: any) => c.similarity)).toFixed(3)} to ${Math.max(...partScored.map((c: any) => c.similarity)).toFixed(3)}`);
      }
      
      allScored.push(...partScored);
    }

    // Remove duplicates, keep highest similarity
    const uniqueScored = Array.from(
      allScored
        .reduce((map, item) => {
          const key = item.chunk_id;
          const existing = map.get(key);
          if (!existing || item.similarity > existing.similarity) {
            map.set(key, item);
          }
          return map;
        }, new Map<string, any>())
        .values()
    ).sort((a: any, b: any) => b.similarity - a.similarity);

    console.log(`✅ Total unique chunks selected: ${uniqueScored.length}`);
    if (uniqueScored.length > 0) {
      const topItem = uniqueScored[0] as any;
      console.log(`  → Top similarity: ${topItem.similarity.toFixed(3)}`);
    }
    
    const scored = uniqueScored;

    if (scored.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No relevant information found in documents. Please try a different question or upload more documents.",
          answer: "I could not find any relevant information to answer your question in the available documents.",
          sources: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 6 — Generate answer using Gemini with improved prompt
    console.log("🤖 Generating answer...");

    const answerModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const context = scored.map((c: any) => c.content).join("\n\n---\n\n");

    // Build structured context with source info for transparency
    const contextWithSources = scored
      .map((c: any, i: number) => `[Source ${i + 1} - ${c.filename}]\n${c.content}`)
      .join("\n\n---\n\n");

    const prompt = `You are a professional business assistant that answers questions using provided context.

CRITICAL INSTRUCTIONS:
1. Answer ALL parts of multi-part questions separately if information exists in the context
2. For questions with multiple topics (e.g., "paydays AND contact details AND summary"), answer EACH topic separately
3. If you cannot find information for a specific part, explicitly state: "I do not have information about [that specific topic]"
4. Use PLAIN PROFESSIONAL TEXT ONLY - NO markdown, NO asterisks, NO special formatting
5. Structure your answer clearly with line breaks between different parts
6. Be concise, factual, and complete - address every part asked

FORMATTING RULES:
- Do NOT use ** or ** for emphasis
- Do NOT use # for headers
- Do NOT use - or * for lists
- Use plain text with numbered items: "1. ", "2. ", etc.
- Use line breaks to separate sections
- Keep formatting professional and simple

Provided Context:
${contextWithSources}

Question: ${question}

Answer (plain professional text, addressing ALL parts of the question):`;

    const result = await answerModel.generateContent(prompt);
    const answer = result.response.text();

    console.log(`✅ Answer generated (${answer.length} chars)`);
    console.log(`📝 Used ${scored.length} context chunks`);
    console.log(`🎯 Covered ${queryParts.length} question parts`);

    // STEP 7 — Save chat history
    const sourceDocumentIds = [...new Set(scored.map((c: any) => c.document_id))];

    await supabase.from("chat_history").insert({
      user_id: userId,
      question,
      answer,
      sources: sourceDocumentIds,
    });

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        sources: scored.map((c: any) => ({
          document_id: c.document_id,
          filename: c.filename,
          chunk_content: c.content.substring(0, 200) + "...",
          relevance_score: c.similarity,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error:", error);

    return new Response(
      JSON.stringify({
        error: (error as Error)?.message ?? "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Parse multi-part questions into individual search queries
function parseMultiPartQuestion(question: string): string[] {
  // Split by common separators
  const separators = [' and ', ' AND ', ' also ', ' ALSO ', '; ', ','];
  let parts = [question];

  for (const sep of separators) {
    parts = parts.flatMap(part => part.split(sep));
  }

  // Clean and filter
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 3) // Ignore very short fragments
    .map(p => {
      // Remove question marks and extra whitespace
      return p.replace(/^\s*\?+\s*|\s*\?+\s*$/g, '').trim();
    })
    .filter(p => p.length > 0);
}

// Cosine similarity helper with validation
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b) {
    console.warn('⚠️ Cosine similarity: One or both vectors undefined');
    return 0;
  }

  if (a.length !== b.length) {
    console.warn(`⚠️ Cosine similarity: Vector length mismatch (${a.length} vs ${b.length})`);
    return 0;
  }

  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    console.warn('⚠️ Cosine similarity: Zero denominator');
    return 0;
  }

  return dot / denominator;
}
