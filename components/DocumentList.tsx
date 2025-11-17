'use client'

import { deleteDocument } from '@/app/actions/documents'
import type { Document } from '@/lib/types/database'
import { FileText, Trash2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocumentList({ documents }: { documents: Document[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  
  // Auto-refresh every 3 seconds if any documents are processing
  useEffect(() => {
    const hasProcessing = documents.some(doc => doc.status === 'processing')
    if (hasProcessing) {
      console.log('[DocumentList] Documents are processing, will auto-refresh...')
      const interval = setInterval(() => {
        router.refresh()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [documents, router])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    setDeleting(id)
    await deleteDocument(id)
    setDeleting(null)
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Ready
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing...
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700 text-gray-400 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        )
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
        <FileText className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-300">No documents</h3>
        <p className="mt-1 text-sm text-gray-400">Upload your first document to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-gray-800 shadow-lg sm:rounded-lg border border-gray-700">
      <ul className="divide-y divide-gray-700">
        {documents.map((doc) => (
          <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <FileText className="h-8 w-8 text-blue-400 shrink-0" />
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {doc.filename}
                    </p>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                  </p>
                  {doc.error_message && (
                    <p className="text-sm text-red-400 mt-1 bg-red-900/30 px-2 py-1 rounded">{doc.error_message}</p>
                  )}
                </div>
              </div>
              <div className="ml-5 flex items-center space-x-2">
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="inline-flex items-center p-2 border border-transparent rounded-full text-red-400 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
