export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path
  return API_BASE ? `${API_BASE}${path}` : path
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  return fetch(url, init)
}

export default apiFetch
