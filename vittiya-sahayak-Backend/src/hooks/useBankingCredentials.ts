import { useState } from 'react'
import { supabase, type BankingCredential } from '../lib/supabase'

export function useBankingCredentials() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentials = async (userId: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('banking_credentials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch credentials'
      setError(message)
      return { data: null, error: message }
    }
  }

  const addCredential = async (userId: string, credential: Omit<BankingCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('banking_credentials')
        .insert([{ ...credential, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add credential'
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }

  const updateCredential = async (id: string, updates: Partial<BankingCredential>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('banking_credentials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update credential'
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }

  const deleteCredential = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('banking_credentials')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete credential'
      setError(message)
      return { error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchCredentials,
    addCredential,
    updateCredential,
    deleteCredential,
  }
}
