import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Env } from './types'

export function getSupabaseAdmin(env: Env): SupabaseClient {
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin credentials missing')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetch as any },
  })
}
