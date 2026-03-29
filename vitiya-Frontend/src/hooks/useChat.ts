import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { isAiDemoFallback, isAiDemoOnly } from '../lib/aiDemoConfig'
import { getDemoChat, getDemoDocument, getDemoScam } from '../lib/demoSamples'

interface ChatResponse {
  reply: string
  language: string
  fromDemo?: true
}

interface ScamDetectionResponse {
  isFraud: boolean
  confidence: number
  explanation: string
}

export type DetectScamOutcome =
  | { ok: true; data: ScamDetectionResponse; fromDemo?: true }
  | { ok: false; message: string }

function normalizeScamPayload(raw: unknown): ScamDetectionResponse {
  if (!raw || typeof raw !== 'object') {
    return { isFraud: false, confidence: 0, explanation: 'Unexpected response from server.' }
  }
  const o = raw as Record<string, unknown>
  const fraud =
    o.isFraud ?? o.is_fraud ?? o.fraud ?? o.isScam ?? o.is_scam
  const conf = o.confidence ?? o.score ?? o.confidence_score
  let confidence = typeof conf === 'number' && !Number.isNaN(conf) ? conf : 0
  if (confidence > 1) confidence = Math.min(confidence / 100, 1)
  const explanation =
    typeof o.explanation === 'string'
      ? o.explanation
      : typeof o.message === 'string'
        ? o.message
        : typeof o.reason === 'string'
          ? o.reason
          : typeof o.summary === 'string'
            ? o.summary
            : 'No explanation returned.'
  return {
    isFraud: Boolean(fraud),
    confidence,
    explanation,
  }
}

async function readFetchError(response: Response): Promise<string> {
  const text = await response.text()
  if (!text) return `Request failed (${response.status} ${response.statusText})`
  try {
    const j = JSON.parse(text) as Record<string, unknown>
    const msg =
      (typeof j.error === 'string' && j.error) ||
      (typeof j.message === 'string' && j.message) ||
      (typeof j.msg === 'string' && j.msg)
    if (msg) return msg
  } catch {
    /* not JSON */
  }
  return text.length > 280 ? `${text.slice(0, 280)}…` : text
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

interface DocumentAnalysisResponse {
  summary: string
  keyPoints: string[]
  language: string
  documentType: string
  fromDemo?: true
}

/** When Edge Functions return OpenAI “no credit / quota” errors, still show honest labeled samples without extra env flags. */
function isAiProviderExhaustedMessage(text: string): boolean {
  const t = text.toLowerCase()
  return (
    t.includes('quota') ||
    t.includes('billing') ||
    t.includes('insufficient_quota') ||
    t.includes('exceeded your current quota') ||
    t.includes('rate limit') ||
    t.includes('too many requests') ||
    t.includes('context_length_exceeded') ||
    t.includes('incorrect api key') ||
    t.includes('invalid_api_key')
  )
}

function useLabeledDemoInsteadOfError(errText: string): boolean {
  return isAiDemoFallback() || isAiProviderExhaustedMessage(errText)
}

function notifyDemoToast(errText: string) {
  if (isAiProviderExhaustedMessage(errText)) {
    toast.message('AI credits or quota exhausted — showing labeled sample only (not a live check).', { duration: 5200 })
  } else {
    toast.message('Live API unavailable — showing labeled sample response.', { duration: 4000 })
  }
}

function notifyTimeoutToast() {
  toast.message('Live API timeout — showing labeled sample only (not a live check).', { duration: 5200 })
}

export function useChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (message: string, language: string = 'en'): Promise<ChatResponse | null> => {
    if (isAiDemoOnly()) {
      setLoading(true)
      setError(null)
      try {
        return getDemoChat(message, language)
      } finally {
        setLoading(false)
      }
    }

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
          'Authorization': `Bearer ${data.session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language }),
      })

      if (!response.ok) {
        const errText = await readFetchError(response)
        if (useLabeledDemoInsteadOfError(errText)) {
          setError(null)
          notifyDemoToast(errText)
          return getDemoChat(message, language)
        }
        throw new Error(errText)
      }

      const parsed: ChatResponse = await response.json()

      const { error: saveError } = await supabase
        .from('chat_history')
        .insert([
          {
            message,
            response: parsed.reply,
            language,
            feature_type: 'general_qa',
          },
        ])

      if (saveError) {
        console.warn('Failed to save chat history:', saveError)
      }

      return parsed
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Chat failed'
      if (useLabeledDemoInsteadOfError(messageText)) {
        setError(null)
        notifyDemoToast(messageText)
        return getDemoChat(message, language)
      }
      setError(messageText)
      return null
    } finally {
      setLoading(false)
    }
  }

  const detectScam = async (message: string, language: string = 'en'): Promise<DetectScamOutcome> => {
    if (isAiDemoOnly()) {
      setLoading(true)
      setError(null)
      try {
        return getDemoScam(message, language)
      } finally {
        setLoading(false)
      }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getSession()
      if (authError || !data.session) {
        const msg = 'Sign in required — please log in and try again.'
        if (isAiDemoFallback()) {
          setError(null)
          notifyDemoToast(msg)
          return getDemoScam(message, language)
        }
        setError(msg)
        return { ok: false, message: msg }
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const url = `${supabaseUrl}/functions/v1/scam-detect`
      const body = JSON.stringify({ message, language })
      const timeoutMs = 8000

      const call = (useAnonBearer: boolean) =>
        fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${useAnonBearer ? supabaseAnonKey : data.session!.access_token}`,
              apikey: supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body,
          },
          timeoutMs,
        )

      let response = await call(false)
      if (response.status === 401 || response.status === 403) {
        response = await call(true)
      }

      if (!response.ok) {
        const errText = await readFetchError(response)
        if (useLabeledDemoInsteadOfError(errText)) {
          setError(null)
          notifyDemoToast(errText)
          return getDemoScam(message, language)
        }
        const msg =
          response.status === 404
            ? `Function not found (404). Deploy the "scam-detect" Edge Function in Supabase, or check the function name.`
            : errText
        setError(msg)
        return { ok: false, message: msg }
      }

      let raw: unknown
      try {
        raw = await response.json()
      } catch {
        const msg = 'Invalid response from scam-detect (not JSON).'
        if (useLabeledDemoInsteadOfError(msg)) {
          setError(null)
          notifyDemoToast(msg)
          return getDemoScam(message, language)
        }
        setError(msg)
        return { ok: false, message: msg }
      }

      if (raw && typeof raw === 'object' && typeof (raw as Record<string, unknown>).error === 'string') {
        const errStr = (raw as Record<string, unknown>).error as string
        if (useLabeledDemoInsteadOfError(errStr)) {
          setError(null)
          notifyDemoToast(errStr)
          return getDemoScam(message, language)
        }
        setError(errStr)
        return { ok: false, message: errStr }
      }

      const result = normalizeScamPayload(raw)

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

      return { ok: true, data: result }
    } catch (err) {
      // If OpenAI / Edge Function is slow, abort quickly and show labeled sample.
      if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') {
        setError(null)
        notifyTimeoutToast()
        return getDemoScam(message, language)
      }
      const messageText = err instanceof Error ? err.message : 'Scam detection failed'
      if (useLabeledDemoInsteadOfError(messageText)) {
        setError(null)
        notifyDemoToast(messageText)
        return getDemoScam(message, language)
      }
      setError(messageText)
      return { ok: false, message: messageText }
    } finally {
      setLoading(false)
    }
  }

  const analyzeDocument = async (documentText: string, documentType: string = 'general', language: string = 'en'): Promise<DocumentAnalysisResponse | null> => {
    if (isAiDemoOnly()) {
      setLoading(true)
      setError(null)
      try {
        return getDemoDocument(documentText, documentType, language)
      } finally {
        setLoading(false)
      }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getSession()
      if (authError || !data.session) {
        // For demo friendliness: if user isn't logged in yet, still show a labeled sample.
        // This avoids "Document analysis failed" during hackathon recording.
        toast.message('Please log in to analyze documents — showing labeled sample instead.', { duration: 4500 })
        return getDemoDocument(documentText, documentType, language)
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/document-analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentText, documentType, language }),
      })

      if (!response.ok) {
        const errText = await readFetchError(response)
        if (useLabeledDemoInsteadOfError(errText)) {
          setError(null)
          notifyDemoToast(errText)
          return getDemoDocument(documentText, documentType, language)
        }
        throw new Error(errText)
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
      const messageText = err instanceof Error ? err.message : 'Document analysis failed'
      if (useLabeledDemoInsteadOfError(messageText)) {
        setError(null)
        notifyDemoToast(messageText)
        return getDemoDocument(documentText, documentType, language)
      }
      setError(messageText)
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
