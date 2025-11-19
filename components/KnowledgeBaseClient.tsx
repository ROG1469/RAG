'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search, FileText, FileSpreadsheet, File, Trash2,
    Upload, X, CheckCircle2, Loader2, Info, Calendar, HardDrive, AlertTriangle
} from 'lucide-react'
import type { Document } from '@/lib/types/database'
import { uploadDocument, deleteDocument } from '@/app/actions/documents'

interface KnowledgeBaseExplorerProps {
    documents: Document[]
}

export default function KnowledgeBaseExplorer({ documents }: KnowledgeBaseExplorerProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
    const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set())
    const [permissions, setPermissions] = useState({
        business_owners: true,
        employees: false,
        customers: false
    })

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedDocsToDelete, setSelectedDocsToDelete] = useState<Set<string>>(new Set())

    // Duplicate File Modal State
    const [duplicateFile, setDuplicateFile] = useState<File | null>(null)
    const [pendingUploads, setPendingUploads] = useState<File[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Filter documents - only show successfully uploaded ones
    const filteredDocs = documents
        .filter(doc => doc.status === 'completed') // Only show completed uploads
        .filter(doc =>
            doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
        )

    const selectedDoc = documents.find(d => d.id === selectedDocId)

    // Auto-refresh
    useEffect(() => {
        const hasProcessing = documents.some(doc => doc.status === 'processing')
        if (hasProcessing) {
            const interval = setInterval(() => router.refresh(), 3000)
            return () => clearInterval(interval)
        }
    }, [documents, router])

    // --- File Upload Logic ---
    async function startUploadProcess() {
        if (selectedFiles.length === 0) return

        // Check for duplicates first
        const duplicates = selectedFiles.filter(file =>
            documents.some(doc => doc.filename === file.name)
        )

        if (duplicates.length > 0) {
            setDuplicateFile(duplicates[0])
            setPendingUploads(selectedFiles)
            return
        }

        await processUploads(selectedFiles)
    }

    async function processUploads(filesToUpload: File[]) {
        setIsUploading(true)
        setUploadError(null)

        for (const file of filesToUpload) {
            setUploadingFiles(prev => new Set([...prev, file.name]))

            try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('accessible_by_employees', String(permissions.employees))
                formData.append('accessible_by_customers', String(permissions.customers))

                const result = await uploadDocument(formData)

                if (result.error) {
                    console.error('Upload failed:', result.error)
                    setUploadError(`${file.name}: ${result.error}`)
                    // Remove from uploading, don't add to completed
                    setUploadingFiles(prev => {
                        const next = new Set(prev)
                        next.delete(file.name)
                        return next
                    })
                } else {
                    setCompletedFiles(prev => new Set([...prev, file.name]))
                    setUploadingFiles(prev => {
                        const next = new Set(prev)
                        next.delete(file.name)
                        return next
                    })
                }
            } catch (err) {
                console.error('Upload error:', err)
                setUploadError(`Error uploading ${file.name}`)
                setUploadingFiles(prev => {
                    const next = new Set(prev)
                    next.delete(file.name)
                    return next
                })
            }
        }

        // Clear completed files after a delay, but keep them visible for a bit
        setTimeout(() => {
            setIsUploading(false)
            router.refresh()
        }, 1000)
    }

    async function handleReplace() {
        if (!duplicateFile) return

        // Delete existing file first
        const existingDoc = documents.find(d => d.filename === duplicateFile.name)
        if (existingDoc) {
            await deleteDocument(existingDoc.id)
        }

        // Continue with upload
        const remainingFiles = pendingUploads.filter(f => f !== duplicateFile)

        // Close modal
        setDuplicateFile(null)

        // Process this file
        await processUploads([duplicateFile])

        // Process remaining if any (check for next duplicate)
        if (remainingFiles.length > 0) {
            // We need to check remaining files for duplicates too
            const nextDuplicates = remainingFiles.filter(file =>
                documents.some(doc => doc.filename === file.name && doc.id !== existingDoc?.id)
            )

            if (nextDuplicates.length > 0) {
                setDuplicateFile(nextDuplicates[0])
                setPendingUploads(remainingFiles)
            } else {
                await processUploads(remainingFiles)
            }
        }
    }

    async function handleSkip() {
        if (!duplicateFile) return

        const remainingFiles = pendingUploads.filter(f => f !== duplicateFile)
        setSelectedFiles(prev => prev.filter(f => f !== duplicateFile))

        setDuplicateFile(null)

        if (remainingFiles.length > 0) {
            // Check next duplicate
            const nextDuplicates = remainingFiles.filter(file =>
                documents.some(doc => doc.filename === file.name)
            )

            if (nextDuplicates.length > 0) {
                setDuplicateFile(nextDuplicates[0])
                setPendingUploads(remainingFiles)
            } else {
                await processUploads(remainingFiles)
            }
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files?.length) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.length) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
        }
    }

    // --- Delete Logic ---
    async function confirmDelete() {
        if (selectedDocsToDelete.size === 0) return

        setIsDeleting(true)
        try {
            // Delete all selected documents
            const deletePromises = Array.from(selectedDocsToDelete).map(docId =>
                deleteDocument(docId)
            )
            await Promise.all(deletePromises)
            
            setSelectedDocsToDelete(new Set())
            setSelectedDocId(null)
            setShowDeleteModal(false)
            router.refresh()
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete documents')
        } finally {
            setIsDeleting(false)
        }
    }

    function toggleSelectDoc(docId: string) {
        setSelectedDocsToDelete(prev => {
            const next = new Set(prev)
            if (next.has(docId)) {
                next.delete(docId)
            } else {
                next.add(docId)
            }
            return next
        })
    }

    function toggleSelectAll() {
        if (selectedDocsToDelete.size === filteredDocs.length) {
            setSelectedDocsToDelete(new Set())
        } else {
            setSelectedDocsToDelete(new Set(filteredDocs.map(doc => doc.id)))
        }
    }

    // --- Icons Helper ---
    function getFileIcon(filename: string) {
        if (filename.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-400" />
        if (filename.endsWith('.xlsx') || filename.endsWith('.csv')) return <FileSpreadsheet className="w-8 h-8 text-green-400" />
        return <File className="w-8 h-8 text-blue-400" />
    }

    function formatSize(bytes: number) {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200">

            {/* --- Top Bar --- */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <HardDrive className="w-5 h-5" />
                    <span className="font-medium">Knowledge Base</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-200">Documents</span>
                </div>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex overflow-hidden">

                {/* Center: Grid View */}
                <div
                    className="flex-1 p-6 overflow-y-auto"
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                >
                    {dragActive && (
                        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed z-50 flex items-center justify-center pointer-events-none">
                            <p className="text-blue-400 font-medium text-lg">Drop files to upload</p>
                        </div>
                    )}

                    {filteredDocs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <File className="w-16 h-16 mb-4 opacity-20" />
                            <p>No documents found</p>
                        </div>
                    ) : (
                        <>
                            {/* Select All Bar */}
                            {filteredDocs.length > 0 && (
                                <div className="mb-4 flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocsToDelete.size === filteredDocs.length && filteredDocs.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-offset-slate-900"
                                    />
                                    <span className="text-sm text-slate-400">
                                        {selectedDocsToDelete.size > 0
                                            ? `${selectedDocsToDelete.size} selected`
                                            : 'Select all'}
                                    </span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredDocs.map(doc => (
                                    <div
                                        key={doc.id}
                                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-3 text-center ${selectedDocId === doc.id
                                                ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                                : selectedDocsToDelete.has(doc.id)
                                                    ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        {/* Checkbox in top-left */}
                                        <div className="absolute top-2 left-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocsToDelete.has(doc.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    toggleSelectDoc(doc.id)
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-offset-slate-900"
                                            />
                                        </div>
                                        <div onClick={() => !selectedDocsToDelete.has(doc.id) && setSelectedDocId(doc.id)} className="w-full">
                                            <div className="p-3 bg-slate-950 rounded-lg shadow-inner">
                                                {getFileIcon(doc.filename)}
                                            </div>
                                            <div className="w-full">
                                                <p className="text-sm font-medium truncate w-full" title={doc.filename}>
                                                    {doc.filename}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {formatSize(doc.file_size)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Pane: Details */}
                <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-800">
                        <h3 className="font-medium flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            Details
                        </h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {selectedDoc ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center text-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    {getFileIcon(selectedDoc.filename)}
                                    <p className="mt-3 font-medium break-all">{selectedDoc.filename}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase">Type</label>
                                        <p className="text-sm text-slate-300">{selectedDoc.file_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase">Size</label>
                                        <p className="text-sm text-slate-300">{formatSize(selectedDoc.file_size)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase">Uploaded</label>
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(selectedDoc.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Access</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                Business Owners
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${selectedDoc.accessible_by_employees ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {selectedDoc.accessible_by_employees ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3" />}
                                                Employees
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${selectedDoc.accessible_by_customers ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {selectedDoc.accessible_by_customers ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3" />}
                                                Customers
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedDocsToDelete.size > 0 && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 border border-red-500 rounded-lg transition-colors text-sm font-medium mt-8"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected ({selectedDocsToDelete.size})
                                    </button>
                                )}
                                {selectedDocId && selectedDocsToDelete.size === 0 && (
                                    <button
                                        onClick={() => {
                                            setSelectedDocsToDelete(new Set([selectedDocId]))
                                            setShowDeleteModal(true)
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-sm font-medium mt-8"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete File
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                                <p>Select a file to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Bottom Bar: Upload --- */}
            <div className="h-auto min-h-20 bg-slate-900 border-t border-slate-800 p-4 flex items-center gap-4 overflow-hidden">
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-32 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                    >
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Upload</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.xlsx,.xls,.txt,.csv"
                    />

                    {/* Upload Queue / Status */}
                    <div className="flex-1 overflow-x-auto flex gap-3 min-w-0">
                        {selectedFiles.length === 0 ? (
                            <div className="flex items-center justify-center w-full h-16 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-sm shrink-0">
                                Drag & drop files here to upload
                            </div>
                        ) : (
                            selectedFiles.map((file, idx) => (
                                <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-lg border shrink-0 min-w-[200px] transition-colors ${completedFiles.has(file.name)
                                        ? 'bg-green-900/20 border-green-800'
                                        : uploadError?.startsWith(file.name)
                                            ? 'bg-red-900/20 border-red-800'
                                            : 'bg-slate-800 border-slate-700'
                                    }`}>
                                    {getFileIcon(file.name)}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate max-w-[120px]">{file.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {uploadingFiles.has(file.name) ? 'Uploading...' :
                                                completedFiles.has(file.name) ? 'Completed' :
                                                    uploadError?.startsWith(file.name) ? 'Failed' : 'Pending'}
                                        </p>
                                    </div>
                                    {completedFiles.has(file.name) ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                                    ) : uploadError?.startsWith(file.name) ? (
                                        <X className="w-5 h-5 text-red-500 ml-auto" />
                                    ) : !isUploading && (
                                        <button onClick={() => setSelectedFiles(prev => prev.filter(f => f !== file))} className="ml-auto">
                                            <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upload Permissions & Action */}
                {selectedFiles.length > 0 && (
                    <div className="flex items-center gap-4 pl-4 border-l border-slate-800 shrink-0">
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.employees}
                                    onChange={e => setPermissions(p => ({ ...p, employees: e.target.checked }))}
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-offset-slate-900"
                                />
                                Employees
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.customers}
                                    onChange={e => setPermissions(p => ({ ...p, customers: e.target.checked }))}
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-offset-slate-900"
                                />
                                Customers
                            </label>
                        </div>
                        <button
                            onClick={startUploadProcess}
                            disabled={isUploading}
                            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Upload'}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Toast */}
            {uploadError && (
                <div className="fixed bottom-24 right-6 bg-red-900/90 border border-red-700 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm font-medium">{uploadError}</p>
                    <button onClick={() => setUploadError(null)} className="ml-2 hover:text-red-200">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">
                                {selectedDocsToDelete.size === 1 ? 'Delete Document?' : `Delete ${selectedDocsToDelete.size} Documents?`}
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            {selectedDocsToDelete.size === 1
                                ? `Are you sure you want to delete \"${selectedDoc?.filename}\"? This action cannot be undone.`
                                : `Are you sure you want to delete ${selectedDocsToDelete.size} selected documents? This action cannot be undone.`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete {selectedDocsToDelete.size > 1 && `(${selectedDocsToDelete.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate File Modal */}
            {duplicateFile && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 text-yellow-400">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">File Already Exists</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            A file named &quot;{duplicateFile.name}&quot; already exists. Do you want to replace it or skip this file?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleSkip}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleReplace}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
