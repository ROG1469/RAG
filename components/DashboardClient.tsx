'use client'

import { useState } from 'react'
import { Settings, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import NewDashboardContent from '@/components/NewDashboardContent'
import KnowledgeBaseClient from '@/components/KnowledgeBaseClient'
import { signOut as signOutAction } from '@/app/actions/auth'
import type { Document } from '@/lib/types/database'

interface DashboardClientProps {
  userEmail: string
  initialRole: string
  isKnowledgeBase?: boolean
  initialDocuments?: Document[]
}

export default function DashboardClient({ 
  userEmail, 
  initialRole, 
  isKnowledgeBase = false,
  initialDocuments = []
}: DashboardClientProps) {
  const [currentRole, setCurrentRole] = useState(initialRole)

  async function handleSignOut() {
    await signOutAction()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Sidebar */}
      <div className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Top Section */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-2">RAG Dashboard</h1>
          <p className="text-sm text-gray-400 mb-6">Welcome, {userEmail.split('@')[0]}</p>
          
          {/* Menu */}
          <div className="space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">MENU</p>
            <nav className="space-y-1">
              {currentRole === 'business_owner' && (
                <Link
                  href="/dashboard/documents"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Knowledge Base
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-purple-600/20 border border-purple-500/50 rounded-lg"
              >
                <MessageSquare className="h-4 w-4" />
                Chat Interface
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section - User Info */}
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {userEmail[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate capitalize">
                {currentRole === 'business_owner' ? 'Business Owner' : currentRole}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-900/95 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Center - Role Switcher */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setCurrentRole('business_owner')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentRole === 'business_owner' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Business Owner
                </button>
                <button 
                  onClick={() => setCurrentRole('employee')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentRole === 'employee' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Employee
                </button>
                <button 
                  onClick={() => setCurrentRole('customer')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentRole === 'customer' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Customer
                </button>
              </div>
            </div>

            {/* Right - Admin Panel & Sign Out */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        {isKnowledgeBase ? (
          <KnowledgeBaseClient documents={initialDocuments} user={{ email: userEmail, role: currentRole }} />
        ) : (
          <NewDashboardContent userRole={currentRole} />
        )}
      </div>
    </div>
  )
}
