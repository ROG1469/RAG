// Supabase Edge Function: generate-embeddings
// RESPONSIBILITY: Generate vector embeddings for document chunks using Gemini API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.24.1'

console.log('✅ generate-embeddings initialized')

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const documentId = req.headers.get('X-Document-ID')

  try {
    if (!documentId) {
      console.error('❌ Missing document ID in header')
      return new Response(
        JSON.stringify({ error: 'Missing document ID in X-Document-ID header' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🤖 Generating embeddings for: ${documentId}`)

    // Initialize Supabase and Gemini
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })

    // Get all chunks for this document
    const { data: chunks, error: fetchError } = await supabase
      .from('chunks')
      .select('id, content, chunk_index')
      .eq('document_id', documentId)
      .order('chunk_index')

    if (fetchError) throw new Error(`Failed to fetch chunks: ${fetchError.message}`)
    if (!chunks || chunks.length === 0) throw new Error('No chunks found')

    console.log(`📦 Found ${chunks.length} chunks to embed`)

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`🔢 Embedding chunk ${i + 1}/${chunks.length}`)

      const result = await model.embedContent(chunk.content)
      const embedding = result.embedding.values

      // Store embedding
      const { error: insertError } = await supabase
        .from('embeddings')
        .insert({
          chunk_id: chunk.id,
          embedding: JSON.stringify(embedding),
        })

      if (insertError) {
        console.error(`❌ Embedding insert failed for chunk ${chunk.id}:`, insertError)
        throw new Error(`Failed to store embedding: ${insertError.message}`)
      }
    }

    // Update document status to completed
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId)

    if (updateError) throw new Error(`Status update failed: ${updateError.message}`)

    console.log(`✅ Generated ${chunks.length} embeddings successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        embeddingsGenerated: chunks.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update document status to failed
    try {
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase
          .from('documents')
          .update({ status: 'failed', error_message: errorMessage })
          .eq('id', documentId)
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
