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

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  const merged: RequestInit = Object.assign({ credentials: 'include', redirect: 'manual' }, init || {})
  try {
    try { console.log('[apiFetch] リクエスト開始:', url, 'options:', { method: merged.method || 'GET', credentials: (merged as any).credentials }) } catch (e) {}
  } catch (e) {}
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
