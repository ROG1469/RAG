import { getUser } from '@/app/actions/auth'
import { getDocuments } from '@/app/actions/documents'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/DashboardContent'
import { signOut } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'
import type { Document } from '@/lib/types/database'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  let documents: Document[] = []
  try {
    const documentsResult = await getDocuments()
    documents = (documentsResult.data || []) as Document[]
  } catch (error) {
    console.error('Error fetching documents:', error)
    // Continue without documents on error
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-200">RAG Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {user.full_name || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <a
                  href="/admin"
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Admin Panel
                </a>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gray-100 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full h-[calc(100vh-80px)] flex">
        <DashboardContent documents={documents} />
      </main>
    </div>
  )
}
