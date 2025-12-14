import { createClient } from "@supabase/supabase-js"

// Lazily create a Supabase admin client to avoid failing at module import
// time when environment variables are not present (e.g., during static
// analysis or on build systems without secrets). Callers should handle
// a null return value and fail safely.
export function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.SUPABASE_URL || ""
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    try { console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set') } catch (e) {}
    return null
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

export default getSupabaseAdmin
