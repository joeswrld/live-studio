import { createClient } from '@supabase/supabase-js';

// Public values only: the project URL and the publishable (anon) key are designed
// to be shipped to browsers; Row Level Security protects the data.
// Environment variables take priority, so other environments can override these.
const DEFAULT_SUPABASE_URL = 'https://wrfofeqowwfknymciajy.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_cMh9LHNu_TPhaQfpGQWBgw_H9m04qlf';

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});