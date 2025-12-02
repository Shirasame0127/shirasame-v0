import type { Env } from './types'

export function isPublicRequest(req: Request, env: Env): boolean {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const host = new URL(req.url).hostname
    const PUBLIC_HOST = env.PUBLIC_HOST || env.NEXT_PUBLIC_PUBLIC_HOST || ''
    const isHostPublic = PUBLIC_HOST ? host === PUBLIC_HOST : false
    return !hasAccessCookie || isHostPublic
  } catch {
    return true
  }
}

export async function getOwnerUserId(env: Env): Promise<string | null> {
  const email = env.PUBLIC_PROFILE_EMAIL || ''
  if (!email) return null
  // cache via Cloudflare Cache API for short TTL to avoid DB hit on every request
  const cache = caches.default
  const cacheKey = new Request(`https://cache.internal/owner-id?email=${encodeURIComponent(email)}`)
  const cached = await cache.match(cacheKey)
  if (cached) {
    try { return await cached.text() } catch {}
  }
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const res = await supabase.from('users').select('id').eq('email', email).limit(1)
  const id = Array.isArray(res.data) && res.data.length > 0 ? (res.data[0] as any).id : null
  if (id) {
    const resp = new Response(id, { headers: { 'Cache-Control': 'public, max-age=300' } })
    await cache.put(cacheKey, resp)
  }
  return id
}
