'use client'

import { queryRAG } from '@/app/actions/rag'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Copy, Check } from 'lucide-react'
import type { RAGResponse } from '@/lib/types/database'

interface ChatInterfaceProps {
  onQueryComplete?: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: RAGResponse['sources']
}

export default function ChatInterface({}: ChatInterfaceProps = {}) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  async function copyToClipboard(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || loading) return

    const currentQuestion = question
    setQuestion('')
    setLoading(true)

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: currentQuestion }])

    const result = await queryRAG(currentQuestion)

    if (result.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${result.error}` }])
    } else if (result.data) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.data!.answer,
        sources: result.data!.sources 
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg">Ask a question to start chatting</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>

              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`rounded-2xl px-6 py-4 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'
                  }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(msg.content, idx)}
                  className="text-xs px-2 py-1 text-gray-500 hover:text-gray-300 flex items-center gap-1"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>

                {/* Sources for Assistant Messages */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-sm max-w-full">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sources</p>
                    <div className="space-y-2">
                      {msg.sources.map((source, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-gray-300 bg-gray-900/50 p-2 rounded">
                          <div className="w-1 h-full min-h-3 bg-blue-500 rounded-full shrink-0 mt-1" />
                          <div>
                            <p className="font-medium text-blue-400 text-xs">{source.filename}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{source.chunk_content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 border border-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about your documents..."
            className="w-full bg-gray-800 text-gray-100 rounded-2xl pl-6 pr-14 py-4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder-gray-500 shadow-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-3">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  )
}
