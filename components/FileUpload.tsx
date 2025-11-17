'use client'

import { uploadDocument } from '@/app/actions/documents'
import { useState } from 'react'
import { Upload, File, X } from 'lucide-react'

export default function FileUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) return
    
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    console.log('[FileUpload] Starting upload for:', selectedFile?.name)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const formData = new FormData(e.currentTarget)
      console.log('[FileUpload] Calling uploadDocument...')
      const result = await uploadDocument(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)

        if (result.error) {
          console.error('[FileUpload] Upload failed:', result.error)
          setError(result.error)
        } else {
          console.log('[FileUpload] Upload successful, document ID:', result.documentId)
          e.currentTarget?.reset()
          setSelectedFile(null)
          onUploadComplete?.()
        }
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('[FileUpload] Upload error:', err)
      setError(errorMsg)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  function clearSelectedFile() {
    setSelectedFile(null)
    const input = document.getElementById('file') as HTMLInputElement
    if (input) input.value = ''
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      const input = document.getElementById('file') as HTMLInputElement
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'
        } bg-gray-800`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-200">
              Drop a file here or click to upload
            </span>
            <input
              id="file"
              name="file"
              type="file"
              className="sr-only"
              accept=".pdf,.docx,.xlsx,.xls,.txt"
              onChange={handleFileChange}
              required
            />
          </label>
          <p className="mt-1 text-xs text-gray-400">
            PDF, DOCX, XLSX, or TXT (max 10MB)
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-700 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-200">{selectedFile.name}</span>
              <span className="text-xs text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={clearSelectedFile}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{uploadProgress}% uploaded</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 rounded-md bg-red-900/50 border-2 border-red-700 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">Upload Failed</p>
                <p className="text-xs text-red-300 mt-1 whitespace-pre-wrap">{error}</p>
                <p className="text-xs text-red-400 mt-2 italic">💡 Open browser console (F12) for detailed logs</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  )
}
