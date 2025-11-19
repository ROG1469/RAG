'use client'

import { useState } from 'react'
import { Upload, MessageSquare, History, Settings, User, LogOut } from 'lucide-react'
import ChatInterface from './ChatInterface'
import ChatHistorySidebar from './ChatHistorySidebar'
import KnowledgeBaseClient from './KnowledgeBaseClient'
import type { Document } from '@/lib/types/database'
import { signOut } from '@/app/actions/auth'

interface DashboardContentProps {
  documents: Document[]
  user: {
    email: string
    full_name?: string | null
    role?: string
  }
}

type UserRole = 'owner' | 'employee' | 'customer'
type View = 'chat' | 'knowledge'

export default function DashboardContent({ documents, user }: DashboardContentProps) {
  const [role, setRole] = useState<UserRole>('owner')
  const [currentView, setCurrentView] = useState<View>('chat')

  // Reset view when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    if (newRole === 'employee' || newRole === 'customer') {
      setCurrentView('chat')
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Title & Welcome */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RAG Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Welcome, <span className="text-slate-200 font-medium">{user.full_name || user.email}</span>
              </p>
            </div>

            {/* Center: MVP Role Switcher */}
            <div className="hidden md:flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <button
                onClick={() => handleRoleChange('owner')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${role === 'owner'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Business Owner
              </button>
              <button
                onClick={() => handleRoleChange('employee')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${role === 'employee'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Employee
              </button>
              <button
                onClick={() => handleRoleChange('customer')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${role === 'customer'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Customer
              </button>
            </div>

            {/* Right: Admin & Sign Out */}
            <div className="flex items-center gap-4">
              {role === 'owner' && (
                <a
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </a>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden bg-slate-950">
        {/* Left Panel: Navigation */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
              Menu
            </div>

            {role === 'owner' && (
              <button
                onClick={() => setCurrentView('knowledge')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${currentView === 'knowledge'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <Upload className="w-4 h-4" />
                Knowledge Base
              </button>
            )}

            <button
              onClick={() => setCurrentView('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${currentView === 'chat'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat Interface
            </button>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role === 'owner' ? 'bg-blue-500/20 text-blue-400' :
                role === 'employee' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {role === 'owner' ? 'Business Owner' :
                    role === 'employee' ? 'Employee' : 'Customer'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Current Role
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex-1 h-full">
            {currentView === 'knowledge' && role === 'owner' ? (
              <div className="h-full overflow-hidden">
                <KnowledgeBaseClient documents={documents} user={user} />
              </div>
            ) : (
              <ChatInterface />
            )}
          </div>
        </div>

        {/* Right Panel: Chat History */}
        {role !== 'customer' && currentView === 'chat' && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" />
                Chat History
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatHistorySidebar />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
