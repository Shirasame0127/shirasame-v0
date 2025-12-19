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
export function cacheJson(body: any, opts?: { maxAge?: number }) {
  const maxAge = typeof opts?.maxAge === 'number' ? opts.maxAge : 60
  const headers: Record<string,string> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=300` }
  return new Response(JSON.stringify(body), { status: 200, headers })
}

export default { computeCorsHeaders, cacheJson }
