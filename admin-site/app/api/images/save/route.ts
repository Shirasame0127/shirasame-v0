// Deprecated: admin-side proxying removed.
// The admin site is a fully static UI. Image complete/save must be called
// directly against the public API (public-worker) by the client. This
// compatibility route intentionally returns 410 Gone to force clients to
// use the public-worker `/api/images/complete` endpoint directly. The
// build/runtime can inject `window.__env__.API_BASE` to point clients
// at the public-worker host when deployed as a static site.
export async function POST() {
  return new Response(JSON.stringify({ error: 'deprecated', message: 'Call the public API /api/images/complete directly (no admin proxy).' }), { status: 410, headers: { 'Content-Type': 'application/json' } })
}

export const runtime = 'edge'
