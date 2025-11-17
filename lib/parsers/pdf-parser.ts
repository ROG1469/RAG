// Use require for CommonJS module compatibility
const pdfParse = require('pdf-parse')

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF Parser] Parsing PDF, buffer size:', buffer.length)
    const data = await pdfParse(buffer)
    console.log('[PDF Parser] Successfully extracted', data.text.length, 'characters')
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no text (might be scanned images)')
    }
    
    return data.text
  } catch (error) {
    console.error('[PDF Parser] Error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF: ${error.message}`)
    }
    throw new Error('Failed to parse PDF file')
  }
}
