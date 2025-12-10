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

        // In the browser, prefer same-origin relative `/api` so that Next.js
        // middleware can proxy to the public-worker and browser cookies are
        // sent/received correctly. Only use BUILD_API_BASE in the browser if
        // a runtime `API_BASE` override is provided or if the build base is
        // explicitly the same origin.
        if (BUILD_API_BASE) {
          try {
            const buildUrl = new URL(BUILD_API_BASE)
            const curOrigin = window.location.origin
            if (buildUrl.origin === curOrigin) {
              return `${BUILD_API_BASE}${path}`
            }
            // Not same-origin: do not call the external build base from the browser
            // unless runtimeForce is explicitly true for static admin builds.
            if (runtimeForce) {
              const p = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path
              return `${BUILD_API_BASE}${p}`
            }
            return path
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
