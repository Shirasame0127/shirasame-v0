import type { Hono } from 'hono'
import { computeCorsHeaders } from '../utils/cors'

export function registerPublicCors(app: any) {
  // Register a global wrapper so any handler that returns a Response
  // (including early returns) for paths under /api/public will be
  // wrapped and have CORS headers merged. This ensures no code path
  // can accidentally return a Response without the required headers.
  app.use('*', async (c: any, next: any) => {
    try {
      const reqPath = (new URL(c.req.url)).pathname || ''
      if (!reqPath.startsWith('/api/public')) {
        return await next()
      }

      // Preflight
        if ((c.req.method || '').toUpperCase() === 'OPTIONS') {
          const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
        return new Response(null, { status: 204, headers })
      }

      const res = await next()
      // Ensure CORS headers are present on every returned Response by
      // creating a new Response that merges existing headers with CORS.
      try {
          const cors = computeCorsHeaders(c.req.header('Origin') || null, c.env)
        // Build merged headers
        const merged = new Headers()
        try {
          // copy existing headers from upstream response
          if (res && res.headers) {
            for (const [k, v] of Array.from(res.headers.entries())) {
              merged.set(k, v)
            }
          }
        } catch {}
        // set/override with CORS headers
        for (const k of Object.keys(cors)) {
          try { merged.set(k, (cors as any)[k]) } catch {}
        }
        // Ensure API responses are not cached by intermediate CDN (helps
        // replace stale cached responses that lack CORS headers).
        try { merged.set('Cache-Control', 'no-store') } catch {}

        // Create a new Response preserving status and body
        const body = res && typeof res.arrayBuffer === 'function' ? await res.arrayBuffer() : null
        const newRes = new Response(body, {
          status: res?.status || 200,
          statusText: res?.statusText || undefined,
          headers: merged,
        })
        return newRes
      } catch (err) {
        // If merging fails, fall back to original response
        try { return res } catch { return new Response(null, { status: 500 }) }
      }
    } catch (e: any) {
      const headers = computeCorsHeaders(c.req.header('Origin') || null, c.env)
      headers['Content-Type'] = 'application/json; charset=utf-8'
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers })
    }
  })
}
