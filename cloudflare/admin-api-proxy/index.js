addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

const DEFAULT_DEST = 'https://public-worker.shirasame-official.workers.dev'

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade'
])

async function handle(req) {
  try {
    const url = new URL(req.url)
    // preserve path + query
    const destBase = typeof API_BASE_ORIGIN !== 'undefined' && API_BASE_ORIGIN
      ? API_BASE_ORIGIN.replace(/\/$/, '')
      : DEFAULT_DEST
    const dest = destBase + url.pathname + url.search

    const outHeaders = new Headers()
    for (const [k, v] of req.headers.entries()) {
      const kl = k.toLowerCase()
      if (HOP_BY_HOP.has(kl)) continue
      if (kl === 'host') continue
      outHeaders.set(k, v)
    }

    const init = {
      method: req.method,
      headers: outHeaders,
      redirect: 'manual',
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body
    }

    const res = await fetch(dest, init)

    const resHeaders = new Headers()
    for (const [k, v] of res.headers.entries()) {
      if (HOP_BY_HOP.has(k.toLowerCase())) continue
      resHeaders.set(k, v)
    }

    const buf = await res.arrayBuffer()
    return new Response(buf, { status: res.status, statusText: res.statusText, headers: resHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
