// Supabase Edge Function for processing documents
// FOCUSED RESPONSIBILITY: Parse PDF/TXT files and create text chunks ONLY
// Embedding generation is handled by separate generate-embeddings function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { default as pdfParse } from 'npm:pdf-parse@1.1.1'
import mammoth from 'npm:mammoth@1.8.0'
import * as XLSX from 'npm:xlsx@0.18.5'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1'

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
    } else if (fileType?.includes('wordprocessingml')) {
      // DOCX file
      const result = await mammoth.extractRawText({ buffer: new Uint8Array(buffer) })
      text = result.value
      console.log(`✅ Extracted ${text.length} characters from DOCX`)
    } else if (fileType?.includes('text') || fileType?.includes('plain') || fileType?.includes('csv')) {
      text = new TextDecoder().decode(buffer)
      console.log(`✅ Read ${text.length} characters from text/CSV file`)
    } else if (fileType?.includes('spreadsheet') || fileType?.includes('sheet') || fileType?.includes('excel')) {
      // Parse Excel files as STRUCTURED DATA (inspired by Pandas DataFrame approach)
      try {
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
        let excelText = ''

        // Process all sheets with structured data extraction
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          
          // Convert sheet to JSON to preserve structure (like Pandas DataFrame)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Keep as array of arrays
            defval: '', // Default empty cells to empty string
            blankrows: false // Skip blank rows
          })

          if (!jsonData || jsonData.length === 0) {
            console.warn(`Sheet "${sheetName}" is empty, skipping...`)
            continue
          }

          // Build structured text representation
          excelText += `\n\n=== SHEET: ${sheetName} ===\n`
          
          // Get headers (first row)
          const headers = jsonData[0] as any[]
          if (!headers || headers.length === 0) {
            console.warn(`Sheet "${sheetName}" has no headers, skipping...`)
            continue
          }

          excelText += `COLUMNS: ${headers.join(' | ')}\n`
          excelText += `${'='.repeat(80)}\n`

          // Process data rows (skip header row)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            
            // Create row text with column labels for better semantic understanding
            const rowParts: string[] = []
            for (let j = 0; j < headers.length; j++) {
              const header = headers[j]
              const value = row[j] !== undefined && row[j] !== null ? row[j] : ''
              rowParts.push(`${header}: ${value}`)
            }
            
            excelText += `ROW ${i}: ${rowParts.join(', ')}\n`
          }
        }

        if (excelText.trim().length === 0) {
          throw new Error('No content found in Excel file - all sheets are empty')
        }

        text = excelText
        console.log(`✅ Extracted ${text.length} characters from Excel file (${workbook.SheetNames.length} sheet(s) with structured data)`)
      } catch (excelError) {
        console.error('Excel parsing error:', excelError)
        throw new Error('Failed to parse Excel file. Please ensure it contains readable data.')
      }
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
    const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })

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

// Helper function to intelligently chunk text
// Implements semantic chunking for spreadsheets (inspired by P&G case study)
function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  
  // Detect if this is spreadsheet data
  const isSpreadsheetData = text.includes('=== SHEET:')
  
  if (isSpreadsheetData) {
    // SPREADSHEET-SPECIFIC CHUNKING STRATEGY
    // Split by sheets first, then chunk each sheet intelligently
    const sheetSections = text.split(/(?==== SHEET:)/g).filter(s => s.trim().length > 0)
    
    for (const section of sheetSections) {
      const lines = section.split('\n').filter(l => l.trim().length > 0)
      
      // Extract sheet header and column info
      let sheetHeader = ''
      let columnInfo = ''
      let dataStartIndex = 0
      
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        if (lines[i].includes('=== SHEET:')) {
          sheetHeader = lines[i]
          dataStartIndex = i + 1
        } else if (lines[i].includes('COLUMNS:')) {
          columnInfo = lines[i]
          dataStartIndex = Math.max(dataStartIndex, i + 1)
        } else if (lines[i].includes('===')) {
          dataStartIndex = Math.max(dataStartIndex, i + 1)
        }
      }
      
      // Skip past separator lines
      while (dataStartIndex < lines.length && lines[dataStartIndex].trim().match(/^=+$/)) {
        dataStartIndex++
      }
      
      // Chunk the data rows, keeping headers with each chunk
      const dataLines = lines.slice(dataStartIndex)
      let currentChunk = sheetHeader + '\n' + columnInfo + '\n'
      let rowCount = 0
      
      for (const line of dataLines) {
        if (line.startsWith('ROW')) {
          // If adding this row exceeds max size, save current chunk
          if (currentChunk.length + line.length > maxChunkSize && rowCount > 0) {
            chunks.push(currentChunk.trim())
            // Start new chunk with headers
            currentChunk = sheetHeader + '\n' + columnInfo + '\n' + line + '\n'
            rowCount = 1
          } else {
            currentChunk += line + '\n'
            rowCount++
          }
        } else {
          currentChunk += line + '\n'
        }
      }
      
      // Save last chunk for this sheet
      if (currentChunk.trim().length > sheetHeader.length + columnInfo.length) {
        chunks.push(currentChunk.trim())
      }
    }
    
    return chunks.filter(c => c.length > 0)
  }
  
  // REGULAR TEXT/PDF CHUNKING STRATEGY
  // For non-spreadsheet data, split by sentences for prose
  let parts: string[] = []
  
  // For regular text/PDFs, split by sentences
  parts = text.match(/[^.!?\n]+[.!?\n]+/g) || [text]
  
  let currentChunk = ''
  
  for (const part of parts) {
    const trimmedPart = part.trim()
    if (!trimmedPart) continue
    
    // If this part alone is larger than maxChunkSize, split it further
    if (trimmedPart.length > maxChunkSize) {
      // Save current chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim())
      }
      
      // Split large part into smaller pieces
      const largeChunks = splitLargeText(trimmedPart, maxChunkSize)
      chunks.push(...largeChunks)
      currentChunk = ''
    } else if ((currentChunk + ' ' + trimmedPart).length > maxChunkSize && currentChunk.length > 0) {
      // Current chunk would exceed size, save it
      chunks.push(currentChunk.trim())
      
      // Add overlap for context continuity
      const words = currentChunk.split(/\s+/)
      const overlapWords = words.slice(-Math.floor(overlap / 5))
      currentChunk = overlapWords.join(' ') + ' ' + trimmedPart
    } else {
      // Add to current chunk
      currentChunk += (currentChunk ? ' ' : '') + trimmedPart
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.filter(c => c.length > 0)
}

// Helper to split very large text blocks
function splitLargeText(text: string, maxSize: number): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    let end = start + maxSize
    
    // Try to break at a newline or space for better semantics
    if (end < text.length) {
      const lastNewline = text.lastIndexOf('\n', end)
      const lastSpace = text.lastIndexOf(' ', end)
      const breakPoint = Math.max(lastNewline, lastSpace)
      
      if (breakPoint > start + 100) { // Only use if we're not too close to start
        end = breakPoint
      }
    }
    
    chunks.push(text.substring(start, end).trim())
    start = end
  }
  
  return chunks
}
