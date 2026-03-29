import { useState, useEffect } from 'react'
import { supabase, type Profile } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      return { user: null, error: message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      return { user: null, error: message }
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
      return { error: message }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      return { error: message }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed'
      setError(message)
      return { data: null, error: message }
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  }
}
