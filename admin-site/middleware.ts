import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Do not force a default external API proxy. Proxy only when an explicit
// environment API base is configured. This allows Next.js internal API
// routes (e.g. `/api/images/direct-upload`) to handle requests when no
// external API is desired.
const DEFAULT_API_BASE = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || ''

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) If this is an API request, proxy to the public worker
  if (pathname.startsWith('/api/')) {
    // 本番方針: /api/* は常に public-worker（外部 API ゲートウェイ）に送る
    const destOrigin = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE
    if (!destOrigin) {
      return new NextResponse(JSON.stringify({ error: 'API_BASE origin is not configured on admin-site. /api/* must be proxied to public-worker.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const destUrl = destOrigin.replace(/\/$/, '') + req.nextUrl.pathname + req.nextUrl.search

    // Build proxy headers from scratch to avoid Next/Cloudflare dropping Cookie
    const proxyHeaders = new Headers()
    try {
      for (const [k, v] of req.headers.entries()) {
        const lk = k.toLowerCase()
        if (lk === 'host' || lk === 'cookie') continue
        proxyHeaders.set(k, v)
      }
    } catch {}
    try {
      const cookie = req.headers.get('cookie') || req.headers.get('Cookie') || ''
      proxyHeaders.set('Cookie', cookie)
    } catch {}
    try {
      const originHost = (new URL(destOrigin)).host
      proxyHeaders.set('Host', originHost)
    } catch {}

    // Preserve the raw body for non-GET/HEAD requests to avoid corrupting
    // multipart/form-data (do not convert to text). NextRequest exposes the
    // body which can be forwarded directly.
    let body: BodyInit | undefined = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        body = req.body
      } catch {
        body = undefined
      }
    }

    const res = await fetch(destUrl, { method: req.method, headers: proxyHeaders, body, redirect: 'manual' })
    const responseHeaders = new Headers(res.headers)
    responseHeaders.delete('transfer-encoding')
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, { status: res.status, headers: responseHeaders })
  }

  // 2) Admin route guard
  if (pathname.startsWith('/admin')) {
    // Allow the login page and _next assets
    if (pathname === '/admin/login' || pathname.startsWith('/admin/_next') || pathname.startsWith('/_next')) {
      return NextResponse.next()
    }

    try {
      // If there are no cookies and this is a top-level HTML GET navigation,
      // allow the request to proceed so client-side initialization (which
      // POSTS the Supabase session to `/api/auth/session`) can run before
      // the server-side whoami/refresh check. This prevents the auth guard
      // from preemptively redirecting the browser and ensures session
      // synchronization happens once on page load.
      const cookieHeader = req.headers.get('cookie') || ''
      // If there is no cookie, immediately redirect to the login page.
      // The login page is responsible for obtaining a Supabase session and
      // POSTing it to `/api/auth/session` to synchronize cookies. Middleware
      // should not attempt to manage sessions or call Supabase directly.
      if (!cookieHeader) {
        const login = new URL('/admin/login', req.nextUrl.origin)
        login.searchParams.set('r', pathname)
        return NextResponse.redirect(login)
      }

      const origin = req.nextUrl.origin
      const whoami = await fetch(`${origin}/api/auth/whoami`, { method: 'GET', headers: { cookie: cookieHeader }, redirect: 'manual' })
      if (!whoami.ok) {
        const login = new URL('/admin/login', origin); login.searchParams.set('r', pathname); return NextResponse.redirect(login)
      }
      const json = await whoami.json().catch(() => null)
      if (!json || !json.ok || !json.user || !json.user.id) { const login = new URL('/admin/login', origin); login.searchParams.set('r', pathname); return NextResponse.redirect(login) }
      return NextResponse.next()
    } catch (e) {
      const login = new URL('/admin/login', req.nextUrl.origin); login.searchParams.set('r', pathname); return NextResponse.redirect(login)
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/api/:path*', '/admin/:path*'] }
