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

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie')
    const cookies = parseCookie(cookieHeader)
    const accessToken = cookies['sb-access-token'] || null

    if (!accessToken) return NextResponse.json({ data: null }, { status: 200 })
    if (!supabaseAdmin) return NextResponse.json({ data: null }, { status: 500 })

    try {
      const { data, error } = await (supabaseAdmin as any).auth.getUser(accessToken)
      if (error) {
        console.warn('[api/auth/me] getUser error', error)
        return NextResponse.json({ data: null }, { status: 200 })
      }
      return NextResponse.json({ data: data.user || null }, { status: 200 })
    } catch (e) {
      console.error('[api/auth/me] exception', e)
      return NextResponse.json({ data: null }, { status: 500 })
    }
  } catch (e) {
    console.error('[api/auth/me] outer exception', e)
    return NextResponse.json({ data: null }, { status: 500 })
  }
}

export const runtime = 'nodejs'
