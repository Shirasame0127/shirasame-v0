// Minimal middleware utilities used by public-worker
export function computeCorsHeaders(origin: string | null, env: any) {
  try {
    const allowed = (env && env.PUBLIC_ALLOWED_ORIGINS) ? String(env.PUBLIC_ALLOWED_ORIGINS) : '*'
    const headers: Record<string,string> = {}
    headers['Access-Control-Allow-Origin'] = allowed === '*' ? '*' : allowed
    headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
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
