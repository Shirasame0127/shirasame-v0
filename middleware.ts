import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect /admin routes by requiring a valid Supabase access token cookie.
// Prefer local JWT verification using `SUPABASE_JWT_SECRET`. If that secret
// is not present, fall back to calling Supabase `/auth/v1/user` (slower).
// On invalid/expired tokens we clear auth cookies and redirect to `/admin/login`.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()

  // Allow skipping auth checks via env var for development/troubleshooting.
  // Set `DISABLE_AUTH=true` in `.env.local` to disable middleware auth and avoid
  // token-based redirects (useful for reproducing/fixing redirect loops).
  const disableAuth = (process.env.DISABLE_AUTH || '').toLowerCase() === 'true'
  if (disableAuth) {
    try { console.warn('[middleware] DISABLE_AUTH enabled — skipping auth checks') } catch {}
    return NextResponse.next()
  }

  try {
    console.log('[middleware] visiting', pathname)
  } catch (e) {
    // ignore
  }

  const cookie = req.cookies.get('sb-access-token')
  if (!cookie) {
    try { console.warn('[middleware] sb-access-token cookie missing — redirecting to /admin/login') } catch {}
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  const token = cookie.value
  try {
    console.log('[middleware] sb-access-token present, token_len=', token?.length, 'token_pref=', token?.slice?.(0,8))
  } catch (e) {
    // ignore
  }

  // Try local JWT verification first (dynamic import so app can still run
  // when `jose` isn't installed). If verification fails or `jose` isn't
  // available we fall back to the remote Supabase /auth/v1/user check below.
  const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET || ''
  if (jwtSecret) {
    try {
      const mod = await import('jose')
      const { jwtVerify } = mod as any
      const encoder = new TextEncoder()
      await jwtVerify(token, encoder.encode(jwtSecret))
      try { console.log('[middleware] local JWT verify succeeded') } catch {}
      return NextResponse.next()
    } catch (e) {
      console.warn('[middleware] local jwt verify failed or jose missing', e)
    }
  }

  // Fallback: ask Supabase auth for the user associated with the token
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  if (!SUPABASE_URL) {
    // No configuration available — fall back to presence check only
    return NextResponse.next()
  }

  try {
    const userUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const headers: Record<string,string> = { Authorization: `Bearer ${token}` }
    if (anonKey) headers.apikey = anonKey
    const resp = await fetch(userUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!resp.ok) {
      console.warn('[middleware] remote /auth/v1/user returned non-ok:', resp.status)

      // Avoid無限再試行: まだリフレッシュ未試行の場合だけ1度だけ試す
      const attempted = req.cookies.get('sb-refresh-attempted')?.value === '1'
      if (!attempted) {
        try {
          const refreshUrl = new URL('/api/auth/refresh', req.url).toString()
          console.log('[middleware] attempting single server-side refresh at', refreshUrl)
          const refreshResp = await fetch(refreshUrl, {
            method: 'POST',
            headers: { cookie: req.headers.get('cookie') || '' },
            cache: 'no-store',
          })
          if (refreshResp.ok) {
            try { console.log('[middleware] refresh succeeded; continuing request') } catch {}
            // マーカーCookieをクリアするためレスポンスで上書き（Max-Age=0）
            const passNext = NextResponse.next()
            passNext.cookies.set('sb-refresh-attempted', '0', { path: '/', maxAge: 0 })
            return passNext
          }
          console.warn('[middleware] single refresh failed, status=', refreshResp.status)
        } catch (e) {
          console.warn('[middleware] single refresh attempt error', e)
        }
      }

      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      const res = NextResponse.redirect(url)
      res.cookies.delete('sb-access-token')
      res.cookies.delete('sb-refresh-token')
      // 以後同一セッションで再試行しない印としてマーカー
      res.cookies.set('sb-refresh-attempted', '1', { path: '/', httpOnly: true })
      return res
    }

    return NextResponse.next()
  } catch (e) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    const res = NextResponse.redirect(url)
    res.cookies.delete('sb-access-token')
    res.cookies.delete('sb-refresh-token')
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
