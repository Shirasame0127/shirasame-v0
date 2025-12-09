import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Do not force a default external API proxy. Proxy only when an explicit
// environment API base is configured. This allows Next.js internal API
// routes (e.g. `/api/images/direct-upload`) to handle requests when no
// external API is desired.
const DEFAULT_API_BASE = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || ''
const API_BASE = (process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).toString().replace(/\/$/, '')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) If this is an API request, proxy to the public worker
  if (pathname.startsWith('/api/')) {
    // 本番方針: /api/* は常に public-worker（外部 API ゲートウェイ）に送る
    const destOrigin = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE
    if (!destOrigin) {
      return new NextResponse(JSON.stringify({ error: 'API_BASE origin is not configured on admin-site. /api/* must be proxied to public-worker.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // Normalize: strip leading /api so that public-worker (which hosts
    // routes at root like /tag-groups) receives the expected path.
    const incomingPath = req.nextUrl.pathname.replace(/^\/api(?=\/|$)/, '')
    const destUrl = destOrigin.replace(/\/$/, '') + incomingPath + req.nextUrl.search

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
      // Strict auth: always require a successful server-side `whoami` check
      // against the external API base before allowing access to /admin pages.
      // Do NOT allow unauthenticated navigations to proceed directly — enforce login (redirect).
      const cookieHeader = req.headers.get('cookie') || ''

      // If no cookie present, redirect to login immediately.
      if (!cookieHeader) {
        const login = new URL('/admin/login', req.nextUrl.origin)
        login.searchParams.set('r', pathname)
        return NextResponse.redirect(login)
      }

      if (!API_BASE) {
        // Missing API base is a server config error — disallow access to admin.
        const login = new URL('/admin/login', req.nextUrl.origin)
        login.searchParams.set('r', pathname)
        return NextResponse.redirect(login)
      }

      const whoamiUrl = `${API_BASE}/api/auth/whoami`
      // Forward the incoming Cookie header so the API can read HttpOnly tokens
      const whoami = await fetch(whoamiUrl, { method: 'GET', headers: { cookie: cookieHeader, 'Content-Type': 'application/json' }, redirect: 'manual' })
      if (!whoami.ok) {
        const login = new URL('/admin/login', req.nextUrl.origin)
        login.searchParams.set('r', pathname)
        return NextResponse.redirect(login)
      }
      const json = await whoami.json().catch(() => null)
      if (!json || !json.ok || !json.user || !json.user.id) {
        const login = new URL('/admin/login', req.nextUrl.origin)
        login.searchParams.set('r', pathname)
        return NextResponse.redirect(login)
      }
      return NextResponse.next()
    } catch (e) {
      const login = new URL('/admin/login', req.nextUrl.origin)
      login.searchParams.set('r', pathname)
      return NextResponse.redirect(login)
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/api/:path*', '/admin/:path*'] }
