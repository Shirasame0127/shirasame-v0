export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  // If caller already targets /api, pass through (keeps compatibility).
  if (path.startsWith('/api/')) {
    return API_BASE ? `${API_BASE}${path}` : path
  }
  // Otherwise route to public API namespace to avoid hitting admin-only routes.
  const publicPath = `/api/public${path}`
  return API_BASE ? `${API_BASE}${publicPath}` : publicPath
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  return fetch(url, init)
}

export default apiFetch
