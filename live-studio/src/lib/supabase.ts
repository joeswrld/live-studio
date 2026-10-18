import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Placeholder values keep createClient from throwing when env vars are missing;
// the app shows a configuration screen instead of making requests in that case.
export const supabase = createClient(
  SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY || 'missing-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);
