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

    const headers = new Headers(req.headers as any)
    headers.delete('host')

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

    const res = await fetch(destUrl, { method: req.method, headers, body, redirect: 'manual' })
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
      const origin = req.nextUrl.origin
      const whoami = await fetch(`${origin}/api/auth/whoami`, { method: 'GET', headers: { cookie: req.headers.get('cookie') || '' }, redirect: 'manual' })
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
