export interface User {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  filename: string
  file_type: string
  file_size: number
  storage_path: string
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  accessible_by_business_owners: boolean
  accessible_by_employees: boolean
  accessible_by_customers: boolean
  created_at: string
  updated_at: string
}

export interface Chunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface Embedding {
  id: string
  chunk_id: string
  embedding: number[]
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  question: string
  answer: string
  sources: string[] // document IDs
  created_at: string
}

export interface UploadedFile {
  file: File
  preview?: string
}

export interface RAGResponse {
  answer: string
  sources: Array<{
    document_id: string
    filename: string
    chunk_content: string
    relevance_score: number
  }>
}
