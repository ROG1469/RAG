'use client'

import { deleteDocument } from '@/app/actions/documents'
import type { Document } from '@/lib/types/database'
import { FileText, Trash2, Clock, CheckCircle, XCircle, Loader2, CheckSquare, Square, AlertTriangle, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocumentList({ documents }: { documents: Document[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Auto-refresh every 3 seconds if any documents are processing
  useEffect(() => {
    const hasProcessing = documents.some(doc => doc.status === 'processing')
    if (hasProcessing) {
      const interval = setInterval(() => {
        router.refresh()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [documents, router])

  async function confirmDelete() {
    if (!docToDelete) return

    try {
      setDeleting(docToDelete)
      const result = await deleteDocument(docToDelete)

      if (result.error) {
        alert(`Failed to delete: ${result.error}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An unexpected error occurred while deleting')
    } finally {
      setDeleting(null)
      setDocToDelete(null)
      if (selectedDocs.has(docToDelete)) {
        const newSelected = new Set(selectedDocs)
        newSelected.delete(docToDelete)
        setSelectedDocs(newSelected)
      }
    }
  }

  async function confirmBulkDelete() {
    if (selectedDocs.size === 0) return

    try {
      setBulkDeleting(true)
      
      // Delete documents one by one
      for (const docId of Array.from(selectedDocs)) {
        const result = await deleteDocument(docId)
        if (result.error) {
          alert(`Failed to delete document: ${result.error}`)
          break
        }
      }
      
      setSelectedDocs(new Set())
      router.refresh()
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('An unexpected error occurred while deleting documents')
    } finally {
      setBulkDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  function toggleSelectAll() {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set())
    } else {
      setSelectedDocs(new Set(filteredDocuments.map(d => d.id)))
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedDocs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDocs(newSelected)
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
    <>
      <div className="space-y-4">
        {/* Search and Bulk Actions Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors shrink-0"
            >
              {selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-blue-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
              Select All
            </button>
            <span className="text-sm text-slate-500 shrink-0">
              {selectedDocs.size} selected
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
              />
            </div>

            {selectedDocs.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
              >
                {bulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden bg-gray-800 shadow-lg sm:rounded-lg border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {filteredDocuments.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">
                No documents found matching &quot;{searchQuery}&quot;
              </li>
            ) : (
              filteredDocuments.map((doc) => {
                const isSelected = selectedDocs.has(doc.id)
                return (
                  <li key={doc.id} className={`px-4 py-4 sm:px-6 hover:bg-gray-700/50 transition-colors ${isSelected ? 'bg-blue-900/10' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1 gap-4">
                        <button
                          onClick={() => toggleSelect(doc.id)}
                          className="shrink-0 text-slate-400 hover:text-blue-400 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <FileText className="h-8 w-8 text-blue-400 shrink-0" />
                        <div className="min-w-0 flex-1">
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
                          onClick={() => setDocToDelete(doc.id)}
                          disabled={deleting === doc.id}
                          className="inline-flex items-center p-2 border border-transparent rounded-full text-red-400 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete Document?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this document? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting === docToDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting === docToDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete {selectedDocs.size} Documents?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete these {selectedDocs.size} documents? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
