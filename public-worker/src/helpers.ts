export function parseAdmins(env: any): Set<string> {
  try {
    const raw = (env && env.ADMINS) ? String(env.ADMINS) : ''
    if (!raw) return new Set()
    return new Set(raw.split(',').map((s: string) => s.trim()).filter(Boolean))
  } catch { return new Set() }
}

export function isAdmin(userId: string | null, env: any): boolean {
  if (!userId) return false
  const admins = parseAdmins(env)
  return admins.has(userId)
}

export function makeErrorResponse(origin: any, messageJP: string, detail?: any, code?: string, status = 500) {
  const env = origin && origin.env ? origin.env : origin
  const headers = Object.assign({}, (typeof env === 'object' ? (env as any).PUBLIC_ALLOWED_ORIGINS || {} : {}))
  const base: Record<string,string> = { 'Content-Type': 'application/json; charset=utf-8' }
  // computeCorsHeaders may be available in index.ts; if not, keep base headers
  try {
    // @ts-ignore
    if (typeof origin.computeCorsHeaders === 'function') {
      // @ts-ignore
      Object.assign(base, origin.computeCorsHeaders(origin.req && origin.req.header && origin.req.header('Origin') || null, env))
    }
  } catch {}
  const body = { ok: false, message: messageJP || 'サーバーエラー', detail: detail || null, code: code || null }
  return new Response(JSON.stringify(body), { status, headers: base })
}
