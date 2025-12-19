// Minimal middleware utilities used by public-worker
export function computeCorsHeaders(origin: string | null, env: any) {
  try {
    const allowedRaw = (env && env.PUBLIC_ALLOWED_ORIGINS) ? String(env.PUBLIC_ALLOWED_ORIGINS) : '*'
    const allowedList = allowedRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
    const headers: Record<string,string> = {}
    let allowOrigin = '*'
    if (allowedRaw === '*') {
      allowOrigin = '*'
    } else if (origin && allowedList.includes(origin)) {
      allowOrigin = origin
    } else if (origin) {
      // Support simple wildcard entries like '*.pages.dev' or 'https://*.pages.dev'
      const matches = allowedList.some((entry: string) => {
        if (!entry) return false
        if (entry.indexOf('*') === -1) return entry === origin || entry === (new URL(origin)).hostname
        // convert wildcard to regex
        const pattern = entry.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\\\*/g, '.*')
        try {
          const re = new RegExp('^' + pattern + '$')
          return re.test(origin) || re.test((new URL(origin)).hostname)
        } catch {
          return false
        }
      })
      if (matches) allowOrigin = origin
    } else if (allowedList.length === 1) {
      allowOrigin = allowedList[0]
    } else {
      // Fallback: return first allowed origin to keep header present.
      allowOrigin = allowedList[0] || '*'
    }

    headers['Access-Control-Allow-Origin'] = allowOrigin
    headers['Vary'] = 'Origin'
    headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-User-Id'
    headers['Access-Control-Allow-Credentials'] = 'false'
    return headers
  } catch {
    return { 'Access-Control-Allow-Origin': '*' }
  }
}

// Normalize response objects for clients: add camelCase aliases for snake_case keys.
function toCamel(s: string) {
  return s.replace(/_([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase())
}

function normalizeValue(v: any): any {
  if (Array.isArray(v)) return v.map(normalizeValue)
  if (v && typeof v === 'object' && !(v instanceof Date)) return normalizeObject(v)
  return v
}

function normalizeObject(obj: any): any {
  const out: any = Array.isArray(obj) ? [] : {}
  for (const k of Object.keys(obj || {})) {
    const v = obj[k]
    const normV = normalizeValue(v)
    out[k] = normV
    try {
      const ck = toCamel(k)
      if (ck && ck !== k && typeof out[ck] === 'undefined') out[ck] = normV
    } catch {}
  }
  return out
}

function normalizeForClient(body: any): any {
  try {
    if (body == null) return body
    // If wrapper like { data, meta }
    if (typeof body === 'object' && body !== null && 'data' in body) {
      const d = body.data
      if (Array.isArray(d)) {
        return Object.assign({}, body, { data: d.map(normalizeValue) })
      }
      if (d && typeof d === 'object') {
        return Object.assign({}, body, { data: normalizeValue(d) })
      }
      return body
    }
    // If body is array or object, normalize recursively
    if (Array.isArray(body)) return body.map(normalizeValue)
    if (typeof body === 'object') return normalizeValue(body)
    return body
  } catch (e) {
    return body
  }
}

// cacheJson is a small helper to return json with caching headers
export async function cacheJson(arg1: any, arg2?: any, arg3?: any) {
  // Dual-purpose helper:
  // - Called as cacheJson(c, key, asyncFn) -> executes asyncFn(), wraps result with CORS and cache headers
  // - Called as cacheJson(body, opts) -> immediate Response with cache + CORS if no context
  try {
    // Detect (c, key, fn) form when arg1 has `req` and arg3 is a function
    if (arg1 && typeof arg1 === 'object' && typeof arg1.req === 'object' && typeof arg3 === 'function') {
      const c = arg1
      const fn = arg3
      const opts = typeof arg2 === 'object' && arg2 && arg2.maxAge ? arg2 : { maxAge: 60 }
      const maxAge = typeof opts.maxAge === 'number' ? opts.maxAge : 60
      let body = await fn()
      // If handler returned a Response object directly, extract its text/status
      // and normalize the parsed JSON if possible. This preserves original
      // status codes while still applying CORS/cache headers and normalization.
      try {
        if (body && typeof (body as any).text === 'function' && typeof (body as any).status === 'number' && (body as any).headers) {
          const resp = body as Response
          const txt = await resp.text()
          try {
            const parsed = JSON.parse(txt)
            const norm = normalizeForClient(parsed)
            const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
            const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
            return new Response(JSON.stringify(norm), { status: resp.status || 200, headers })
          } catch {
            const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
            const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
            return new Response(txt, { status: resp.status || 200, headers })
          }
        }
      } catch {}

      try {
        body = normalizeForClient(body)
      } catch {}
      const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify(body), { status: 200, headers })
    }

    // Fallback: treat as (body, opts)
    let body = arg1
    const opts = typeof arg2 === 'object' && arg2 && arg2.maxAge ? arg2 : { maxAge: 60 }
    const maxAge = typeof opts.maxAge === 'number' ? opts.maxAge : 60
    // When no context is provided, still return safe permissive CORS headers so
    // browser requests are not blocked. Consumers should prefer calling cacheJson(c, key, fn).
    const headers: Record<string,string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300`,
      'Access-Control-Allow-Origin': '*',
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Id',
      'Access-Control-Allow-Credentials': 'false'
    }
    try {
      body = normalizeForClient(body)
    } catch {}
    return new Response(JSON.stringify(body), { status: 200, headers })
  } catch (e) {
    // On error, return safe JSON with CORS when possible
    try {
      if (arg1 && typeof arg1 === 'object' && typeof arg1.req === 'object') {
        const c = arg1
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers })
      }
    } catch {}
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}

export default { computeCorsHeaders, cacheJson }
