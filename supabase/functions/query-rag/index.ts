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

    // STEP 3 — Fetch chunks + embeddings
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
      .in("document_id", documentIds);

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No processed chunks found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`🔍 Found ${chunks.length} chunks to search`);

    // STEP 4 — Compute similarities
    const scored = chunks
      .map((item: any) => {
        const rawEmbedding = item.embeddings?.[0]?.embedding;

        // Ensure vector is parsed correctly
        const embeddingArray =
          typeof rawEmbedding === "string"
            ? JSON.parse(rawEmbedding)
            : rawEmbedding;

        return {
          chunk_id: item.id,
          content: item.content,
          document_id: item.document_id,
          filename: item.documents?.filename ?? "Unknown",
          similarity: cosineSimilarity(questionEmbedding, embeddingArray),
        };
      })
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 5);

    console.log(`✅ Top similarity: ${scored[0]?.similarity.toFixed(3)}`);

    // STEP 5 — Generate answer using Gemini
    console.log("🤖 Generating answer...");

    const answerModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const context = scored.map((c: any) => c.content).join("\n\n---\n\n");

    const prompt = `
You are a helpful AI assistant.

Answer ONLY using the following context.  
If the answer is not in the context, say:
"I don't have enough information to answer that."

Context:
${context}

Question: ${question}

Answer:
    `;

    const result = await answerModel.generateContent(prompt);
    const answer = result.response.text();

    console.log(`✅ Answer generated (${answer.length} chars)`);

    // STEP 6 — Save chat history
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

// Cosine similarity helper
function cosineSimilarity(a: number[], b: number[]) {
  if (!a || !b || a.length !== b.length) return 0;

  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
