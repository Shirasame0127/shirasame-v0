import { forwardToPublicWorker } from '@/lib/api-proxy'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

// Compatibility route: some older client bundles post to /api/images/save.
// Forward as a POST to /api/images/complete on the public worker.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // Input size guard: reject very large payloads early.
    const MAX_BYTES = Number(process.env.IMAGE_SAVE_MAX_BYTES || 5 * 1024 * 1024) // default 5MB
    const contentLength = Number(req.headers.get('content-length') || '0') || 0
    if (contentLength > 0 && contentLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { 'Content-Type': 'application/json' } })
    }

    const bodyBuf = await req.arrayBuffer()
    if (!contentLength && bodyBuf.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { 'Content-Type': 'application/json' } })
    }

    // Try to parse JSON to validate payload and sanitize fields.
    let parsed: any = null
    try {
      const text = new TextDecoder().decode(bodyBuf)
      parsed = text ? JSON.parse(text) : null
    } catch (e) {
      // Not JSON — fall back to proxying original payload
      parsed = null
    }

    // If JSON and contains a `url` field, reject to enforce key-only policy.
    if (parsed && (Object.prototype.hasOwnProperty.call(parsed, 'url') || Object.prototype.hasOwnProperty.call(parsed, 'value') && parsed.value && Object.prototype.hasOwnProperty.call(parsed.value, 'url'))) {
      return new Response(JSON.stringify({ error: 'url_not_allowed' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Build sanitized payload allowing only key or cf_id and metadata fields.
    const allowed = ['key', 'cf_id', 'filename', 'target', 'aspect']
    let outBodyBuf = bodyBuf
    if (parsed && typeof parsed === 'object') {
      const sanitized: any = {}
      for (const k of allowed) {
        if (k in parsed) sanitized[k] = parsed[k]
      }
      outBodyBuf = new TextEncoder().encode(JSON.stringify(sanitized)).buffer
    }

    // Prefer an explicit `user_id` field in the JSON payload if provided
    // (useful for testing). We'll forward it as `X-User-Id` header and
    // avoid persisting it in the request body.
    // Reject any client-supplied user identifiers to enforce server-side
    // identity derivation. Clients MUST not supply `user_id`.
    if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'user_id')) {
      return new Response(JSON.stringify({ error: 'user_id_not_allowed' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Forward sanitized request to public worker's images/complete endpoint.
    const destPath = '/api/images/complete' + url.search
    const headers = new Headers()
    for (const [k, v] of req.headers.entries()) {
      const lk = k.toLowerCase()
      if (lk === 'host') continue
      headers.set(k, v)
    }

    // If client provided explicit user id, set it on the forwarded headers
    if (explicitUserId) {
      headers.set('X-User-Id', explicitUserId)
    }

    // Ensure user identity header is present when possible.
    // If an HttpOnly sb-access-token cookie is available, try to extract
    // the user id (sub) from the JWT payload and set X-User-Id so the
    // public-worker can resolve context without relying solely on cookies
    // forwarded through intermediate networks.
    // Resolve the authenticated user id server-side from the HttpOnly
    // `sb-access-token` cookie. This ensures we never trust client-supplied
    // identity values. If no valid user can be resolved, reject the request.
    try {
      const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie') || null
      const userId = await getUserIdFromCookieHeader(cookieHeader)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
      }
      headers.set('X-User-Id', String(userId))
    } catch (e) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    // If an explicitUserId was provided by the client, prefer a direct
    // fetch to the public-worker so we can be certain the X-User-Id header
    // is present (this is useful for testing and avoids any proxy header
    // normalization surprises). Otherwise fall back to the shared proxy
    // forwardToPublicWorker implementation.
    // Forward the sanitized, authenticated request to the public-worker.
    const newReq = new Request(destPath, { method: 'POST', body: outBodyBuf, headers })
    const resp = await forwardToPublicWorker(newReq)

    // Parse response and normalize to { key }
    try {
      const respText = await resp.text()
      let respJson: any = null
      try { respJson = respText ? JSON.parse(respText) : null } catch (e) { respJson = null }
      const key = respJson?.key || respJson?.result?.key || respJson?.data?.key || respJson?.result?.id || undefined
      if (key) {
        return new Response(JSON.stringify({ key }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      // If no key found, forward original response body (safely)
      return new Response(respText, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export const runtime = 'nodejs'
