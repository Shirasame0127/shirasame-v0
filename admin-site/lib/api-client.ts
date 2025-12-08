export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  return API_BASE ? `${API_BASE}${path}` : path
}

import { auth } from '@/lib/auth'
import { toast as globalToast } from '@/hooks/use-toast'

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  const merged: RequestInit = Object.assign({ credentials: 'include', redirect: 'manual' }, init || {})
  const res = await fetch(url, merged)
  // If server reports unauthenticated for admin requests, handle centrally:
  if (res.status === 401) {
    try {
      if (typeof window !== 'undefined') {
        try {
          // Show user-facing toast
          try { globalToast({ title: 'ログイン情報が見つけられなかったよ' }) } catch {}
          // Clear local session and perform logout flow which redirects to /admin/login
          try { auth.logout().catch(() => {}) } catch {}
        } catch (e) {}
      }
    } catch (e) {}
    throw new Error('unauthenticated')
  }
  return res
}

export default apiFetch
