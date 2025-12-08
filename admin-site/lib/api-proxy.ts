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
    // preserve the exact /api/... path and query
    const dest = apiBase.replace(/\/$/, '') + url.pathname + url.search

    const headers = await cloneHeaders(req.headers)

    const init: RequestInit = {
      method: req.method,
      headers,
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
