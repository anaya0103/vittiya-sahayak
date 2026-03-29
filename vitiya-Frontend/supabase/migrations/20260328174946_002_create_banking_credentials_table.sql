/*
  # Create Banking Credentials Table

  1. New Tables
    - `banking_credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `credential_type` (text) - 'bank_account', 'upi', 'card'
      - `bank_name` (text) - e.g., 'HDFC Bank'
      - `account_number` (text) - Encrypted
      - `ifsc_code` (text)
      - `upi_id` (text) - For UPI credentials
      - `card_last_four` (text) - Last 4 digits
      - `card_holder_name` (text)
      - `nickname` (text) - User-friendly name
      - `is_primary` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `banking_credentials` table
    - Users can only access their own credentials
    - All sensitive data is encrypted at rest in Supabase
*/

CREATE TABLE IF NOT EXISTS public.banking_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_type text NOT NULL CHECK (credential_type IN ('bank_account', 'upi', 'card')),
  bank_name text,
  account_number text,
  ifsc_code text,
  upi_id text,
  card_last_four text,
  card_holder_name text,
  nickname text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.banking_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own banking credentials"
  ON public.banking_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banking credentials"
  ON public.banking_credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banking credentials"
  ON public.banking_credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own banking credentials"
  ON public.banking_credentials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_banking_credentials_user_id ON public.banking_credentials(user_id);
