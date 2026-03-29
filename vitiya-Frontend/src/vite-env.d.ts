/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** "true" = only labeled sample responses (no live AI calls). */
  readonly VITE_AI_DEMO_MODE?: string
  /** "true" = try live API first; on failure use labeled samples. */
  readonly VITE_AI_DEMO_FALLBACK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
