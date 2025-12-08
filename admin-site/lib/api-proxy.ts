async function cloneHeaders(headers: Headers) {
  const out = new Headers()
  for (const [k, v] of headers.entries()) {
    // Avoid passing host header
    if (k.toLowerCase() === 'host') continue
    out.set(k, v)
  }
  return out
}

export async function forwardToPublicWorker(req: Request) {
  const apiBase = process.env.API_BASE_ORIGIN || 'https://public-worker.shirasame-official.workers.dev'
  try {
    const url = new URL(req.url)
    // Map incoming /api/... paths to public-worker routes which are mounted
    // at the root (e.g. /tag-groups). Strip a leading /api prefix when present.
    const incomingPath = url.pathname.replace(/^\/api(?=\/|$)/, '')
    const dest = apiBase.replace(/\/$/, '') + incomingPath + url.search

    // Build proxy headers from scratch to avoid Cloudflare Workers
    // dropping the Cookie when reusing a frozen/filtered headers object.
    const proxyHeaders = new Headers()
    // Copy all incoming headers except host/cookie (we'll set them explicitly)
    try {
      for (const [k, v] of req.headers.entries()) {
        const lk = k.toLowerCase()
        if (lk === 'host' || lk === 'cookie') continue
        proxyHeaders.set(k, v)
      }
    } catch {}

    // Explicitly forward cookie exactly as received from the browser
    try {
      const cookie = req.headers.get('cookie') || req.headers.get('Cookie') || ''
      proxyHeaders.set('Cookie', cookie)
    } catch {}

    // Ensure Host matches the public-worker origin when necessary
    try {
      const originHost = (new URL(apiBase)).host
      proxyHeaders.set('Host', originHost)
    } catch {}

    const init: RequestInit = {
      method: req.method,
      headers: proxyHeaders,
      // body can be forwarded directly; for GET/HEAD there is no body
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      // keep credentials via cookie header if present
      redirect: 'manual',
    }

    const resp = await fetch(dest, init)

    // Copy response headers. Append multiple Set-Cookie values instead of
    // overwriting so we don't lose sb-access-token or sb-refresh-token.
    const respHeaders = new Headers()
    resp.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'set-cookie') respHeaders.append(k, v)
      else respHeaders.set(k, v)
    })

    const body = await resp.arrayBuffer()
    return new Response(body, { status: resp.status, headers: respHeaders })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export default forwardToPublicWorker
