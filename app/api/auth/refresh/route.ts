import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

function parseCookie(header: string | null) {
  if (!header) return {}
  return header.split(';').map(s => s.trim()).reduce((acc: any, pair) => {
    const idx = pair.indexOf('=')
    if (idx === -1) return acc
    const k = pair.substring(0, idx)
    const v = pair.substring(idx + 1)
    acc[k] = decodeURIComponent(v)
    return acc
  }, {})
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie')
    const cookies = parseCookie(cookieHeader)
    const refreshToken = cookies['sb-refresh-token']

    try { console.log('[api/auth/refresh] incoming cookie header:', cookieHeader ? cookieHeader.split(';').map(s=>s.trim())[0] : '<none>') } catch {}
    try { console.log('[api/auth/refresh] refresh token preview:', refreshToken ? `${refreshToken.slice(0,8)}... len=${refreshToken.length}` : '<none>') } catch {}

    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: 'refresh token cookie missing' }, { status: 400 })
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!SUPABASE_URL || !ANON_KEY) {
      return NextResponse.json({ ok: false, error: 'supabase url or anon key missing' }, { status: 500 })
    }

    // Supabase公式仕様: refresh は /auth/v1/token?grant_type=refresh_token へ JSON { refresh_token }
    const tokenUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`
    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const json = await resp.json().catch(() => ({}))
    try { console.log('[api/auth/refresh] supabase token endpoint responded status=', resp.status, 'json_preview=', JSON.stringify(json).slice(0,400)) } catch {}
    const safe = process.env.NODE_ENV === 'production'
    const deleteAccess = `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const deleteRefresh = `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`

    if (!resp.ok) {
      console.warn('[api/auth/refresh] supabase token refresh failed', json)
      const failRes = NextResponse.json({ ok: false, error: 'refresh failed', detail: json }, { status: resp.status === 400 ? 400 : 401 })
      failRes.headers.append('Set-Cookie', deleteAccess)
      failRes.headers.append('Set-Cookie', deleteRefresh)
      try { console.log('[api/auth/refresh] cleared cookies due to refresh failure') } catch {}
      return failRes
    }
    const accessToken = json?.access_token
    const newRefresh = json?.refresh_token
    if (!accessToken) {
      const failRes = NextResponse.json({ ok: false, error: 'no access token in response' }, { status: 500 })
      failRes.headers.append('Set-Cookie', deleteAccess)
      failRes.headers.append('Set-Cookie', deleteRefresh)
      return failRes
    }

    const accessMaxAge = 60 * 60 * 24 * 7 // 7 days
    const refreshMaxAge = 60 * 60 * 24 * 30 // 30 days

    const res = NextResponse.json({ ok: true, data: { expires_in: json.expires_in } })
    try { console.log('[api/auth/refresh] setting new access token cookie (len=', accessToken?.length, ')') } catch {}
    res.headers.append('Set-Cookie', `sb-access-token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${accessMaxAge}${safe ? '; Secure' : ''}`)
    if (newRefresh) {
      try { console.log('[api/auth/refresh] setting new refresh token cookie (len=', newRefresh?.length, ')') } catch {}
      res.headers.append('Set-Cookie', `sb-refresh-token=${encodeURIComponent(newRefresh)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${refreshMaxAge}${safe ? '; Secure' : ''}`)
    }

    try { console.log('[api/auth/refresh] refresh completed OK') } catch {}
    return res
  } catch (e) {
    console.error('[api/auth/refresh] exception', e)
    const safe = process.env.NODE_ENV === 'production'
    const delAccess = `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const delRefresh = `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const failRes = NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    failRes.headers.append('Set-Cookie', delAccess)
    failRes.headers.append('Set-Cookie', delRefresh)
    return failRes
  }
}

export const runtime = 'nodejs'
