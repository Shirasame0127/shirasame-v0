// Lightweight client-side apiFetch wrapper
// - extracts user id from a JWT access token (if available)
// - sets `X-User-Id` and `Authorization: Bearer <token>` automatically
// - uses `credentials: 'include'` so HttpOnly cookies are sent where needed

interface JwtPayload { sub?: string }

function parseJwtPayload(token?: string | null): JwtPayload | null {
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

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  // Try to locate token in a few common places. Depending on your app
  // you may supply the token directly instead of relying on storage.
  let token: string | null = null

  // 1) If caller already provided Authorization header, use it
  try {
    const hdrs = new Headers(init.headers || {})
    const auth = hdrs.get('authorization') || hdrs.get('Authorization') || ''
    if (auth && auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim()
  } catch {}

  // 2) Try window.__SUPABASE_SESSION (some apps keep session in memory)
  try {
    // @ts-ignore
    const sess = (window as any).__SUPABASE_SESSION
    if (!token && sess && sess.access_token) token = sess.access_token
  } catch {}

  // 3) Try localStorage (if your app writes a non-HttpOnly copy)
  try {
    if (!token && typeof localStorage !== 'undefined') {
      const maybe = localStorage.getItem('sb-access-token')
      if (maybe) token = maybe
    }
  } catch {}

  let userId = ''
  if (token) {
    const payload = parseJwtPayload(token)
    if (payload && payload.sub) userId = payload.sub
  }

  const headers = new Headers(init.headers || {})

  // Change: always set X-User-Id when we can derive it from a local token.
  // The system uses the user_id passed from the client to the Worker as
  // the source of truth for GET requests. We still avoid auto-attaching
  // Authorization unless explicitly requested (useLocalToken), but ensure
  // the X-User-Id header is present so the Worker can trust and use it.
  try {
    if (userId) headers.set('X-User-Id', userId)
  } catch {}

  // Respect caller-provided Authorization if present. Otherwise only attach
  // the local token when `useLocalToken: true` is set in init.
  const callerProvidedAuth = !!(headers.get('authorization') || headers.get('Authorization'))
  if (!callerProvidedAuth) {
    try {
      // @ts-ignore
      if ((init as any).useLocalToken === true && token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    } catch {}
  }

  // Ensure credentials included so HttpOnly cookies are sent
  const finalInit: RequestInit = { credentials: 'include', ...init, headers }
  // Default browser cache behavior for admin endpoints: prefer fresh
  // responses unless caller explicitly sets cache in init.
  try {
    // @ts-ignore
    if (!('cache' in finalInit) || !(finalInit as any).cache) (finalInit as any).cache = 'no-store'
  } catch {}

  const res = await fetch(input, finalInit)
  return res
}

export default apiFetch
