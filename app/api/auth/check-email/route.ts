import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body?.email
    if (!email) return NextResponse.json({ ok: false, error: 'email required' }, { status: 400 })

    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    // Check application users table for existing email
    try {
      const { data, error } = await supabaseAdmin.from('users').select('id,email').eq('email', email).limit(1)
      if (error) {
        console.warn('[api/auth/check-email] supabase users fetch error', error)
        return NextResponse.json({ ok: false, error: 'db error' }, { status: 500 })
      }
      const exists = Array.isArray(data) && data.length > 0
      return NextResponse.json({ ok: true, exists })
    } catch (e) {
      console.error('[api/auth/check-email] exception', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }
  } catch (e: any) {
    console.error('[api/auth/check-email] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
