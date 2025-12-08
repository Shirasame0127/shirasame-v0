import { forwardToPublicWorker } from '@/lib/api-proxy'

// Compatibility route: some older client bundles post to /api/images/save.
// Forward as a POST to /api/images/complete on the public worker.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    // Build a new Request object targeting /api/images/complete while preserving method/body/headers
    const dest = `${url.origin}/api/images/complete${url.search}`
    const body = await req.arrayBuffer()
    const headers = new Headers(req.headers)
    const newReq = new Request(dest, { method: 'POST', body, headers })
    return forwardToPublicWorker(newReq)
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export const runtime = 'nodejs'
