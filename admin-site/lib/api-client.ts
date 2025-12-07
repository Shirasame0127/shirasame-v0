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
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        // Replace location to avoid back navigation to protected page
        window.location.replace('/admin/login')
      }
    } catch (e) {}
    throw new Error('unauthenticated')
  }
  return res
}

export default apiFetch
