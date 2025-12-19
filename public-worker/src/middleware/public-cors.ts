import type { Hono } from 'hono'

function computePublicCorsHeaders(origin: string | null, env: any) {
  const allowedEnv = ((env && env.PUBLIC_ALLOWED_ORIGINS) || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  const defaults = ['https://www.shirasame.com', 'https://shirasame.com']
  let acOrigin = '*'

  if (allowedEnv.length > 0) {
    if (allowedEnv.indexOf('*') !== -1) {
      acOrigin = '*'
    } else if (origin && allowedEnv.indexOf(origin) !== -1) {
      acOrigin = origin
    } else {
      acOrigin = allowedEnv[0]
    }
  } else {
    if (origin && defaults.indexOf(origin) !== -1) acOrigin = origin
    else acOrigin = '*'
  }

  // Never allow admin origin on public API
  if (typeof acOrigin === 'string' && acOrigin.includes('admin.shirasame.com')) {
    acOrigin = '*'
  }

  return {
    'Access-Control-Allow-Origin': acOrigin,
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Expose-Headers': 'ETag',
    'Vary': 'Origin',
    'X-Served-By': 'public-worker'
  }
}

export function registerPublicCors(app: any) {
  // Apply to all public routes
  app.use('/api/public/*', async (c: any, next: any) => {
    try {
      // Preflight
      if ((c.req.method || '').toUpperCase() === 'OPTIONS') {
        const headers = computePublicCorsHeaders(c.req.header('Origin') || null, c.env)
        return new Response(null, { status: 204, headers })
      }

      const res = await next()
      // Ensure CORS headers are present on every returned Response by
      // creating a new Response that merges existing headers with CORS.
      try {
        const cors = computePublicCorsHeaders(c.req.header('Origin') || null, c.env)
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
      const headers = computePublicCorsHeaders(c.req.header('Origin') || null, c.env)
      headers['Content-Type'] = 'application/json; charset=utf-8'
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers })
    }
  })
}
