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
      const body = await fn()
      const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify(body), { status: 200, headers })
    }

    // Fallback: treat as (body, opts)
    const body = arg1
    const opts = typeof arg2 === 'object' && arg2 && arg2.maxAge ? arg2 : { maxAge: 60 }
    const maxAge = typeof opts.maxAge === 'number' ? opts.maxAge : 60
    const headers: Record<string,string> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
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
