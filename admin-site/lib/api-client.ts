export const BUILD_API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  // In browser, prefer same-origin relative APIs so cookies (HttpOnly) are sent
  // and Next.js middleware can proxy to the public worker. If an explicit
  // API base is configured at build-time and it points to the same origin
  // as the current page, keep it. Otherwise fall back to relative `/api`.
  try {
    if (typeof window !== 'undefined' && BUILD_API_BASE) {
      try {
        const buildUrl = new URL(BUILD_API_BASE)
        const curOrigin = window.location.origin
        if (buildUrl.origin === curOrigin) {
          return `${BUILD_API_BASE}${path}`
        }
        // Different origin: prefer same-origin proxy path so browser cookies are sent
        return path
      } catch (e) {
        // If BUILD_API_BASE is not a valid URL, fallback to relative path
        return path
      }
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
