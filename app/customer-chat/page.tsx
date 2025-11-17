'use client'

import { useState } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'

export default function CustomerChatPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<{
    answer: string
    sources: Array<{
      filename: string
      chunk_content: string
      relevance_score: number
    }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactInfo, setContactInfo] = useState({ name: '', email: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)
    setShowContactForm(false)

    try {
      const res = await fetch('/api/customer-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else if (data.noAnswer) {
        // No answer found - show contact form
        setShowContactForm(true)
      } else {
        setResponse(data)
      }
    } catch {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      await fetch('/api/customer-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          name: contactInfo.name,
          email: contactInfo.email,
        }),
      })

      setContactSubmitted(true)
    } catch {
      setError('Failed to submit contact information')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-200">Customer Support Chat</h1>
              <p className="text-sm text-gray-400">Ask questions about our products and services</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask us anything..."
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-lg bg-red-900/50 border border-red-700 p-4 mb-6">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {showContactForm && !contactSubmitted && (
          <div className="rounded-lg bg-yellow-900/30 border border-yellow-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-200 mb-2">
              Thank you for your query
            </h3>
            <p className="text-yellow-100 mb-4">
              I&apos;m unable to provide an answer right now. Can you provide your name and email? We&apos;ll get back to you within 24 hours.
            </p>
            
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                required
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your email"
                required
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {contactSubmitted && (
          <div className="rounded-lg bg-green-900/50 border border-green-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-200 mb-2">
              Thank you!
            </h3>
            <p className="text-green-100">
              We&apos;ve received your information and will get back to you within 24 hours.
            </p>
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Your Question</h3>
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

        {!response && !showContactForm && !error && !loading && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Ask us a question and we&apos;ll help you find the answer</p>
          </div>
        )}
      </main>
    </div>
  )
}
