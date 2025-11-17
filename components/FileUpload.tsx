'use client'

import { uploadDocument } from '@/app/actions/documents'
import { useState, useRef } from 'react'
import { Upload, File as FileIcon, X, CheckCircle2 } from 'lucide-react'

export default function FileUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set())
  const [permissions, setPermissions] = useState({
    business_owners: true,
    employees: false,
    customers: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAreaClick() {
    fileInputRef.current?.click()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    setError(null)

    console.log('[FileUpload] Starting upload for', selectedFiles.length, 'file(s)')

    for (const file of selectedFiles) {
      setUploadingFiles(prev => new Set([...prev, file.name]))
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        // Add permission settings to FormData
        formData.append('accessible_by_employees', String(permissions.employees))
        formData.append('accessible_by_customers', String(permissions.customers))
        
        console.log('[FileUpload] Uploading:', file.name, 'with permissions:', permissions)
        const result = await uploadDocument(formData)

        if (result.error) {
          console.error('[FileUpload] Upload failed for', file.name, ':', result.error)
          setError(`${file.name}: ${result.error}`)
          setUploadingFiles(prev => {
            const next = new Set(prev)
            next.delete(file.name)
            return next
          })
          break
        } else {
          console.log('[FileUpload] Upload successful for', file.name)
          setCompletedFiles(prev => new Set([...prev, file.name]))
          setUploadingFiles(prev => {
            const next = new Set(prev)
            next.delete(file.name)
            return next
          })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
        console.error('[FileUpload] Upload error:', err)
        setError(`${file.name}: ${errorMsg}`)
        setUploadingFiles(prev => {
          const next = new Set(prev)
          next.delete(file.name)
          return next
        })
        break
      }
    }

    setTimeout(() => {
      setUploading(false)
      if (completedFiles.size === selectedFiles.length) {
        setSelectedFiles([])
        setCompletedFiles(new Set())
        if (fileInputRef.current) fileInputRef.current.value = ''
        onUploadComplete?.()
      }
    }, 500)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
      setError(null)
    }
  }

  function removeFile(fileName: string) {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName))
    setCompletedFiles(prev => {
      const next = new Set(prev)
      next.delete(fileName)
      return next
    })
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

    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-200 mb-3">Who can access this document</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.business_owners}
              disabled={true}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 cursor-not-allowed opacity-50"
            />
            <span className="text-sm text-gray-300">Business Owners (always have access)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.employees}
              onChange={(e) => setPermissions(prev => ({ ...prev, employees: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Employees</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.customers}
              onChange={(e) => setPermissions(prev => ({ ...prev, customers: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Customers</span>
          </label>
        </div>
      </div>

      <div
        onClick={handleAreaClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
        } bg-gray-800`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <span className="mt-2 block text-sm font-medium text-gray-200">
            Drop files here or click anywhere to upload
          </span>
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            className="sr-only"
            accept=".pdf,.docx,.xlsx,.xls,.txt"
            onChange={handleFileChange}
            multiple
          />
          <p className="mt-1 text-xs text-gray-400">
            PDF, DOCX, XLSX, or TXT • Max 10MB per file • Multiple files supported
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-2" onClick={(e) => e.stopPropagation()}>
            {selectedFiles.map((file, idx) => {
              const isUploading = uploadingFiles.has(file.name)
              const isCompleted = completedFiles.has(file.name)
              
              return (
                <div key={idx} className={`p-3 rounded-md flex items-center justify-between ${
                  isCompleted ? 'bg-green-900/30 border border-green-700' :
                  isUploading ? 'bg-blue-900/30 border border-blue-700' :
                  'bg-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="text-sm text-gray-200">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    {isUploading && (
                      <span className="text-xs text-blue-400 animate-pulse">Uploading...</span>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-green-400">✓ Done</span>
                    )}
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
        
        {error && (
          <div className="mt-4 rounded-md bg-red-900/50 border-2 border-red-700 p-4" onClick={(e) => e.stopPropagation()}>
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
      </div>
      
      <button
        type="submit"
        disabled={uploading || selectedFiles.length === 0}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading ${completedFiles.size + 1}/${selectedFiles.length}...` : 
         selectedFiles.length > 0 ? `Upload ${selectedFiles.length} Document${selectedFiles.length > 1 ? 's' : ''}` :
         'Select Files to Upload'}
      </button>
    </form>
  )
}
