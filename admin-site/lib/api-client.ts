export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  return API_BASE ? `${API_BASE}${path}` : path
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  const merged: RequestInit = Object.assign({ credentials: 'include', redirect: 'manual' }, init || {})
  const res = await fetch(url, merged)
  // If server reports unauthenticated for admin requests, redirect to login.
  if (res.status === 401) {
    try {
      if (typeof window !== 'undefined') {
        const current = window.location.pathname || ''
        // Guard: avoid rapid repeated redirects when many parallel fetches
        // return 401 at once (prevents navigation loop). Use a short-lived
        // global flag to only perform a single replace within the window.
        const REDIRECT_FLAG = '__shirasame_redirecting'
        const alreadyRedirecting = (window as any)[REDIRECT_FLAG]
        if (!current.startsWith('/admin/login') && current.startsWith('/admin') && !alreadyRedirecting) {
          try {
            ;(window as any)[REDIRECT_FLAG] = true
            // Replace location to avoid back navigation to protected page
            window.location.replace('/admin/login')
          } finally {
            // clear flag after a short delay so future independent navigations
            // can still redirect if needed (e.g. user re-auth). 5s is arbitrary.
            setTimeout(() => { try { (window as any)[REDIRECT_FLAG] = false } catch {} }, 5000)
          }
        }
      }
    } catch (e) {}
    throw new Error('unauthenticated')
  }
  return res
}

export default apiFetch
