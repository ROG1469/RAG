'use server'

import { createClient } from '@/lib/supabase/server'
import type { RAGResponse } from '@/lib/types/database'

export async function queryRAG(question: string): Promise<{ data?: RAGResponse; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    console.log('[QUERY] Calling query-rag Edge Function...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey) {
      console.error('[QUERY] Missing Supabase env (URL or ANON KEY)')
      return { error: 'Server configuration error' }
    }

    const queryUrl = `${supabaseUrl}/functions/v1/query-rag`
    console.log('[QUERY] Calling:', queryUrl)
    console.log('[QUERY] Question:', question)
    console.log('[QUERY] User ID:', user.id)
    
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question, 
        userId: user.id 
      }),
    })

    console.log('[QUERY] Edge Function response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[QUERY] Edge Function error (status ' + response.status + '):', errorText)
      try {
        const errorData = JSON.parse(errorText)
        return { error: errorData.error || `Query failed (${response.status})` }
      } catch {
        return { error: `Query failed (${response.status}): ${errorText}` }
      }
    }

    const result = await response.json()
    console.log('[QUERY] ✅ Edge Function success')
    console.log('[QUERY] Answer length:', result.answer?.length || 0)
    console.log('[QUERY] Sources count:', result.sources?.length || 0)

    const ragResponse: RAGResponse = {
      answer: result.answer,
      sources: result.sources || []
    }

    return { data: ragResponse }

  } catch (error) {
    console.error('[QUERY] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process query'
    return { error: errorMessage }
  }
}

export async function getChatHistory() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
