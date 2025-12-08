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
    // If this Worker is (mis)configured to run on the whole domain, do
    // not attempt to handle non-API paths here — let Pages/static host
    // serve those assets directly. This avoids returning HTML for JS/CSS.
    if (!url.pathname.startsWith('/api')) {
      return fetch(req)
    }
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
    // (no-op placeholder for auth endpoints)
    if (url.pathname === '/api/auth/set_tokens' && req.method === 'POST') {
      try {
        let data = null
        const contentTypeHeader = (req.headers.get('content-type') || '').toLowerCase()

        // Prefer parsing based on Content-Type to avoid consuming body twice.
        if (contentTypeHeader.indexOf('application/json') !== -1) {
          try { data = await req.json() } catch (e) { data = null }
        } else if (contentTypeHeader.indexOf('application/x-www-form-urlencoded') !== -1) {
          try {
            const txt = await req.text()
            if (txt && txt.length) {
              const sp = new URLSearchParams(txt)
              data = {}
              for (const [k, v] of sp.entries()) data[k] = v
            }
          } catch (e) { data = null }
        } else if (contentTypeHeader.indexOf('multipart/form-data') !== -1) {
          try {
            const form = await req.formData()
            data = {}
            for (const [k, v] of form.entries()) data[k] = v
          } catch (e) { data = null }
        } else {
          // Unknown content-type: attempt formData -> text(urlencoded) -> json
          try {
            const form = await req.formData().catch(() => null)
            if (form && Array.from(form.keys()).length) {
              data = {}
              for (const [k, v] of form.entries()) data[k] = v
            }
          } catch (e) { data = null }

          if (!data) {
            try {
              const txt = await req.text()
              if (txt && txt.length) {
                const sp = new URLSearchParams(txt)
                data = {}
                for (const [k, v] of sp.entries()) data[k] = v
              }
            } catch (e) { data = null }
          }

          if (!data) {
            try { data = await req.json().catch(() => null) } catch (e) { data = null }
          }
        }

        if (!data) {
          const debug = { ok: false, error: 'no_body', content_type: contentTypeHeader }
          return new Response(JSON.stringify(debug), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const accessToken = data.access_token || data.accessToken || null
        const refreshToken = data.refresh_token || data.refreshToken || null
        const expiresIn = parseInt(data.expires_in || data.expiresIn || '0', 10) || null

        const cookieHeaders = []
        if (accessToken) {
          const maxAge = expiresIn && expiresIn > 0 ? Math.min(expiresIn, 60 * 60 * 24 * 7) : 60 * 60 * 24 * 7
          cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${maxAge}; Secure; Domain=.shirasame.com`)
        }
        if (refreshToken) {
          cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${60 * 60 * 24 * 30}; Secure; Domain=.shirasame.com`)
        }

        try { console.log('[set_tokens] received fragment post, hasAccess=', !!accessToken, 'hasRefresh=', !!refreshToken, 'isForm=', isForm) } catch (e) {}

        // Try to fetch the user info from Supabase using the provided access token
        let userInfo = null
        try {
          const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
          const supabaseKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
          if (accessToken && supabaseBase) {
            try {
              const ures = await fetch(supabaseBase + '/auth/v1/user', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken, 'apikey': supabaseKey, 'Accept': 'application/json' }
              })
              if (ures && ures.ok) {
                userInfo = await ures.json().catch(() => null)
              }
            } catch (e) {
              try { console.warn('[set_tokens] failed to fetch user info', e) } catch (e) {}
            }
          }
        } catch (e) {
          // ignore user fetch errors
        }

        // Return JSON including user info (if available) and include Set-Cookie headers.
        // Client can trust this response to decide when to navigate because the
        // Worker has set HttpOnly cookies in the response.
        const respHeaders = new Headers()
        for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
        respHeaders.set('Content-Type', 'application/json')
        return new Response(JSON.stringify({ ok: true, user: userInfo }), { status: 200, headers: respHeaders })
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
      // If Supabase returned an error param, surface it with details for debugging
      const oauthError = params.get('error')
      if (oauthError) {
        const details = {}
        for (const [k, v] of params.entries()) details[k] = v
        return new Response(JSON.stringify({ ok: false, oauth_error: oauthError, params: details }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      if (!code) {
        // Supabase/Google may return tokens in the URL fragment (#access_token=...)
        // which never reaches the server. Serve a tiny HTML page that runs in
        // the browser, captures the fragment, and posts tokens to
        // `/api/auth/set_tokens`. This preserves the fragment flow without
        // requiring the provider to return `code`.
        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Signing in…</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,\"Hiragino Kaku Gothic ProN\",\"Meiryo\",sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{max-width:560px;padding:24px;border-radius:8px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.08);text-align:center}</style>
  </head>
  <body>
    <div class="card">
      <h2>Signing in…</h2>
      <p id="msg">処理中です。ブラウザを閉じないでください。</p>
    </div>
    <script>
      (function(){
        try {
          const hash = window.location.hash || ''
          if (hash && hash.indexOf('access_token=') !== -1) {
            const params = new URLSearchParams(hash.replace(/^#/, ''))
            const access_token = params.get('access_token')
            const refresh_token = params.get('refresh_token')
            const expires_in = params.get('expires_in')
            // POST tokens using fetch so we can control credentials and
            // ensure the browser accepts HttpOnly Set-Cookie headers.
            (async function(){
              try {
                const params = new URLSearchParams()
                params.set('access_token', access_token || '')
                params.set('refresh_token', refresh_token || '')
                params.set('expires_in', expires_in || '')

                const resp = await fetch('/api/auth/set_tokens', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
                  body: params.toString(),
                  redirect: 'manual'
                })

                // If server returns 200 JSON {ok:true} treat as success.
                if (resp.ok) {
                  try { const j = await resp.json().catch(() => null); if (j && j.ok) { window.history.replaceState({}, document.title, window.location.pathname + window.location.search); window.location.href = '/admin'; return } } catch (e) {}
                }

                // If server responded with a redirect (302) consider it success too.
                if (resp.status === 302) {
                  window.location.href = '/admin'
                  return
                }

                // Fallback: go to login page to surface error
                window.location.replace('/admin/login')
                return
              } catch (e) {
                try { document.getElementById('msg').textContent = '予期せぬエラーが発生しました。' } catch (e) {}
              }
            })()
            return
          }
          // No fragment tokens — redirect to client login page which also
          // handles other interactive flows.
          window.location.replace('/admin/login')
        } catch (e) {
          try { document.getElementById('msg').textContent = '予期せぬエラーが発生しました。' } catch (e) {}
        }
      })();
    </script>
  </body>
</html>`

        return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
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
        cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${60 * 60 * 24 * 7}${true ? '; Secure' : ''}; Domain=.shirasame.com`)
      }
      if (refreshToken) {
        cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${60 * 60 * 24 * 30}${true ? '; Secure' : ''}; Domain=.shirasame.com`)
      }

      try { console.log('[callback] token exchange status=', tokenRes.status, 'has_access=', !!accessToken, 'has_refresh=', !!refreshToken, 'set_cookies=', cookieHeaders.length) } catch (e) {}

      const redirectTo = '/admin'
      const respHeaders = new Headers({ 'Location': redirectTo })
      for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
      return new Response(null, { status: 302, headers: respHeaders })
    }

    // Accept a JSON POST to set server session cookies (used by client SDKs)
    if (url.pathname === '/api/auth/session' && req.method === 'POST') {
      try {
        const body = await req.text().catch(() => '')
        let data = null
        try { data = body && body.length ? JSON.parse(body) : null } catch (e) { data = null }
        if (!data) {
          return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }
        const accessToken = data.access_token || data.accessToken || null
        const refreshToken = data.refresh_token || data.refreshToken || null
        const expiresIn = parseInt(data.expires_in || data.expiresIn || '0', 10) || null

        const cookieHeaders = []
        if (accessToken) {
          const maxAge = expiresIn && expiresIn > 0 ? Math.min(expiresIn, 60 * 60 * 24 * 7) : 60 * 60 * 24 * 7
          cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${maxAge}; Secure; Domain=.shirasame.com`)
        }
        if (refreshToken) {
          cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${60 * 60 * 24 * 30}; Secure; Domain=.shirasame.com`)
        }

        // Attempt to fetch user info to return to client so it can trust auth
        let userInfo = null
        try {
          const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
          const supabaseKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
          if (accessToken && supabaseBase) {
            try {
              const ures = await fetch(supabaseBase + '/auth/v1/user', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken, 'apikey': supabaseKey, 'Accept': 'application/json' }
              })
              if (ures && ures.ok) userInfo = await ures.json().catch(() => null)
            } catch (e) {
              try { console.warn('[session] failed to fetch user info', e) } catch (e) {}
            }
          }
        } catch (e) {
          // ignore
        }

        const respHeaders = new Headers()
        for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
        respHeaders.set('Content-Type', 'application/json')
        try { console.log('[session] set session cookies, hasAccess=', !!accessToken, 'hasRefresh=', !!refreshToken) } catch (e) {}
        return new Response(JSON.stringify({ ok: true, user: userInfo }), { status: 200, headers: respHeaders })
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // Logout: clear session cookies
    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      try {
        const respHeaders = new Headers()
        // Clear cookies by setting Max-Age=0
        respHeaders.append('Set-Cookie', `sb-access-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
        respHeaders.append('Set-Cookie', `sb-refresh-token=; Path=/; HttpOnly; SameSite=None; Max-Age=0; Secure; Domain=.shirasame.com`)
        respHeaders.set('Content-Type', 'application/json')
        try { console.log('[logout] cleared session cookies') } catch (e) {}
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: respHeaders })
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // Refresh endpoint: use sb-refresh-token cookie to obtain new access token
    if (url.pathname === '/api/auth/refresh' && req.method === 'POST') {
      try {
        const cookieHeader = req.headers.get('cookie') || ''
        const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('sb-refresh-token='))
        const refreshToken = match ? decodeURIComponent(match.split('=')[1]) : null

        if (!refreshToken) {
          // Debug: log missing refresh token
          try { console.log('[refresh] no refresh token in cookies') } catch (e) {}
          return new Response(JSON.stringify({ ok: false, error: 'no_refresh_token' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
        const anonKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
        const serviceKey = typeof SUPABASE_SERVICE_ROLE_KEY !== 'undefined' ? SUPABASE_SERVICE_ROLE_KEY : null
        // Debug: indicate presence of critical env/secrets (do NOT log secret values)
        try { console.log('[refresh] supabaseBase=', !!supabaseBase, 'anonKey=', !!anonKey, 'serviceKeyPresent=', !!serviceKey) } catch (e) {}
        if (!supabaseBase) return new Response(JSON.stringify({ ok: false, error: 'SUPABASE_URL not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

        const tokenUrl = `${supabaseBase}/auth/v1/token`
        const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': anonKey
        }
        if (serviceKey) headers['Authorization'] = 'Bearer ' + serviceKey

        // Perform token refresh and log status (without exposing token values)
        const tokenRes = await fetch(tokenUrl, { method: 'POST', headers, body })
        let tokenJson = null
        try { tokenJson = await tokenRes.json().catch(() => null) } catch (e) { tokenJson = null }
        try { console.log('[refresh] token endpoint status=', tokenRes.status, 'hasBody=', !!tokenJson, 'has_access_token=', !!(tokenJson && tokenJson.access_token)) } catch (e) {}
        if (!tokenRes.ok || !tokenJson) {
          return new Response(JSON.stringify({ ok: false, error: tokenJson || 'token_refresh_failed' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const accessToken = tokenJson.access_token || null
        const newRefreshToken = tokenJson.refresh_token || null
        const expiresIn = parseInt(tokenJson.expires_in || '0', 10) || null

        const cookieHeaders = []
        if (accessToken) {
          const maxAge = expiresIn && expiresIn > 0 ? Math.min(expiresIn, 60 * 60 * 24 * 7) : 60 * 60 * 24 * 7
          cookieHeaders.push(`sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${maxAge}; Secure; Domain=.shirasame.com`)
        }
        if (newRefreshToken) {
          cookieHeaders.push(`sb-refresh-token=${encodeURIComponent(newRefreshToken)}; Path=/; HttpOnly; SameSite=None; Max-Age=${60 * 60 * 24 * 30}; Secure; Domain=.shirasame.com`)
        }

        const respHeaders = new Headers()
        for (const c of cookieHeaders) respHeaders.append('Set-Cookie', c)
        respHeaders.set('Content-Type', 'application/json')
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: respHeaders })
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // Simple server-side read proxies for common admin GET endpoints.
    // If the public worker doesn't implement these endpoints, fetch
    // directly from Supabase REST (server-side) using the Service Role
    // key when available. This keeps the admin UI working even if the
    // public worker hasn't migrated every admin route.
    if (req.method === 'GET') {
      const readTableMap = {
        '/api/recipes': 'recipes',
        '/api/recipe-pins': 'recipe_pins',
        '/api/custom-fonts': 'custom_fonts',
        '/api/tags': 'tags',
        '/api/collections': 'collections',
        '/api/site-settings': 'site_settings',
        '/api/amazon-sale-schedules': 'amazon_sale_schedules'
      }
      const table = readTableMap[url.pathname]
      if (table) {
        // Determine if the incoming request has an sb-access-token cookie.
        const cookieHeader = req.headers.get('cookie') || ''
        const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('sb-access-token='))
        const accessToken = match ? decodeURIComponent(match.split('=')[1]) : null

        // Only allow server-side supabase REST proxy when the request is
        // authenticated (has sb-access-token) OR when the path is explicitly
        // allowed as public-read.
        const publicAllowed = new Set(['/api/products', '/api/recipes'])
        if (!accessToken && !publicAllowed.has(url.pathname)) {
          return new Response(JSON.stringify({ ok: false, authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const supabaseBase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') : null
        const serviceKey = typeof SUPABASE_SERVICE_ROLE_KEY !== 'undefined' ? SUPABASE_SERVICE_ROLE_KEY : null
        const anonKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : ''
        if (supabaseBase) {
          // Build REST URL
          const base = `${supabaseBase}/rest/v1/${table}?select=*`
          const sp = new URLSearchParams(url.search)
          let restUrl = base
          // map recipeId -> recipe_id eq filter
          if (sp.has('recipeId')) {
            restUrl += `&recipe_id=eq.${encodeURIComponent(sp.get('recipeId') || '')}`
          }
          // Add Authorization and apikey headers. Prefer service key when
          // available, otherwise use anon key; but since we checked accessToken
          // above, we won't leak service-role access for unauthenticated requests.
          const headers = {
            'apikey': anonKey || '',
            'Authorization': serviceKey ? `Bearer ${serviceKey}` : `Bearer ${anonKey}`,
            'Accept': 'application/json'
          }
          try {
            const supRes = await fetch(restUrl, { method: 'GET', headers })
            const respHeaders = new Headers()
            for (const [k, v] of supRes.headers.entries()) {
              if (HOP_BY_HOP.has(k.toLowerCase())) continue
              respHeaders.set(k, v)
            }
            respHeaders.set('x-shirasame-proxy-dest', restUrl)
            const buf = await supRes.arrayBuffer()
            return new Response(buf, { status: supRes.status, statusText: supRes.statusText, headers: respHeaders })
          } catch (e) {
            // fall through to normal forwarding if supabase fetch fails
          }
        }
      }
    }

    // Try forwarding to the public worker in two ways to be tolerant
    // of differing public-worker path layouts:
    // 1) strip the leading `/api` (common for public workers that expose
    //    endpoints at `/products`, `/recipes`, etc.)
    // 2) keep the `/api` prefix (some backends expose `/api/*`)
    const forwardedPathStrip = url.pathname.replace(/^\/api/, '')
    const destStrip = destBase + forwardedPathStrip + url.search
    const destWithApi = destBase + url.pathname + url.search

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

    try { console.log('[forward] attempting', destStrip, 'method=', req.method) } catch (e) {}
    // First attempt: stripped path
    let res = await fetch(destStrip, init)
    let usedDest = destStrip

    // If the stripped path returns 404, try the /api-preserved path as fallback
    if (res.status === 404) {
      try {
        try { console.log('[forward] stripped path 404, trying', destWithApi) } catch (e) {}
        const fallbackRes = await fetch(destWithApi, init)
        // If fallback didn't 404, use it instead
        if (fallbackRes.status !== 404) {
          res = fallbackRes
          usedDest = destWithApi
        }
      } catch (e) {
        // ignore fallback network errors; we'll return the original 404 below
      }
    }

    try { console.log('[forward] usedDest=', usedDest, 'status=', res.status) } catch (e) {}

    const resHeaders = new Headers()
    for (const [k, v] of res.headers.entries()) {
      if (HOP_BY_HOP.has(k.toLowerCase())) continue
      resHeaders.set(k, v)
    }

    // Debug: expose the forwarded destination so we can verify routing
    try { resHeaders.set('x-shirasame-proxy-dest', usedDest) } catch (e) {}

    const buf = await res.arrayBuffer()
    return new Response(buf, { status: res.status, statusText: res.statusText, headers: resHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
