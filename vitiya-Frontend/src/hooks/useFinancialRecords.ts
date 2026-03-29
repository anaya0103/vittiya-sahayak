import { useState } from 'react'
import { supabase, type FinancialRecord } from '../lib/supabase'

export function useFinancialRecords() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async (userId: string, startDate?: string, endDate?: string) => {
    try {
      setError(null)
      let query = supabase
        .from('financial_records')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query.order('date', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch records'
      setError(message)
      return { data: null, error: message }
    }
  }

  const addRecord = async (userId: string, record: Omit<FinancialRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('financial_records')
        .insert([{ ...record, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add record'
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }

  const updateRecord = async (id: string, updates: Partial<FinancialRecord>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('financial_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update record'
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete record'
      setError(message)
      return { error: message }
    } finally {
      setLoading(false)
    }
  }

  const getCategoryStats = async (userId: string, transactionType: 'income' | 'expense') => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('financial_records')
        .select('category, amount')
        .eq('user_id', userId)
        .eq('transaction_type', transactionType)

      if (error) throw error

      const stats: { [key: string]: number } = {}
      data?.forEach(record => {
        stats[record.category] = (stats[record.category] || 0) + Number(record.amount)
      })

      return { data: stats, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get category stats'
      setError(message)
      return { data: null, error: message }
    }
  }

  return {
    loading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getCategoryStats,
  }
}
