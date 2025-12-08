// Simple test harness for whoami token extraction logic
// Usage: node scripts/test-whoami.js

const http = require('http')
const fetch = global.fetch || require('node-fetch')

const PORT = 45432
const SUPABASE_URL = `http://localhost:${PORT}`

// Start a tiny stub server that responds to /auth/v1/user
const server = http.createServer((req, res) => {
  if (req.url === '/auth/v1/user') {
    const auth = req.headers['authorization'] || ''
    res.setHeader('Content-Type', 'application/json')
    if (!auth) {
      res.statusCode = 401
      res.end(JSON.stringify({ error: 'no auth' }))
      return
    }
    // Echo back a fake user object containing the token for verification
    const token = auth.replace(/^Bearer\s+/i, '')
    res.statusCode = 200
    res.end(JSON.stringify({ id: 'user-123', email: 'tester@example.com', token }))
    return
  }
  res.statusCode = 404
  res.end('not found')
})

server.listen(PORT, async () => {
  console.log('Stub Supabase running on', SUPABASE_URL)

  // Token extraction logic (copied from whoami)
  function extractTokenFromCookieHeader(cookieHeader) {
    const cookieCandidates = [
      /(?:^|; )sb-access-token=([^;]+)/,
      /(?:^|; )sb:-?access-token=([^;]+)/,
      /(?:^|; )sb_token=([^;]+)/,
      /(?:^|; )supabase-auth-token=([^;]+)/,
      /(?:^|; )sb=([^;]+)/,
    ]
    for (const re of cookieCandidates) {
      const m = cookieHeader.match(re)
      if (m && m[1]) return decodeURIComponent(m[1])
    }
    return null
  }

  async function whoamiSimulate({ cookieHeader, authorizationHeader }) {
    try {
      let token = extractTokenFromCookieHeader(cookieHeader || '')
      if (!token && authorizationHeader) {
        const a = authorizationHeader || ''
        if (a.toLowerCase().startsWith('bearer ')) token = a.slice(7).trim()
      }
      if (!token) return { ok: false, status: 401, body: { ok: false, error: 'unauthenticated' } }

      // call stub supabase
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      const json = await res.json().catch(() => null)
      if (!res.ok) return { ok: false, status: res.status, body: { ok: false, error: 'unauthenticated' } }
      return { ok: true, status: 200, body: { ok: true, user: json } }
    } catch (e) {
      return { ok: false, status: 500, body: { ok: false, error: String(e) } }
    }
  }

  // Test cases
  const cases = [
    { name: 'sb-access-token cookie', cookie: 'sb-access-token=tok-cookie-1; Path=/; HttpOnly', auth: null },
    { name: 'supabase-auth-token cookie', cookie: 'supabase-auth-token=tok-cookie-2; Path=/; HttpOnly', auth: null },
    { name: 'Authorization header', cookie: '', auth: 'Bearer tok-header-3' },
    { name: 'no token', cookie: '', auth: '' },
  ]

  for (const c of cases) {
    console.log('\n---- Test:', c.name)
    // Simulate request
    const res = await whoamiSimulate({ cookieHeader: c.cookie, authorizationHeader: c.auth })
    console.log('status:', res.status)
    console.log('body:', JSON.stringify(res.body, null, 2))
  }

  server.close()
})
