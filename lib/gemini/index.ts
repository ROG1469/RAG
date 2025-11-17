import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Generate embedding for text using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' })
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error('Failed to generate embedding')
  }
}

// Generate embeddings for multiple texts (batch processing)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  
  for (const text of texts) {
    const embedding = await generateEmbedding(text)
    embeddings.push(embedding)
  }
  
  return embeddings
}

// Generate answer using Gemini with context
export async function generateAnswer(question: string, context: string[]): Promise<string> {
  try {
    // Use the correct model name for Gemini 1.5 Pro
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro-latest' })
    
    const prompt = `You are a helpful AI assistant. Answer the question based ONLY on the provided context. If the answer cannot be found in the context, say "I don't have enough information to answer that question."

Context:
${context.join('\n\n---\n\n')}

Question: ${question}

Answer:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Answer generation error:', error)
    throw new Error('Failed to generate answer')
  }
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
