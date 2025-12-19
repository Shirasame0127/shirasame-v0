import { getSupabase } from '../supabase'

export async function resolvePublicOwnerUser(c: any): Promise<string | null> {
  try {
    const env = c.env || {}
    // Prefer explicit owner id if configured
    const explicit = (env.PUBLIC_OWNER_USER_ID || '').toString().trim()
    if (explicit) return explicit

    const email = (env.PUBLIC_OWNER_EMAIL || env.PUBLIC_PROFILE_EMAIL || '').toString().trim()
    if (!email) return null

    const supabase = getSupabase(env)

    // Try selecting from auth.users (may be restricted for anon key)
    try {
      const { data, error } = await supabase.from('users').select('id,email').eq('email', email).limit(1).maybeSingle()
      if (!error && data && (data as any).id) return (data as any).id
    } catch (e) {
      // ignore and fallback to profiles
    }

    // Fall back to public profiles table
    try {
      const { data, error } = await supabase.from('profiles').select('id,user_id,email,profile_image_key,display_name').eq('email', email).limit(1).maybeSingle()
      if (!error && data) {
        if ((data as any).user_id) return (data as any).user_id
        if ((data as any).id) return (data as any).id
      }
    } catch (e) {
      // ignore
    }

    return null
  } catch (e) {
    return null
  }
}

export default resolvePublicOwnerUser
