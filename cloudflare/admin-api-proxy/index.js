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
    // 1) If this is the admin `whoami` auth check, handle it at the proxy
    // by calling Supabase's auth endpoint using the client's access token.
    if (url.pathname === '/api/auth/whoami' || url.pathname === '/api/auth/me') {
      const cookieHeader = req.headers.get('cookie') || ''
      const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('sb-access-token='))
      const accessToken = match ? decodeURIComponent(match.split('=')[1]) : null

      if (!accessToken) {
        return new Response(JSON.stringify({ ok: false, authenticated: false }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
      const supabaseKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
      if (!supabaseBase) {
        return new Response(JSON.stringify({ ok: false, error: 'SUPABASE_URL not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }

      const dest = supabaseBase + '/auth/v1/user'
      const init = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'apikey': supabaseKey,
          'Accept': 'application/json'
        }
      }

      const supRes = await fetch(dest, init)
      const resHeaders = new Headers()
      for (const [k, v] of supRes.headers.entries()) {
        if (HOP_BY_HOP.has(k.toLowerCase())) continue
        resHeaders.set(k, v)
      }
      try { resHeaders.set('x-shirasame-proxy-dest', dest) } catch (e) {}
      const buf = await supRes.arrayBuffer()
      return new Response(buf, { status: supRes.status, statusText: supRes.statusText, headers: resHeaders })
    }

    // 2) OAuth start / callback handling for Google login
    //    We implement the minimal server-side flow so the admin domain can
    //    set cookies on success. This expects the following env vars to be set
    //    in the Worker: SUPABASE_URL, SUPABASE_ANON_KEY (optional), SUPABASE_SERVICE_ROLE_KEY
    // Support client-side token posting: the OAuth implicit flow (tokens in
    // fragment) cannot be observed by the server. Provide an endpoint that
    // client JS can POST tokens to so the Worker can set HttpOnly cookies.
    if (url.pathname === '/api/auth/set_tokens' && req.method === 'POST') {
      try {
        let data = null
        try { data = await req.json() } catch (e) {
          const form = await req.formData().catch(() => null)
          if (form) {
            data = {}
            for (const [k, v] of form.entries()) data[k] = v
          }
        }

        if (!data) return new Response(JSON.stringify({ ok: false, error: 'no_body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

        const accessToken = data.access_token || data.accessToken || null
        const refreshToken = data.refresh_token || data.refreshToken || null
        const expiresIn = parseInt(data.expires_in || data.expiresIn || '0', 10) || null

        const cookieHeaders = []
        if (accessToken) {
          const maxAge = expiresIn && expiresIn > 0 ? Math.min(expiresIn, 60 * 60 * 24 * 7) : 60 * 60 * 24 * 7
          cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure; Domain=admin.shirasame.com`)
        }
        if (refreshToken) {
          cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; Secure; Domain=admin.shirasame.com`)
        }

        const respHeaders = new Headers({ 'Content-Type': 'application/json' })
        for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: respHeaders })
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    if (url.pathname === '/api/auth/google') {
      // Redirect the browser to Supabase's OAuth authorize endpoint.
      // Request the server-side `code` flow so we can exchange on the Worker.
      const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
      if (!supabaseBase) return new Response('SUPABASE_URL not configured', { status: 500 })
      const callback = 'https://admin.shirasame.com/api/auth/callback'
      const params = new URLSearchParams({
        provider: 'google',
        redirect_to: callback,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
      })
      const destUrl = `${supabaseBase}/auth/v1/authorize?${params.toString()}`
      return new Response(null, { status: 302, headers: { 'Location': destUrl } })
    }

    if (url.pathname === '/api/auth/callback') {
      // Supabase will redirect back with a `code` (server flow). Exchange it
      // for tokens using the Service Role Key (must be stored as a secret).
      const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
      const serviceKey = typeof SUPABASE_SERVICE_ROLE_KEY !== 'undefined' ? SUPABASE_SERVICE_ROLE_KEY : null
      const anonKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
      if (!supabaseBase) return new Response('SUPABASE_URL not configured', { status: 500 })

      const params = url.searchParams
      const code = params.get('code')
      // If Supabase returned an error param, surface it
      const oauthError = params.get('error')
      if (oauthError) {
        return new Response(`OAuth error: ${oauthError}`, { status: 400 })
      }

      if (!code) {
        // Supabase may return tokens in the fragment (client flow) — in that
        // case the client should capture the fragment and POST tokens to
        // `/api/auth/set_tokens`. Provide a helpful response for debugging.
        return new Response(JSON.stringify({ ok: false, error: 'missing_authorization_code', hint: 'If you see tokens in the URL fragment (#access_token=...), use the client-side login page at /admin/login which will POST tokens to /api/auth/set_tokens.' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      // Exchange code for tokens
      const tokenUrl = `${supabaseBase}/auth/v1/token`
      const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_to=${encodeURIComponent('https://admin.shirasame.com/api/auth/callback')}`
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': anonKey
      }
      if (serviceKey) headers['Authorization'] = 'Bearer ' + serviceKey

      const tokenRes = await fetch(tokenUrl, { method: 'POST', headers, body })
      const tokenJson = await tokenRes.json().catch(() => null)
      if (!tokenRes.ok || !tokenJson) {
        return new Response(JSON.stringify({ ok: false, error: tokenJson || 'token_exchange_failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }

      // Expect tokenJson to contain access_token and refresh_token
      const accessToken = tokenJson.access_token || null
      const refreshToken = tokenJson.refresh_token || null

      // Build Set-Cookie headers for sb-access-token and sb-refresh-token
      const cookieHeaders = []
      if (accessToken) {
        cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${true ? '; Secure' : ''}`)
      }
      if (refreshToken) {
        cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${true ? '; Secure' : ''}`)
      }

      const redirectTo = '/admin'
      const respHeaders = new Headers({ 'Location': redirectTo })
      for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
      return new Response(null, { status: 302, headers: respHeaders })
    }

    // remove leading /api prefix when forwarding to public worker
    const forwardedPath = url.pathname.replace(/^\/api/, '')
    const dest = destBase + forwardedPath + url.search

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

    // Debug: expose the forwarded destination so we can verify routing
    try {
      resHeaders.set('x-shirasame-proxy-dest', dest)
    } catch (e) {
      // ignore header set errors
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
