import { parsePDF } from './pdf-parser'
import { parseDOCX } from './docx-parser'
import { parseExcel } from './excel-parser'
import { parseTXT } from './txt-parser'

export async function parseDocument(buffer: Buffer, fileType: string): Promise<string> {
  const lowerType = fileType.toLowerCase()

  if (lowerType.includes('pdf')) {
    return parsePDF(buffer)
  } else if (lowerType.includes('word') || lowerType.includes('document') || fileType.endsWith('.docx')) {
    return parseDOCX(buffer)
  } else if (lowerType.includes('sheet') || lowerType.includes('excel') || fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
    return parseExcel(buffer)
  } else if (lowerType.includes('text') || fileType.endsWith('.txt')) {
    return parseTXT(buffer)
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}

// Chunk text into smaller pieces for better RAG performance
export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
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
