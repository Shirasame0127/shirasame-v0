import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const accessToken = body?.access_token
    const refreshToken = body?.refresh_token

    if (!accessToken) return NextResponse.json({ ok: false, error: 'access_token required' }, { status: 400 })
    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    try {
      const { data, error } = await (supabaseAdmin as any).auth.getUser(accessToken)
      if (error || !data?.user) {
        return NextResponse.json({ ok: false, error: 'invalid token' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

    const cookies: string[] = []
    const accessMaxAge = 60 * 60 * 24 * 7
    const refreshMaxAge = 60 * 60 * 24 * 30
    const safe = process.env.NODE_ENV === 'production'

    cookies.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessMaxAge}${safe ? '; Secure' : ''}`)
    if (refreshToken) cookies.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${refreshMaxAge}${safe ? '; Secure' : ''}`)

    try {
      if (refreshToken && supabaseAdmin) {
        const { createHash } = await import('crypto')
        const hashed = createHash('sha256').update(refreshToken).digest('hex')
        const userRes = await (supabaseAdmin as any).auth.getUser(accessToken)
        const userId = userRes?.data?.user?.id || null
        const expiresAt = new Date(Date.now() + refreshMaxAge * 1000).toISOString()
        await supabaseAdmin.from('auth_sessions').upsert({ user_id: userId, refresh_token_hash: hashed, created_at: new Date().toISOString(), last_used_at: new Date().toISOString(), expires_at: expiresAt, revoked: false }, { onConflict: 'refresh_token_hash' })
      }
    } catch (e) {
      console.warn('[api/auth/session] failed to persist server session', e)
    }

    const res = NextResponse.json({ ok: true })
    for (const c of cookies) res.headers.append('Set-Cookie', c)
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
