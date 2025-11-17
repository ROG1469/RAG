// Supabase Edge Function: process-document
// RESPONSIBILITY: Parse PDF/TXT files and create text chunks ONLY
// Does NOT generate embeddings (handled by generate-embeddings function)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { default as pdfParse } from 'npm:pdf-parse@1.1.1'
import mammoth from 'npm:mammoth@1.8.0'

console.log('✅ process-document initialized')

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const documentId = req.headers.get('X-Document-ID')
  const fileType = req.headers.get('X-File-Type')

  try {
    console.log(`📄 Processing: ${documentId} (${fileType})`)

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing document ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse document
    const buffer = await req.arrayBuffer()
    console.log(`📦 ${buffer.byteLength} bytes received`)

    let text: string
    if (fileType?.includes('pdf')) {
      const pdfData = await pdfParse(new Uint8Array(buffer))
      text = pdfData.text
    } else if (fileType?.includes('wordprocessingml')) {
      // Handle DOCX files
      const result = await mammoth.extractRawText({ buffer: new Uint8Array(buffer) })
      text = result.value
    } else if (fileType?.includes('text')) {
      text = new TextDecoder().decode(buffer)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    if (!text?.trim()) {
      throw new Error('No text extracted from document')
    }

    console.log(`✅ Extracted ${text.length} characters`)

    // Chunk text
    const chunks = chunkText(text)
    console.log(`✂️ Created ${chunks.length} chunks`)

    // Store chunks in database
    const chunkIds: string[] = []
    for (let i = 0; i < chunks.length; i++) {
      const { data, error } = await supabase
        .from('chunks')
        .insert({
          document_id: documentId,
          content: chunks[i],
          chunk_index: i,
        })
        .select('id')
        .single()

      if (error) throw new Error(`Chunk insert failed: ${error.message}`)
      chunkIds.push(data.id)
    }

    console.log(`💾 Stored ${chunkIds.length} chunks`)

    // Return chunk IDs for embedding generation
    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunkIds,
        totalChunks: chunks.length,
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

function chunkText(text: string, maxSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 5))
      currentChunk = overlapWords.join(' ') + ' ' + sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
