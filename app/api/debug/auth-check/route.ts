import { NextResponse } from 'next/server'

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

function mask(s: string | undefined | null) {
  if (!s) return null
  try { return `${s.slice(0,8)}... len=${s.length}` } catch { return '<masked>' }
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie')
    const cookies = parseCookie(cookieHeader)

    const info = {
      cookie_header_present: !!cookieHeader,
      cookie_header_preview: cookieHeader ? cookieHeader.split(';').map(s => s.trim()).slice(0,3) : [],
      cookies: {
        sb_access_token: mask(cookies['sb-access-token']),
        sb_refresh_token: mask(cookies['sb-refresh-token']),
      },
      headers: {
        host: req.headers.get('host'),
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
      },
      env: {
        NODE_ENV: process.env.NODE_ENV || null,
      }
    }

    return NextResponse.json({ ok: true, info })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
