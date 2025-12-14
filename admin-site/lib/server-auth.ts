// For Edge compatibility, prefer a REST-based Supabase auth lookup using
// the sb-access-token and Supabase Auth REST endpoint. This avoids using
// the full `@supabase/supabase-js` client in environments that don't
// support Node.js native APIs.
import getSupabaseAdmin from '@/lib/supabase'

function parseCookies(cookieHeader: string | null) {
  const c: Record<string, string> = {}
  if (!cookieHeader) return c
  cookieHeader.split(';').map(s => s.trim()).forEach(kv => {
    const idx = kv.indexOf('=')
    if (idx === -1) return
    const key = kv.substring(0, idx)
    const val = kv.substring(idx + 1)
    try { c[key] = decodeURIComponent(val) } catch { c[key] = val }
  })
  return c
}

export async function getUserIdFromCookieHeader(cookieHeader: string | null): Promise<string | null> {
  try {
    const cookies = parseCookies(cookieHeader)
    const token = cookies['sb-access-token'] || null
    if (!token) return null
    // First try a lightweight REST call to Supabase Auth to fetch user info.
    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
    const anonKey = process.env.SUPABASE_ANON_KEY || ''
    try {
      if (supabaseUrl && anonKey) {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: anonKey } })
        if (!res.ok) {
          // fallthrough to SDK path
        } else {
          const json = await res.json().catch(() => null)
          if (json && json.id) return String(json.id)
        }
      }
    } catch (e) {
      // ignore and try SDK if available
    }

    // Fallback: if environment has a service client available, use it.
    try {
      const supabaseAdmin = getSupabaseAdmin()
      if (!supabaseAdmin) return null
      const authRes = await (supabaseAdmin as any).auth.getUser(token)
      if (!authRes) return null
      const { data, error } = authRes
      if (error) return null
      return data?.user?.id || null
    } catch (e) {
      return null
    }
  } catch (e) {
    return null
  }
}

export async function getUserFromCookieHeader(cookieHeader: string | null): Promise<{ id: string; email?: string } | null> {
  try {
    const cookies = parseCookies(cookieHeader)
    const token = cookies['sb-access-token'] || null
    if (!token) return null
    // Try REST auth endpoint first (Edge-friendly)
    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
    const anonKey = process.env.SUPABASE_ANON_KEY || ''
    try {
      if (supabaseUrl && anonKey) {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: anonKey } })
        if (res.ok) {
          const json = await res.json().catch(() => null)
          if (json && json.id) return { id: String(json.id), email: json.email || undefined }
        }
      }
    } catch (e) {
      // ignore and try SDK fallback
    }

    try {
      const supabaseAdmin = getSupabaseAdmin()
      if (!supabaseAdmin) return null
      const authRes = await (supabaseAdmin as any).auth.getUser(token)
      if (!authRes) return null
      const { data, error } = authRes
      if (error || !data?.user) return null
      const u = data.user
      return { id: u.id, email: u.email || undefined }
    } catch (e) {
      return null
    }
  } catch (e) {
    return null
  }
}
