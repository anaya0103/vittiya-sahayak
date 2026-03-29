/*
  # Create Document Analysis Table

  1. New Tables
    - `document_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `document_name` (text) - Original filename
      - `document_type` (text) - 'bank_statement', 'insurance', 'loan_document', 'tax_form'
      - `original_content` (text) - Base64 encoded file or raw content
      - `simplified_summary` (text) - AI-generated summary
      - `key_points` (jsonb) - Array of important points
      - `language` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `document_analyses` table
    - Users can only access their own documents
*/

CREATE TABLE IF NOT EXISTS public.document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  document_type text,
  simplified_summary text,
  key_points jsonb,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document analyses"
  ON public.document_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document analyses"
  ON public.document_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document analyses"
  ON public.document_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_document_analyses_user_id ON public.document_analyses(user_id);
CREATE INDEX idx_document_analyses_created_at ON public.document_analyses(created_at DESC);
