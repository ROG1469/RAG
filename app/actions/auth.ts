'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  // Validate role
  if (!role || !['business_owner', 'employee'].includes(role)) {
    return { error: 'Please select a valid role' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // Store role in auth metadata
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Wait a moment for the trigger to create the user profile
  await new Promise(resolve => setTimeout(resolve, 500))

  revalidatePath('/')
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getUser() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('No auth user found')
      return null
    }

    console.log('Auth user found:', user.id, user.email)

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile exists, return it
    if (profile) {
      console.log('Profile found in database')
      return profile
    }

    // If profile doesn't exist, return a minimal user object based on auth user
    // This allows the user to use the app while the trigger creates the database record
    console.log('Profile not found, error:', profileError?.code, profileError?.message)
    
    if (profileError?.code === 'PGRST116') {
      // No rows returned - profile not yet created by trigger
      console.log('Creating temporary profile from auth user')
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        role: 'user' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Other errors
    console.warn('Unexpected error fetching user profile:', profileError?.message, profileError?.code)
    return null
  } catch (err) {
    console.error('Error in getUser:', err)
    return null
  }
}
