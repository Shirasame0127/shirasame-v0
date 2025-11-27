import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // allow missing keys in environments where auth is disabled; callers should handle errors
}

// When using server-side HttpOnly cookies for session management, disable
// client-side persistence and automatic token refresh so the client doesn't
// attempt to refresh using local-storage tokens and conflict with the server.
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default supabaseClient
