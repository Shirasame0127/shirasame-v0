// Design note:
// - Admin client MUST NOT call the public-worker origin directly from the
//   browser. Browser-origin requests on the admin domain must use the
//   same-origin `/api/*` proxy so that HttpOnly domain cookies are sent.
// - This module implements the server-side proxy that forwards `/api/*`
//   requests to the public worker and preserves cookies/identity headers.
// - Do not inject runtime API_BASE into admin HTML; client-side guards
//   (in `lib/api-client.ts`) additionally enforce same-origin behavior.

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
  // Prefer an explicit PUBLIC_WORKER_API_BASE env var; fall back to older name.
  const apiBase = (process.env.PUBLIC_WORKER_API_BASE || process.env.API_BASE_ORIGIN || 'https://public-worker.shirasame-official.workers.dev').replace(/\/$/, '')
  try {
    let url: URL
    try {
      url = new URL(req.url)
    } catch (e) {
      // Some callers construct `Request` with a relative path (eg. 
      // '/api/images/complete'). In that case, resolve against the
      // configured apiBase so we reliably compute the destination URL.
      url = new URL(req.url, apiBase)
    }
    // Preserve the incoming path when proxying to the public worker so
    // server routes defined with `/api/...` continue to match. Do not
    // strip the `/api` prefix here.
    const incomingPath = url.pathname
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

    // Always forward explicit identity headers if present (or empty string)
    try {
      const xuid = req.headers.get('x-user-id') || req.headers.get('X-User-Id') || ''
      proxyHeaders.set('X-User-Id', xuid)
    } catch {}
    try {
      const auth = req.headers.get('authorization') || req.headers.get('Authorization') || ''
      if (auth) proxyHeaders.set('Authorization', auth)
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

    let resp = null
    try {
      resp = await fetch(dest, init)
    } catch (e) {
      // Attempt a conservative fallback to the canonical public-worker host
      // if an explicit API base failed (network glitch / DNS / routing).
      try {
        const fallbackBase = 'https://public-worker.shirasame-official.workers.dev'
        const url = new URL(req.url)
        const incomingPath = url.pathname
        const fallbackDest = fallbackBase.replace(/\/$/, '') + incomingPath + url.search
        resp = await fetch(fallbackDest, init)
      } catch (e2) {
        return new Response(JSON.stringify({ ok: false, error: 'proxy_fetch_failed', detail: String(e2) }), { status: 502, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // If we got a server error from the worker, try a single fallback attempt
    if (resp && resp.status >= 500) {
      try {
        const fallbackBase = 'https://public-worker.shirasame-official.workers.dev'
        const url = new URL(req.url)
        const incomingPath = url.pathname
        const fallbackDest = fallbackBase.replace(/\/$/, '') + incomingPath + url.search
        const tryResp = await fetch(fallbackDest, init)
        if (tryResp && tryResp.ok) resp = tryResp
      } catch (e) {
        // ignore — we'll return the original resp below
      }
    }

    // Copy response headers. Append multiple Set-Cookie values instead of
    // overwriting so we don't lose sb-access-token or sb-refresh-token.
    const respHeaders = new Headers()
    resp.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'set-cookie') respHeaders.append(k, v)
      else respHeaders.set(k, v)
    })

    const body = await resp.arrayBuffer()
    // If the proxied worker returned an unhelpful Cloudflare error page (HTML),
    // normalize to a JSON error so the admin client doesn't try to render HTML.
    const ct = resp.headers.get('content-type') || ''
    if ((ct.indexOf('text/html') !== -1) || (/^\s*<!(doctype|html)|^\s*<html/i.test(new TextDecoder().decode(new Uint8Array(body.slice(0, 128)))))) {
      return new Response(JSON.stringify({ ok: false, error: 'upstream_html', status: resp.status }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(body, { status: resp.status, headers: respHeaders })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export default forwardToPublicWorker
