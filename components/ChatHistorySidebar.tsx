'use client'

import { useEffect, useState } from 'react'
import { getChatHistory } from '@/app/actions/rag'
import { MessageSquare, Clock, ChevronRight } from 'lucide-react'

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

interface ChatHistorySidebarProps {
  onQuestionClick?: (item: ChatHistoryItem) => void
  refreshTrigger?: number // When this changes, refresh the history
}

export default function ChatHistorySidebar({ onQuestionClick, refreshTrigger }: ChatHistorySidebarProps) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      const result = await getChatHistory()
      if (result.data) {
        setHistory(result.data as ChatHistoryItem[])
      }
      setLoading(false)
    }
    loadHistory()
  }, [refreshTrigger]) // Re-run when refreshTrigger changes

  async function refreshHistory() {
    setLoading(true)
    const result = await getChatHistory()
    if (result.data) {
      setHistory(result.data as ChatHistoryItem[])
    }
    setLoading(false)
  }

  function handleQuestionClick(item: ChatHistoryItem) {
    setSelectedId(item.id)
    if (onQuestionClick) {
      onQuestionClick(item)
    }
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  function truncateText(text: string, maxLength: number = 60) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </h2>
          <button
            onClick={refreshHistory}
            disabled={loading}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {history.length} conversation{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
            No chat history yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuestionClick(item)}
                className={`w-full p-3 text-left hover:bg-gray-700/50 transition-colors ${
                  selectedId === item.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 font-medium wrap-break-word">
                      {truncateText(item.question)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(item.created_at)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
