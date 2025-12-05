import { NextResponse } from 'next/server'

async function exchangeCodeForTokens(supabaseUrl: string, anonKey: string, code: string, redirectTo: string) {
  const tokenUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=authorization_code`
  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
    },
    body: JSON.stringify({ code, redirect_to: redirectTo }),
  })
  const json = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, json }
}

function cookieString(name: string, value: string, maxAge: number, secure: boolean) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

function redirectWithError(url: URL, code: string) {
  const u = new URL('/admin/login', url)
  u.searchParams.set('oauth_error', code)
  return NextResponse.redirect(u)
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      console.warn('[api/auth/callback] no code')
      return redirectWithError(url, 'no_code')
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!SUPABASE_URL || !ANON_KEY) {
      console.error('[api/auth/callback] supabase anon config missing')
      return redirectWithError(url, 'config_missing')
    }

    const redirectTo = `${url.origin}/api/auth/callback`
    const exchanged = await exchangeCodeForTokens(SUPABASE_URL, ANON_KEY, code, redirectTo)
    if (!exchanged.ok) {
      console.warn('[api/auth/callback] exchange failed', exchanged.status, exchanged.json)
      return redirectWithError(url, 'exchange_failed')
    }

    const data = exchanged.json || {}
    const accessToken = data.access_token
    const refreshToken = data.refresh_token
    if (!accessToken) {
      console.error('[api/auth/callback] access token missing')
      return redirectWithError(url, 'access_missing')
    }

    const accessMaxAge = 60 * 60
    const refreshMaxAge = 60 * 60 * 24 * 30
    const safe = process.env.NODE_ENV === 'production'

    const res = NextResponse.redirect(new URL('/admin', url))
    res.headers.append('Set-Cookie', cookieString('sb-access-token', accessToken, accessMaxAge, safe))
    if (refreshToken) res.headers.append('Set-Cookie', cookieString('sb-refresh-token', refreshToken, refreshMaxAge, safe))

    try {
      if (refreshToken) {
        const hashed = await (async function digest(text: string) {
          try { const { createHash } = await import('crypto'); return createHash('sha256').update(text).digest('hex') } catch { return null }
        })(refreshToken)
        if (hashed) {
          try {
            const tokenCheck = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, { headers: { Authorization: `Bearer ${accessToken}`, apikey: ANON_KEY } })
            const ud = await tokenCheck.json().catch(() => ({}))
            const userId = ud?.id || ud?.user?.id || null
            await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/auth_sessions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates',
                'Authorization': `Bearer ${SERVICE_ROLE}`,
              },
              body: JSON.stringify({ user_id: userId, refresh_token_hash: hashed, created_at: new Date().toISOString(), last_used_at: new Date().toISOString(), expires_at: new Date(Date.now() + refreshMaxAge * 1000).toISOString(), revoked: false }),
            }).catch(() => {})
          } catch (e) {
            console.warn('[api/auth/callback] persist auth_sessions failed', e)
          }
        }
      }
    } catch (e) {
      console.warn('[api/auth/callback] unexpected session persist error', e)
    }

    return res
  } catch (e) {
    console.error('[api/auth/callback] exception', e)
    try { return redirectWithError(new URL(req.url), 'internal_error') } catch { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }) }
  }
}

export const runtime = 'nodejs'
