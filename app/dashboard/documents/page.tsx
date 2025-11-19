import { getUser } from '@/app/actions/auth'
import { getDocuments } from '@/app/actions/documents'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import type { Document } from '@/lib/types/database'

export default async function DocumentsPage() {
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
  }

  // Determine user role - default to business_owner if not set
  const userRole = user.role || 'business_owner'

  return (
    <DashboardClient 
      userEmail={user.email || ''} 
      initialRole={userRole}
      isKnowledgeBase={true}
      initialDocuments={documents}
    />
  )
}
