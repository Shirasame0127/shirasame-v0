import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const cookies = req.headers.get('cookie') || ''
    const match = cookies.split(';').map(s=>s.trim()).find(s=>s.startsWith('sb-access-token='))
    const accessToken = match ? decodeURIComponent(match.split('=')[1]) : null

    if (!accessToken) return NextResponse.json({ ok: false, error: 'no access token' }, { status: 401 })
    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    try {
      const { data, error } = await (supabaseAdmin as any).auth.getUser(accessToken)
      if (error || !data?.user) return NextResponse.json({ ok: false, error: 'invalid token' }, { status: 401 })
      const u = data.user
      return NextResponse.json({ ok: true, user: { id: u.id, email: u.email } })
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
