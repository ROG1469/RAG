// Supabase Edge Function for processing documents
// FOCUSED RESPONSIBILITY: Parse PDF/TXT files and create text chunks ONLY
// Embedding generation is handled by separate generate-embeddings function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { default as pdfParse } from 'npm:pdf-parse@1.1.1'

console.log('✅ process-document Edge Function initialized')

serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const documentId = req.headers.get('X-Document-ID')
    const fileType = req.headers.get('X-File-Type')
    
    console.log(`📄 Processing document: ${documentId}, type: ${fileType}`)

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing document ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read file buffer
    const buffer = await req.arrayBuffer()
    console.log(`📦 Received ${buffer.byteLength} bytes`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // STEP 1: Parse document text
    console.log('🔍 Step 1: Parsing document...')
    let text: string

    if (fileType?.includes('pdf')) {
      const pdfData = await pdfParse(new Uint8Array(buffer))
      text = pdfData.text
      console.log(`✅ Extracted ${text.length} characters from PDF`)
    } else if (fileType?.includes('text')) {
      text = new TextDecoder().decode(buffer)
      console.log(`✅ Read ${text.length} characters from text file`)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from document')
    }

    // STEP 2: Chunk text into manageable pieces
    console.log('✂️ Step 2: Chunking text...')
    const chunks = chunkText(text)
    console.log(`✅ Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      throw new Error('Failed to create text chunks')
    }

    // Step 3: Generate embeddings with Gemini
    console.log('[Edge] Step 3: Generating embeddings...')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      throw new Error('Missing GEMINI_API_KEY')
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'embedding-001' })

    const embeddings: number[][] = []
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[Edge] Generating embedding ${i + 1}/${chunks.length}`)
      const result = await model.embedContent(chunks[i])
      embeddings.push(result.embedding.values)
    }

    console.log(`[Edge] Generated ${embeddings.length} embeddings`)

    // Step 4: Store chunks and embeddings
    console.log('[Edge] Step 4: Storing chunks and embeddings...')
    for (let i = 0; i < chunks.length; i++) {
      // Insert chunk
      const { data: chunk, error: chunkError } = await supabase
        .from('chunks')
        .insert({
          document_id: documentId,
          content: chunks[i],
          chunk_index: i,
        })
        .select()
        .single()

      if (chunkError) {
        console.error(`[Edge] Chunk insert error at index ${i}:`, chunkError)
        throw new Error(`Failed to store chunk ${i}: ${chunkError.message}`)
      }

      // Insert embedding
      const { error: embeddingError } = await supabase
        .from('embeddings')
        .insert({
          chunk_id: chunk.id,
          embedding: JSON.stringify(embeddings[i]),
        })

      if (embeddingError) {
        console.error(`[Edge] Embedding insert error at index ${i}:`, embeddingError)
        throw new Error(`Failed to store embedding ${i}: ${embeddingError.message}`)
      }
    }

    console.log(`[Edge] Successfully stored all ${chunks.length} chunks`)

    // Step 5: Update document status
    console.log('[Edge] Step 5: Updating document status...')
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Failed to update document status: ${updateError.message}`)
    }

    console.log(`[Edge] ✅ Document ${documentId} processed successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksStored: chunks.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Edge] ❌ Processing error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Try to update document status to failed
    try {
      const documentId = req.headers.get('X-Document-ID')
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey)
          await supabase
            .from('documents')
            .update({
              status: 'failed',
              error_message: errorMessage,
            })
            .eq('id', documentId)
        }
      }
    } catch (updateError) {
      console.error('[Edge] Failed to update document status:', updateError)
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to chunk text
function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      
      // Add overlap by taking last few words
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 5))
      currentChunk = overlapWords.join(' ') + ' ' + sentence
    } else {
      currentChunk += sentence
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}
