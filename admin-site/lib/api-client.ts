export const BUILD_API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  // Ensure auth endpoints use same-origin relative path so cookies (HttpOnly)
  // can be set/cleared by responses from the admin domain. This avoids
  // accidental calls to an external API host (BUILD_API_BASE) for auth
  // flows which would fail to set Domain-scoped HttpOnly cookies.
  try {
    if (path.startsWith('/api/auth')) return path
  } catch (e) {}
  // Security/design guard (highest priority): when running in a browser on
  // the official admin domain, ALWAYS use same-origin relative `/api` paths
  // so that HttpOnly domain cookies are included. This intentionally
  // ignores any runtime-injected `window.__env__.API_BASE` to prevent the
  // client from calling an external public-worker directly.
  try {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || ''
      if (host === 'admin.shirasame.com' || host.endsWith('.admin.shirasame.com')) {
        return path
      }
    }
  } catch (e) {}

  // In browser, prefer same-origin relative APIs so cookies (HttpOnly) are sent
  // and Next.js middleware can proxy to the public worker. If an explicit
  // API base is configured at build-time and it points to the same origin
  // as the current page, keep it. Otherwise fall back to relative `/api`.
  try {
    if (typeof window !== 'undefined') {
      try {
        // Runtime override: if host injects `window.__env__.API_BASE`, prefer it.
        // This allows static admin builds to call a public-worker origin at runtime.
        // Example injection in static HTML: <script>window.__env__ = { API_BASE: 'https://public-worker.example' }</script>
        const runtime = (window as any).__env__ || {}
        const runtimeApiBase = (runtime.API_BASE || runtime.NEXT_PUBLIC_API_BASE_URL || '').toString().replace(/\/$/, '')
        const runtimeForce = String(runtime.FORCE_API_BASE || runtime.NEXT_PUBLIC_FORCE_API_BASE || '').toLowerCase() === 'true'

        if (runtimeApiBase) {
          // If runtime API base is an external public-worker, admin client
          // often calls paths with an `/api` prefix (e.g. `/api/products`).
          // The public-worker implements routes without the `/api` prefix
          // (e.g. `/products`), so strip the prefix when calling an
          // external base to avoid 404s.
          const p = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path
          return `${runtimeApiBase}${p}`
        }
        // If we're running on the official admin domain, always use a
        // same-origin relative `/api` path so browser HttpOnly cookies are
        // included. This prevents the client from calling the external
        // public-worker origin where cookies would not be sent.
        const host = window.location.hostname || ''
        if (host === 'admin.shirasame.com' || host.endsWith('.admin.shirasame.com')) {
          return path
        }

        // In other cases (preview, local dev), if BUILD_API_BASE is present,
        // prefer calling it directly. Strip the leading `/api` prefix because
        // the public worker implements routes without that prefix (e.g.
        // `/products`).
        if (BUILD_API_BASE) {
          try {
            // When a build-time API base is configured, prefer calling it
            // directly. Strip the leading `/api` prefix because the public
            // worker implements routes without that prefix (e.g. `/products`).
            const p = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path
            return `${BUILD_API_BASE}${p}`
          } catch (e) {
            return path
          }
        }
      } catch (e) {}
    }
  } catch (e) {
    // ignore
  }

  return BUILD_API_BASE ? `${BUILD_API_BASE}${path}` : path
}

import { auth } from '@/lib/auth'
import { toast as globalToast } from '@/hooks/use-toast'

// Helper: parse JWT payload (no verification) to extract `sub`
function parseJwtPayload(token?: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = payload.length % 4
    const padded = payload + (pad === 2 ? '==' : pad === 3 ? '=' : pad === 0 ? '' : '')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  const merged: RequestInit = Object.assign({ credentials: 'include', redirect: 'manual' }, init || {})

  // Build headers object so we can add X-User-Id / Authorization if possible
  const hdrs = new Headers((merged && merged.headers) || {})

  // 1) If caller already provided Authorization header, use it
  let token: string | null = null
  try {
    const authHdr = hdrs.get('authorization') || hdrs.get('Authorization') || ''
    if (authHdr && authHdr.toLowerCase().startsWith('bearer ')) token = authHdr.slice(7).trim()
  } catch {}

  // 2) Try in-memory session helper (some apps put session on window)
  try {
    // @ts-ignore
    const sess = (window as any).__SUPABASE_SESSION
    if (!token && sess && sess.access_token) token = sess.access_token
  } catch {}

  // 3) Try localStorage (non-HttpOnly copy)
  try {
    if (!token && typeof localStorage !== 'undefined') {
      const maybe = localStorage.getItem('sb-access-token')
      if (maybe) token = maybe
    }
  } catch {}

  // If we have a token, set Authorization and X-User-Id headers
  try {
    if (token) {
      hdrs.set('Authorization', `Bearer ${token}`)
      const payload = parseJwtPayload(token)
      const userId = payload?.sub || ''
      if (userId) hdrs.set('X-User-Id', userId)
    }
  } catch (e) {}

  merged.headers = hdrs

  // Simple in-memory GET cache + promise coalescing to avoid
  // hammering the API when admin UI triggers many identical requests.
  // - Only caches GET responses.
  // - Short TTL to keep data fresh but reduce duplicate concurrent calls.
  // - Stores body as text and headers necessary to reconstruct a Response.
  try {
    if (typeof window !== 'undefined') {
      ;(window as any).__apiClientCache = (window as any).__apiClientCache || { cache: new Map(), inflight: new Map() }
    }
  } catch (e) {}

  const isGet = !(merged.method && merged.method.toUpperCase() !== 'GET')
  const cacheKey = isGet ? `GET:${url}` : null
  const CACHE_TTL_MS = 5 * 1000 // 5 seconds
  try {
    if (isGet && typeof window !== 'undefined') {
      const store = (window as any).__apiClientCache
      const cached = store.cache.get(cacheKey)
      const now = Date.now()
      if (cached && (now - cached.ts) < CACHE_TTL_MS) {
        try { console.log('[apiFetch] cache hit for', url) } catch (e) {}
        return new Response(cached.bodyText, { status: cached.status, headers: new Headers(cached.headers) })
      }
      const inflight = store.inflight.get(cacheKey)
      if (inflight) {
        try { console.log('[apiFetch] waiting inflight for', url) } catch (e) {}
        const result = await inflight
        return new Response(result.bodyText, { status: result.status, headers: new Headers(result.headers) })
      }
      // Create a placeholder promise and store in inflight to coalesce
      let resolveFn: (v: any) => void = () => {}
      let rejectFn: (e: any) => void = () => {}
      const p = new Promise<any>((resolve, reject) => { resolveFn = resolve; rejectFn = reject })
      store.inflight.set(cacheKey, p)
      try {
        const resp = await fetch(url, merged)
        const bodyText = await resp.clone().text()
        const headersArr: Array<[string,string]> = []
        try { resp.headers.forEach((v,k) => headersArr.push([k,v])) } catch (e) {}
        const result = { status: resp.status, headers: headersArr, bodyText }
        // Cache successful GETs
        if (resp.ok) {
          try { store.cache.set(cacheKey, { ts: Date.now(), status: resp.status, headers: headersArr, bodyText }) } catch (e) {}
        }
        resolveFn(result)
        store.inflight.delete(cacheKey)
        return new Response(bodyText, { status: resp.status, headers: new Headers(headersArr) })
      } catch (e) {
        try { rejectFn(e) } catch (er) {}
        store.inflight.delete(cacheKey)
        throw e
      }
    }
  } catch (e) {}

  // Guard: when viewing the login/reset pages, avoid firing non-auth API
  // requests unless we have a local token mirror. This prevents the
  // login page from triggering many parallel requests that return 401
  // and cause logout/redirect loops. Allow auth-related paths to proceed.
  try {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname || ''
      const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/reset')
      const isAuthPath = path.startsWith('/api/auth') || path.includes('/api/auth')
      let hasLocalToken = false
      try {
        if (typeof localStorage !== 'undefined') {
          hasLocalToken = !!(localStorage.getItem('sb-access-token') || localStorage.getItem('auth_user'))
        }
      } catch (e) {
        hasLocalToken = false
      }

      if (isLoginPage && !hasLocalToken && !isAuthPath) {
        try { console.log('[apiFetch] Login page and no local token — skipping non-auth API call:', url) } catch(e){}
        // Return a minimal Response-like object so callers can inspect status/json
        try {
          return new Response(null, { status: 401, statusText: 'unauthenticated (skipped on login)' })
        } catch (e) {
          // Fallback plain object for environments without Response constructor.
          // Include `text()` so callers that call `res.text()` won't break, and
          // cast to `Response` to satisfy TypeScript where needed.
          const fb = {
            ok: false,
            status: 401,
            statusText: 'unauthenticated (skipped on login)',
            json: async () => ({ error: 'unauthenticated (skipped on login)' }),
            text: async () => 'unauthenticated (skipped on login)'
          }
          return fb as unknown as Response
        }
      }
    }
  } catch (e) {}

  try { console.log('[apiFetch] リクエスト開始:', url, 'options:', { method: merged.method || 'GET', credentials: (merged as any).credentials }) } catch (e) {}
  const res = await fetch(url, merged)

  // If server reports unauthenticated for admin requests, handle centrally:
  if (res.status === 401) {
    try {
      if (typeof window !== 'undefined') {
        try {
          // Show user-facing toast
          try { globalToast({ title: 'ログイン情報が見つけられなかったよ' }) } catch {}
          // Clear local session and perform logout flow which redirects to /admin/login
          try { console.warn('[apiFetch] 401 を検出しました — auth.logout を実行します'); auth.logout().catch(() => {}) } catch {}
        } catch (e) {}
      }
    } catch (e) {}
    throw new Error('unauthenticated')
  }
  try { console.log('[apiFetch] レスポンス受信:', url, 'status=', res.status) } catch (e) {}
  return res
}

export default apiFetch
