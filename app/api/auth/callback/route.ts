import { NextResponse } from 'next/server'

async function exchangeCodeForTokens(supabaseUrl: string, serviceRole: string, code: string, redirectTo: string) {
  const tokenUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token`
  const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_to=${encodeURIComponent(redirectTo)}`
  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${serviceRole}`,
    },
    body,
  })
  const json = await resp.json().catch(() => ({}))
  return { ok: resp.ok, status: resp.status, json }
}

function cookieString(name: string, value: string, maxAge: number, secure: boolean) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) {
      console.warn('[api/auth/callback] no code in callback')
      // If no code, redirect to login
      const redirect = NextResponse.redirect(new URL('/admin/login', url))
      return redirect
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error('[api/auth/callback] missing supabase config')
      return NextResponse.redirect(new URL('/admin/login', url))
    }

    // Exchange code for tokens server-side using service role key
    const redirectTo = `${url.origin}/api/auth/callback`
    const exchanged = await exchangeCodeForTokens(SUPABASE_URL, SERVICE_ROLE, code, redirectTo)

    if (!exchanged.ok) {
      console.warn('[api/auth/callback] token exchange failed', exchanged.status, exchanged.json)
      const fail = NextResponse.redirect(new URL('/admin/login', url))
      // clear any partial cookies
      const safe = process.env.NODE_ENV === 'production'
      fail.headers.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`)
      fail.headers.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`)
      return fail
    }

    const data = exchanged.json || {}
    const accessToken = data.access_token
    const refreshToken = data.refresh_token

    if (!accessToken) {
      console.error('[api/auth/callback] no access token in exchange response')
      return NextResponse.redirect(new URL('/admin/login', url))
    }

    // Set cookies
    const accessMaxAge = 60 * 60 // 1 hour
    const refreshMaxAge = 60 * 60 * 24 * 30 // 30 days
    const safe = process.env.NODE_ENV === 'production'

    const res = NextResponse.redirect(new URL('/admin', url))
    res.headers.append('Set-Cookie', cookieString('sb-access-token', accessToken, accessMaxAge, safe))
    if (refreshToken) res.headers.append('Set-Cookie', cookieString('sb-refresh-token', refreshToken, refreshMaxAge, safe))

    // Persist server-side session record (if auth_sessions table exists)
    try {
      const hashed = await (async function digest(text: string) {
        try {
          const { createHash } = await import('crypto')
          return createHash('sha256').update(text).digest('hex')
        } catch (e) {
          return null
        }
      })(refreshToken)
      if (hashed) {
        // call supabase to get user id
        try {
          const tokenCheck = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, { headers: { Authorization: `Bearer ${accessToken}` } })
          const ud = await tokenCheck.json().catch(() => ({}))
          const userId = ud?.id || ud?.user?.id || null
          const supabaseAdminUrl = SUPABASE_URL.replace(/\/$/, '')
          // use REST upsert with service role
          try {
            await fetch(`${supabaseAdminUrl}/rest/v1/auth_sessions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates',
                'Authorization': `Bearer ${SERVICE_ROLE}`,
              },
              body: JSON.stringify({ user_id: userId, refresh_token_hash: hashed, created_at: new Date().toISOString(), last_used_at: new Date().toISOString(), expires_at: new Date(Date.now() + refreshMaxAge * 1000).toISOString(), revoked: false }),
            }).catch(() => {})
          } catch (e) {}
        } catch (e) {}
      }
    } catch (e) {
      console.warn('[api/auth/callback] failed to persist auth_sessions', e)
    }

    return res
  } catch (e) {
    console.error('[api/auth/callback] exception', e)
    try { return NextResponse.redirect(new URL('/admin/login')) } catch { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }) }
  }
}

export const runtime = 'nodejs'
