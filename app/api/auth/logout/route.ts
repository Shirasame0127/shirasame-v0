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

    const safe = process.env.NODE_ENV === 'production'
    const deleteAccess = `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const deleteRefresh = `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`

    // Best-effort: if a refresh token present, attempt to revoke it via Supabase admin API
    if (refreshToken && supabaseAdmin) {
      try {
        // If auth_sessions table used, delete the session row matching the hash
        // We'll hash the token server-side and remove matches.
        const hashed = await digest('sha256', refreshToken)
        await supabaseAdmin.from('auth_sessions').delete().eq('refresh_token_hash', hashed)
      } catch (e) {
        console.warn('[api/auth/logout] failed to remove server session', e)
      }

      try {
        const SUPABASE_URL = process.env.SUPABASE_URL || ''
        const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        if (SUPABASE_URL && SERVICE_ROLE) {
          const tokenUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token`
          const body = `token=${encodeURIComponent(refreshToken)}&type=revoke`
          await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${SERVICE_ROLE}`,
            },
            body,
          })
        }
      } catch (e) {
        console.warn('[api/auth/logout] supabase revoke failed', e)
      }
    }

    const res = NextResponse.json({ ok: true })
    res.headers.append('Set-Cookie', deleteAccess)
    res.headers.append('Set-Cookie', deleteRefresh)
    return res
  } catch (e) {
    console.error('[api/auth/logout] exception', e)
    const safe = process.env.NODE_ENV === 'production'
    const deleteAccess = `sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const deleteRefresh = `sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${safe ? '; Secure' : ''}`
    const res = NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    res.headers.append('Set-Cookie', deleteAccess)
    res.headers.append('Set-Cookie', deleteRefresh)
    return res
  }
}

async function digest(alg: 'sha256' | 'sha512', text: string) {
  const enc = new TextEncoder()
  const data = enc.encode(text)
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const hash = await (crypto as any).subtle.digest(alg, data)
    return toHex(hash)
  }
  // Node fallback
  const { createHash } = await import('crypto')
  const h = createHash(alg.replace('sha', 'sha'))
  h.update(text)
  return h.digest('hex')
}

function toHex(buffer: ArrayBuffer) {
  const b = new Uint8Array(buffer)
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
}

export const runtime = 'nodejs'
