/*
  # Create Financial Records Table

  1. New Tables
    - `financial_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `transaction_type` (text) - 'income' or 'expense'
      - `category` (text) - 'salary', 'investment', 'groceries', etc.
      - `amount` (decimal)
      - `currency` (text) - Default 'INR'
      - `description` (text)
      - `date` (date)
      - `payment_method` (text) - 'bank_transfer', 'cash', 'upi', 'card'
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `financial_records` table
    - Users can only access their own records
*/

CREATE TABLE IF NOT EXISTS public.financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'INR',
  description text,
  date date NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial records"
  ON public.financial_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial records"
  ON public.financial_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial records"
  ON public.financial_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial records"
  ON public.financial_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_financial_records_user_id ON public.financial_records(user_id);
CREATE INDEX idx_financial_records_date ON public.financial_records(date);
CREATE INDEX idx_financial_records_category ON public.financial_records(category);
