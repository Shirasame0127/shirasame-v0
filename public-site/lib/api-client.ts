// Prefer explicit public-worker base when set. Falls back to older vars for compatibility.
// If no env is configured (local dev), default to the public-worker origin so
// requests go to the single-source public API instead of local `/api/public`.
const DEFAULT_PUBLIC_WORKER = 'https://public-worker.shirasame-official.workers.dev'

export const API_BASE = (
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  DEFAULT_PUBLIC_WORKER
).replace(/\/$/, '')

export function apiPath(path: string) {
  if (!path.startsWith('/')) path = '/' + path

  // Always route public-site requests into the public namespace to avoid
  // accidentally hitting admin-only endpoints. Force `/api/public` prefix
  // regardless of whether the caller used an `/api/*` path.
  const publicPath = `/api/public${path}`
  return API_BASE ? `${API_BASE}${publicPath}` : publicPath
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiPath(path)
  return fetch(url, init)
}

export default apiFetch
