import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Policy:
// - In development, prefer Next.js internal `/api` routes unless the
//   developer explicitly opts into using an external API via
//   `ADMIN_FORCE_EXTERNAL_API=true` (this makes local dev easier).
// - In production, proxy to an explicit external API base when configured.
const DEFAULT_API_BASE = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || ''
const FORCE_EXTERNAL = String(process.env.ADMIN_FORCE_EXTERNAL_API || '').toLowerCase() === 'true'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) If this is an API request, proxy to the public worker only when
  // an external API base is explicitly configured. If no external API is
  // configured, allow Next.js internal `/api` routes to handle the request
  // (useful for local development where the admin site implements APIs).
  if (pathname.startsWith('/api/')) {
    const destOrigin = process.env.API_BASE_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE
    // If we're in development and the developer hasn't explicitly forced
    // external proxying, prefer Next.js internal API handlers so the
    // admin site can run standalone locally.
    const isDev = (process.env.NODE_ENV || '').toLowerCase() !== 'production'
    if (!destOrigin || (isDev && !FORCE_EXTERNAL)) {
      return NextResponse.next()
    }

    // Forward the incoming path as-is to the public-worker. Historically
    // we stripped `/api` for some routes, but the public-worker exposes
    // many APIs under `/api/...` — stripping caused 404s such as
    // `/api/recipes/counts` -> `/recipes/counts`. Preserve the path to
    // ensure requests reach the intended handler.
    const incomingPath = req.nextUrl.pathname
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
    // In development, force upstream to return uncompressed responses so
    // middleware can reliably UTF-8 decode JSON/text. Do NOT do this in
    // production to avoid changing upstream compression behavior.
    try {
      if (isDev) proxyHeaders.set('Accept-Encoding', 'identity')
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

    let res: Response
    try {
      res = await fetch(destUrl, { method: req.method, headers: proxyHeaders, body, redirect: 'manual' })
    } catch (e: any) {
      const isDev = (process.env.NODE_ENV || '').toLowerCase() !== 'production'
      const payload: any = { ok: false, error: 'proxy_fetch_failed' }
      if (isDev) payload.detail = String(e)
      return NextResponse.json(payload, { status: 502 })
    }

    try {
      const responseHeaders = new Headers(res.headers)
      // Remove transfer-encoding; keep content-encoding unless we explicitly
      // decompressed the body below. Removing content-encoding when the body
      // is still compressed causes browsers to mis-decode bytes (mojibake).
      responseHeaders.delete('transfer-encoding')
      const contentEnc = res.headers.get('content-encoding') || ''
      const buf = await res.arrayBuffer()

      // If upstream response is compressed (gzip/br/deflate), we cannot
      // safely decode/decompress here in the Edge runtime. Preserve the
      // original headers and return the raw body so the browser can handle
      // decompression. This avoids mojibake caused by removing
      // Content-Encoding while leaving compressed bytes.
      if (contentEnc) {
        return new NextResponse(buf, { status: res.status, headers: responseHeaders })
      }

      // Determine content-type (lowercased) for smart decoding
      const ctRaw = res.headers.get('content-type') || ''
      const ct = ctRaw.toLowerCase()

      // If upstream returned HTML (likely an error page), normalize to JSON
      const snippet = new TextDecoder('utf-8').decode(new Uint8Array(buf.slice(0, 128)))
      if (ct.indexOf('text/html') !== -1 || /^\s*<!(doctype|html)|^\s*<html/i.test(snippet)) {
        return NextResponse.json({ ok: false, error: 'upstream_html', status: res.status }, { status: 502 })
      }

      // If response is JSON, decode as UTF-8 and return via NextResponse.json
      if (ct.indexOf('application/json') !== -1) {
        try {
          const text = new TextDecoder('utf-8').decode(buf)
          const obj = JSON.parse(text)
          // remove content-length to allow Next to set correct length
          responseHeaders.delete('content-length')
          return NextResponse.json(obj, { status: res.status, headers: responseHeaders })
        } catch (e) {
          // fallthrough to return raw text below
        }
      }

      // If textual content (text/*, javascript, xml, etc), decode as utf-8
      if (ct.startsWith('text/') || ct.indexOf('application/javascript') !== -1 || ct.indexOf('application/xml') !== -1) {
        const text = new TextDecoder('utf-8').decode(buf)
        // ensure charset is explicit
        if (ctRaw && !/charset=/i.test(ctRaw)) responseHeaders.set('content-type', (ctRaw || 'text/plain') + '; charset=utf-8')
        responseHeaders.delete('content-length')
        return new NextResponse(text, { status: res.status, headers: responseHeaders })
      }

      // Binary fallback: return raw ArrayBuffer with headers (images, etc)
      return new NextResponse(buf, { status: res.status, headers: responseHeaders })
    } catch (e: any) {
      const isDev = (process.env.NODE_ENV || '').toLowerCase() !== 'production'
      const payload: any = { ok: false, error: 'proxy_response_failed' }
      if (isDev) payload.detail = String(e)
      return NextResponse.json(payload, { status: 502 })
    }
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
