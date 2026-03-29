import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ChatResponse {
  reply: string
  language: string
}

interface ScamDetectionResponse {
  isFraud: boolean
  confidence: number
  explanation: string
}

interface DocumentAnalysisResponse {
  summary: string
  keyPoints: string[]
  language: string
  documentType: string
}

export function useChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (message: string, language: string = 'en'): Promise<ChatResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getSession()
      if (authError || !data.session) {
        throw new Error('User not authenticated')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chat failed')
      }

      const result: ChatResponse = await response.json()

      const { error: saveError } = await supabase
        .from('chat_history')
        .insert([
          {
            message,
            response: result.reply,
            language,
            feature_type: 'general_qa',
          },
        ])

      if (saveError) {
        console.warn('Failed to save chat history:', saveError)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat failed'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const detectScam = async (message: string, language: string = 'en'): Promise<ScamDetectionResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getSession()
      if (authError || !data.session) {
        throw new Error('User not authenticated')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/scam-detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Scam detection failed')
      }

      const result: ScamDetectionResponse = await response.json()

      const { error: saveError } = await supabase
        .from('chat_history')
        .insert([
          {
            message,
            response: JSON.stringify(result),
            language,
            feature_type: 'scam_detection',
          },
        ])

      if (saveError) {
        console.warn('Failed to save chat history:', saveError)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scam detection failed'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const analyzeDocument = async (documentText: string, documentType: string = 'general', language: string = 'en'): Promise<DocumentAnalysisResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getSession()
      if (authError || !data.session) {
        throw new Error('User not authenticated')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/document-analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentText, documentType, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Document analysis failed')
      }

      const result: DocumentAnalysisResponse = await response.json()

      const { error: saveError } = await supabase
        .from('document_analyses')
        .insert([
          {
            document_name: `Analysis_${new Date().toISOString()}`,
            document_type: documentType,
            simplified_summary: result.summary,
            key_points: result.keyPoints,
            language,
          },
        ])

      if (saveError) {
        console.warn('Failed to save document analysis:', saveError)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Document analysis failed'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchChatHistory = async (userId: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch chat history'
      setError(message)
      return { data: null, error: message }
    }
  }

  return {
    loading,
    error,
    sendMessage,
    detectScam,
    analyzeDocument,
    fetchChatHistory,
  }
}
