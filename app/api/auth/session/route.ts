import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const accessToken = body?.access_token
    const refreshToken = body?.refresh_token

    try {
      const preview = (s: string | undefined | null) => s ? `${s.slice(0,8)}... len=${s.length}` : String(s)
      console.log('[api/auth/session] POST received — access:', preview(accessToken), ' refresh:', preview(refreshToken))
    } catch (e) {}

    if (!accessToken) return NextResponse.json({ ok: false, error: 'access_token required' }, { status: 400 })

    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    // Validate token by fetching user
    try {
      const { data, error } = await (supabaseAdmin as any).auth.getUser(accessToken)
      if (error || !data?.user) {
        console.warn('[api/auth/session] invalid access token', error)
        return NextResponse.json({ ok: false, error: 'invalid token' }, { status: 401 })
      }
      try { console.log('[api/auth/session] token validation succeeded for user id=', data.user?.id) } catch {}
    } catch (e) {
      console.error('[api/auth/session] token validation error', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

    // Set httpOnly cookies for access and refresh tokens
    const cookies: string[] = []
    // access token lifetime: short (1 hour)
    const accessMaxAge = 60 * 60 // 1 hour
    const refreshMaxAge = 60 * 60 * 24 * 30 // 30 days

    const safe = process.env.NODE_ENV === 'production'

    cookies.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessMaxAge}${safe ? '; Secure' : ''}`)
    if (refreshToken) {
      cookies.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${refreshMaxAge}${safe ? '; Secure' : ''}`)
    }

    // Persist server-side session record (if auth_sessions table exists)
    try {
      if (refreshToken && supabaseAdmin) {
        const hashed = await (async function digest(text: string) {
          try {
            const { createHash } = await import('crypto')
            return createHash('sha256').update(text).digest('hex')
          } catch (e) {
            return null
          }
        })(refreshToken)
        if (hashed) {
          const userRes = await (supabaseAdmin as any).auth.getUser(accessToken)
          const userId = userRes?.data?.user?.id || null
          const expiresAt = new Date(Date.now() + refreshMaxAge * 1000).toISOString()
          await supabaseAdmin.from('auth_sessions').upsert({ user_id: userId, refresh_token_hash: hashed, created_at: new Date().toISOString(), last_used_at: new Date().toISOString(), expires_at: expiresAt, revoked: false }, { onConflict: 'refresh_token_hash' })
        }
      }
    } catch (e) {
      console.warn('[api/auth/session] failed to persist server session', e)
    }

    const res = NextResponse.json({ ok: true })
    // Set cookies in response header
    for (const c of cookies) {
      try { console.log('[api/auth/session] setting cookie header:', c.split(';')[0]) } catch {}
      res.headers.append('Set-Cookie', c)
    }

    try { console.log('[api/auth/session] finished, returning OK') } catch {}
    return res
  } catch (e) {
    console.error('[api/auth/session] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ info: 'POST access_token to set HttpOnly cookie' })
}

export const runtime = 'nodejs'
