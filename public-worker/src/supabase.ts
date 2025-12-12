import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for use inside the Worker. Prefer SERVICE_ROLE
// key when available so the Worker can perform privileged DB operations.
export function getSupabase(env: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string; SUPABASE_SERVICE_ROLE_KEY?: string }) {
  const url = (env.SUPABASE_URL || '').replace(/\/+$/, '')
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || ''
  const anonKey = env.SUPABASE_ANON_KEY || ''
  if (!url) throw new Error('SUPABASE_URL is not set')

  // If service role key is present, use it for all operations performed by
  // this Worker. This allows the Worker to enforce row-level access itself
  // while using the service role for upserts/reads when needed.
  const keyToUse = serviceKey || anonKey
  if (!keyToUse) throw new Error('No SUPABASE key configured (SERVICE_ROLE_KEY or ANON_KEY)')

  return createClient(url, keyToUse, { auth: { persistSession: false } })
}
