import * as XLSX from 'xlsx'

export async function parseExcel(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let text = ''

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const sheetText = XLSX.utils.sheet_to_txt(worksheet)
      text += `\n\n=== Sheet: ${sheetName} ===\n${sheetText}`
    })

    return text.trim()
  } catch (error) {
    console.error('Excel parsing error:', error)
    throw new Error('Failed to parse Excel file')
  }
}
