import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  full_name: string
  preferred_language: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type BankingCredential = {
  id: string
  user_id: string
  credential_type: 'bank_account' | 'upi' | 'card'
  bank_name: string | null
  account_number: string | null
  ifsc_code: string | null
  upi_id: string | null
  card_last_four: string | null
  card_holder_name: string | null
  nickname: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export type FinancialRecord = {
  id: string
  user_id: string
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  currency: string
  description: string | null
  date: string
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  user_id: string
  message: string
  response: string
  language: string
  feature_type: string
  created_at: string
}

export type DocumentAnalysis = {
  id: string
  user_id: string
  document_name: string
  document_type: string | null
  simplified_summary: string | null
  key_points: string[] | null
  language: string
  created_at: string
  updated_at: string
}
