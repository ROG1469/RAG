export async function parseTXT(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8')
  } catch (error) {
    console.error('TXT parsing error:', error)
    throw new Error('Failed to parse TXT file')
  }
}
