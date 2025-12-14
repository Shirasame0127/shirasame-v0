import getSupabaseAdmin from "@/lib/supabase"

let _cachedOwnerId: string | null = null

export async function getOwnerUserId() {
  if (_cachedOwnerId) return _cachedOwnerId

  const email = (process.env.PUBLIC_PROFILE_EMAIL || "").toString().trim().toLowerCase()
  if (!email) throw new Error('PUBLIC_PROFILE_EMAIL is not set')

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('no supabaseAdmin client available')

  const { data, error } = await supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle()
  if (error) throw error
  if (!data || !data.id) throw new Error(`owner user not found for email ${email}`)

  _cachedOwnerId = data.id
  return _cachedOwnerId
}

export function clearOwnerCache() {
  _cachedOwnerId = null
}
