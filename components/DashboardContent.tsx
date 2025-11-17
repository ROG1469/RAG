'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'
import ChatHistorySidebar from './ChatHistorySidebar'
import FileUpload from './FileUpload'
import DocumentList from './DocumentList'
import type { Document } from '@/lib/types/database'

interface DashboardContentProps {
  documents: Document[]
}

export default function DashboardContent({ documents }: DashboardContentProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleQueryComplete() {
    // Trigger sidebar refresh by incrementing the counter
    setRefreshTrigger(prev => prev + 1)
  }

  function handleUploadComplete() {
    // Could also refresh documents list if needed
  }

  return (
    <>
      {/* Sidebar - Chat History */}
      <aside className="w-64 shrink-0">
        <ChatHistorySidebar refreshTrigger={refreshTrigger} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Documents */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-4">Upload Document</h2>
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-4">
                  Your Documents ({documents.length})
                </h2>
                <DocumentList documents={documents} />
              </div>
            </div>

            {/* Right Column - Chat */}
            <div>
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Ask Questions</h2>
              <ChatInterface onQueryComplete={handleQueryComplete} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
