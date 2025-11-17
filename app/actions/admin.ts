'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAllUsers() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized - Admin only' }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getAllDocuments() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized - Admin only' }
  }

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      users!inner(email, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getSystemStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized - Admin only' }
  }

  const [usersCount, docsCount, chunksCount, queriesCount] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('chunks').select('*', { count: 'exact', head: true }),
    supabase.from('chat_history').select('*', { count: 'exact', head: true }),
  ])

  return {
    data: {
      totalUsers: usersCount.count || 0,
      totalDocuments: docsCount.count || 0,
      totalChunks: chunksCount.count || 0,
      totalQueries: queriesCount.count || 0,
    }
  }
}
