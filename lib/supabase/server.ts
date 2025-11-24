import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Not throwing here to keep dev server running; API routes will return errors if keys are missing
  console.warn('[supabase/server] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
}

export function getAdminSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

export default getAdminSupabase
