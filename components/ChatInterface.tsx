'use client'

import { queryRAG } from '@/app/actions/rag'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import type { RAGResponse } from '@/lib/types/database'

export default function ChatInterface() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<RAGResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    const result = await queryRAG(question)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setResponse(result.data)
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 mb-6">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Question</h3>
            <p className="text-gray-200">{question}</p>
          </div>

          <div className="rounded-lg bg-blue-900/30 p-6 shadow-lg border border-blue-700">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Answer</h3>
            <p className="text-gray-200 whitespace-pre-wrap">{response.answer}</p>
          </div>

          {response.sources.length > 0 && (
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Sources</h3>
              <div className="space-y-3">
                {response.sources.map((source, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 bg-gray-700/50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-200">{source.filename}</p>
                    <p className="text-xs text-gray-400 mt-1">{source.chunk_content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Relevance: {(source.relevance_score * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
