import { NextResponse } from 'next/server'

function buildAuthorizeUrl(base: string, provider: string, redirectTo: string) {
  const u = new URL(base.replace(/\/$/, '') + '/auth/v1/authorize')
  u.searchParams.set('provider', provider)
  u.searchParams.set('redirect_to', redirectTo)
  return u.toString()
}

function redirectWithError(origin: string, code: string) {
  return NextResponse.redirect(`${origin}/admin/login?oauth_error=${code}`)
}

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    if (!SUPABASE_URL) {
      console.warn('[api/auth/google] SUPABASE_URL missing')
      return redirectWithError(origin, 'config_missing')
    }
    // コールバックでコードを受け取るURL
    const callbackUrl = origin + '/api/auth/callback'
    const authorizeUrl = buildAuthorizeUrl(SUPABASE_URL, 'google', callbackUrl)
    return NextResponse.redirect(authorizeUrl)
  } catch (e) {
    console.error('[api/auth/google] exception', e)
    const origin = (() => { try { return new URL(req.url).origin } catch { return '' } })()
    if (origin) return redirectWithError(origin, 'internal_error')
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
