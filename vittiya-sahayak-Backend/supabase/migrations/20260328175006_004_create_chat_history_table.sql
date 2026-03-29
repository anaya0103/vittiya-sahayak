/*
  # Create Chat History Table

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `message` (text) - User's question
      - `response` (text) - AI response
      - `language` (text) - Language used
      - `feature_type` (text) - 'general_qa', 'scam_detection', 'investment_advice', 'tax_saving'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_history` table
    - Users can only access their own chat history
*/

CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  language text DEFAULT 'en',
  feature_type text DEFAULT 'general_qa',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON public.chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON public.chat_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);
