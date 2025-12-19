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
      try {
        const headers = computePublicCorsHeaders(c.req.header('Origin') || null, c.env)
        for (const k of Object.keys(headers)) {
          try { res.headers.set(k, (headers as any)[k]) } catch {}
        }
      } catch {}
      return res
    } catch (e: any) {
      const headers = computePublicCorsHeaders(c.req.header('Origin') || null, c.env)
      headers['Content-Type'] = 'application/json; charset=utf-8'
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers })
    }
  })
}
