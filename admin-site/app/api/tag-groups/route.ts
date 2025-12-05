import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const res = await supabaseAdmin.from('tag_groups').select('*').order('sort_order', { ascending: true })
    if (res.error) {
      console.error('[api/tag-groups] supabase error', res.error)
      return NextResponse.json({ error: res.error.message || String(res.error) }, { status: 500 })
    }
    return NextResponse.json({ data: res.data || [] })
  } catch (e: any) {
    console.error('[api/tag-groups] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

