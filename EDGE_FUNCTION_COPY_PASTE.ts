// ⚠️ IMPORTANT: Copy this code into Supabase Dashboard, NOT the file in your project
// Go to: https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions
// Click "Create a new function" → Name: "process-document"
// Paste THIS code (starting from line 1 below):

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.24.1'
import { default as pdfParse } from 'npm:pdf-parse@1.1.1'

console.log('✅ process-document Edge Function started')

serve(async (req: Request) => {
  // Log incoming request
  console.log(`📨 Incoming ${req.method} request`)

  // Only accept POST
  if (req.method !== 'POST') {
    console.log('❌ Not a POST request')
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Get headers
    const documentId = req.headers.get('X-Document-ID')
    const fileType = req.headers.get('X-File-Type')
    
    console.log(`📄 Document ID: ${documentId}`)
    console.log(`📋 File type: ${fileType}`)

    if (!documentId) {
      console.log('❌ Missing document ID')
      return new Response(
        JSON.stringify({ error: 'Missing X-Document-ID header' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get buffer
    const buffer = await req.arrayBuffer()
    console.log(`📦 Received ${buffer.byteLength} bytes`)

    // Get env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase env vars')
      throw new Error('Missing Supabase env vars')
    }

    console.log('✅ Supabase credentials found')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse document
    console.log('🔍 Step 1: Parsing document...')
    let text: string

    if (fileType?.includes('pdf')) {
      try {
        const pdfData = await pdfParse(Buffer.from(buffer))
        text = pdfData.text || ''
        console.log(`✅ PDF parsed: ${text.length} characters extracted`)
      } catch (pdfErr) {
        console.log(`❌ PDF parse error: ${pdfErr}`)
        throw new Error(`PDF parsing failed: ${pdfErr}`)
      }
    } else if (fileType?.includes('text') || fileType?.includes('plain')) {
      text = new TextDecoder().decode(buffer)
      console.log(`✅ Text file read: ${text.length} characters`)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text extracted from document')
    }

    // Chunk text
    console.log('✂️ Step 2: Chunking text...')
    const chunks = chunkText(text)
    console.log(`✅ Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      throw new Error('No chunks created')
    }

    // Generate embeddings
    console.log('🤖 Step 3: Generating embeddings with Gemini...')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.log('❌ Missing GEMINI_API_KEY')
      throw new Error('Missing GEMINI_API_KEY secret')
    }

    console.log('✅ Gemini API key found')
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'embedding-001' })

    const embeddings: number[][] = []
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`📊 Embedding ${i + 1}/${chunks.length}`)
        const result = await model.embedContent(chunks[i])
        embeddings.push(result.embedding.values)
      } catch (embedErr) {
        console.log(`❌ Embedding error at ${i}: ${embedErr}`)
        throw embedErr
      }
    }

    console.log(`✅ Generated ${embeddings.length} embeddings`)

    // Store in database
    console.log('💾 Step 4: Storing chunks and embeddings...')
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
        console.log(`❌ Chunk insert error at ${i}: ${chunkError.message}`)
        throw new Error(`Chunk insert failed: ${chunkError.message}`)
      }

      // Insert embedding
      const { error: embeddingError } = await supabase
        .from('embeddings')
        .insert({
          chunk_id: chunk.id,
          embedding: JSON.stringify(embeddings[i]),
        })

      if (embeddingError) {
        console.log(`❌ Embedding insert error at ${i}: ${embeddingError.message}`)
        throw new Error(`Embedding insert failed: ${embeddingError.message}`)
      }
    }

    console.log(`✅ Stored all ${chunks.length} chunks`)

    // Update status
    console.log('📝 Step 5: Updating document status...')
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId)

    if (updateError) {
      console.log(`❌ Status update error: ${updateError.message}`)
      throw new Error(`Status update failed: ${updateError.message}`)
    }

    console.log(`✅ Document ${documentId} completed successfully!`)

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksStored: chunks.length,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.log(`❌ ERROR: ${error}`)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Try to mark document as failed
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
          console.log(`📝 Marked document as failed`)
        }
      }
    } catch (updateErr) {
      console.log(`⚠️ Could not mark as failed: ${updateErr}`)
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper to chunk text
function chunkText(text: string, maxSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let current = ''
  
  for (const sentence of sentences) {
    if ((current + sentence).length > maxSize && current.length > 0) {
      chunks.push(current.trim())
      
      const words = current.split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 5))
      current = overlapWords.join(' ') + ' ' + sentence
    } else {
      current += sentence
    }
  }
  
  if (current.trim().length > 0) {
    chunks.push(current.trim())
  }
  
  return chunks
}
