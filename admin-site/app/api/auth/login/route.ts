import { NextResponse } from 'next/server'

function parseBody(req: Request) {
  try { return req.json() } catch { return Promise.resolve(null) }
}

export async function POST(req: Request) {
  const allow = (process.env.ALLOW_DEV_LOGIN || '').toLowerCase() === 'true' || process.env.NODE_ENV !== 'production'
  if (!allow) return NextResponse.json({ ok: false, error: 'not allowed' }, { status: 403 })

  const body = await parseBody(req)
  const email = body?.email
  const password = body?.password
  if (!email || !password) return NextResponse.json({ ok: false, error: 'missing email or password' }, { status: 400 })

  const SUPABASE_URL = process.env.SUPABASE_URL || ''
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!SUPABASE_URL || !SERVICE_ROLE) return NextResponse.json({ ok: false, error: 'missing supabase config' }, { status: 500 })

  try {
    const tokenUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token`
    const bodyStr = `grant_type=password&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${SERVICE_ROLE}`,
        'apikey': SERVICE_ROLE,
      },
      body: bodyStr,
    })

    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: 'invalid credentials', detail: json }, { status: 401 })
    }

    const accessToken = json?.access_token
    const refreshToken = json?.refresh_token
    if (!accessToken) return NextResponse.json({ ok: false, error: 'no access token returned' }, { status: 500 })

    const safe = process.env.NODE_ENV === 'production'
    const accessMaxAge = 60 * 60
    const refreshMaxAge = 60 * 60 * 24 * 30

    const res = NextResponse.json({ ok: true })
    res.headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessMaxAge}${safe ? '; Secure' : ''}`)
    if (refreshToken) res.headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${refreshMaxAge}${safe ? '; Secure' : ''}`)

    return res
  } catch (e) {
    console.error('[api/auth/login] error', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
