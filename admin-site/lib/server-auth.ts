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
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return null
    try {
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
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return null
    try {
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
