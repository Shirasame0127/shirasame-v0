import { createClient } from '@supabase/supabase-js'

export function getSupabase(env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }) {
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL/SUPABASE_ANON_KEY is not set')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
