'use client'

import { useState } from 'react'
import { queryRAG } from '@/app/actions/rag'
import { Send, Loader2, Bot } from 'lucide-react'
import type { RAGResponse } from '@/lib/types/database'
import ChatHistorySidebar from './ChatHistorySidebar'

interface ChatHistoryItem {
  id: string
  question: string
  answer: string
  sources: Array<{
    document_id: string
    filename: string
    chunk_content: string
    relevance_score: number
  }>
  created_at: string
}

interface NewDashboardContentProps {
  userRole: string
}

export default function NewDashboardContent({ userRole }: NewDashboardContentProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant'
    content: string
    sources?: RAGResponse['sources']
  }>>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    // Add user message
    const userMessage = question
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setQuestion('')
    setLoading(true)

    const result = await queryRAG(userMessage)

    if (result.error) {
      setMessages(prev => [...prev, { type: 'assistant', content: `Error: ${result.error}` }])
    } else if (result.data) {
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: result.data!.answer,
        sources: result.data!.sources 
      }])
      // Trigger chat history refresh
      setRefreshTrigger(prev => prev + 1)
    }

    setLoading(false)
  }

  function handleHistoryClick(item: ChatHistoryItem) {
    // Load the previous conversation
    setMessages([
      { type: 'user', content: item.question },
      { type: 'assistant', content: item.answer, sources: item.sources }
    ])
  }

  // Show chat history only for business owner and employee
  const showChatHistory = userRole === 'business_owner' || userRole === 'employee'

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center">
              <div className="bg-slate-800/50 p-8 rounded-full mb-6">
                <Bot className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-xl text-gray-300 mb-2">Ask a question to start chatting</p>
              <p className="text-sm text-gray-500">I&apos;ll search through your documents to find answers</p>
            </div>
          ) : (
            // Messages
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-gray-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Sources (for assistant messages) */}
                    {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-gray-400 mb-2 font-semibold">Sources:</p>
                        <div className="space-y-2">
                          {message.sources.map((source, sourceIdx) => (
                            <div key={sourceIdx} className="text-xs bg-slate-900/50 rounded p-2">
                              <p className="font-medium text-gray-300">{source.filename}</p>
                              <p className="text-gray-500 mt-1">{source.chunk_content.substring(0, 100)}...</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-gray-200 rounded-2xl px-6 py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about your documents..."
                  className="w-full rounded-full border border-slate-700 bg-slate-800 text-gray-200 placeholder-gray-500 pl-6 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
            <p className="text-xs text-center text-gray-500">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chat History */}
      {showChatHistory && (
        <aside className="w-72 border-l border-slate-800">
          <ChatHistorySidebar 
            refreshTrigger={refreshTrigger} 
            onQuestionClick={handleHistoryClick}
          />
        </aside>
      )}
    </div>
  )
}
