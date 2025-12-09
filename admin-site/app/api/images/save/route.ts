import { forwardToPublicWorker } from '@/lib/api-proxy'

// Compatibility route: some older client bundles post to /api/images/save.
// Forward as a POST to /api/images/complete on the public worker.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // Input size guard: reject very large payloads early.
    // Prefer Content-Length header when present, otherwise measure body size.
    const MAX_BYTES = Number(process.env.IMAGE_SAVE_MAX_BYTES || 5 * 1024 * 1024) // default 5MB
    const contentLength = Number(req.headers.get('content-length') || '0') || 0
    if (contentLength > 0 && contentLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { 'Content-Type': 'application/json' } })
    }

    const bodyBuf = await req.arrayBuffer()
    if (!contentLength && bodyBuf.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { 'Content-Type': 'application/json' } })
    }

    // Build a new Request object targeting /api/images/complete.
    // We will preserve incoming Authorization header if present so static admin
    // can send Authorization: Bearer <token> and have it forwarded to public-worker.
    const destPath = '/api/images/complete' + url.search
    const dest = `${destPath}`
    const headers = new Headers()
    // Copy all headers except Host and Cookie (forwardToPublicWorker will handle explicit Cookie forwarding)
    for (const [k, v] of req.headers.entries()) {
      const lk = k.toLowerCase()
      if (lk === 'host') continue
      // Keep authorization so public-worker receives Authorization header
      headers.set(k, v)
    }

    const newReq = new Request(dest, { method: 'POST', body: bodyBuf, headers })
    return forwardToPublicWorker(newReq)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export const runtime = 'nodejs'
