import { forwardToPublicWorker } from '@/lib/api-proxy'

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

    // Forward sanitized request to public worker's images/complete endpoint.
    const destPath = '/api/images/complete' + url.search
    const headers = new Headers()
    for (const [k, v] of req.headers.entries()) {
      const lk = k.toLowerCase()
      if (lk === 'host') continue
      headers.set(k, v)
    }

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
