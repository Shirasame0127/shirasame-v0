import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    if (!body || !body.fontFamily) return NextResponse.json({ error: 'missing fontFamily' }, { status: 400 })

    // Fetch existing favorite_fonts
    const { data: existing, error: selErr } = await supabaseAdmin.from('users').select('favorite_fonts').eq('id', id).maybeSingle()
    if (selErr) {
      console.error('[admin/users:id/favorite-fonts POST] select error', selErr)
      return NextResponse.json({ error: selErr.message }, { status: 500 })
    }
    const arr: string[] = Array.isArray(existing?.favorite_fonts) ? existing!.favorite_fonts : []
    const next = Array.from(new Set([...arr, body.fontFamily]))
    const { data, error } = await supabaseAdmin.from('users').update({ favorite_fonts: next }).eq('id', id).select().maybeSingle()
    if (error) {
      console.error('[admin/users:id/favorite-fonts POST] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/users:id/favorite-fonts POST] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    if (!body || !body.fontFamily) return NextResponse.json({ error: 'missing fontFamily' }, { status: 400 })

    const { data: existing, error: selErr } = await supabaseAdmin.from('users').select('favorite_fonts').eq('id', id).maybeSingle()
    if (selErr) {
      console.error('[admin/users:id/favorite-fonts DELETE] select error', selErr)
      return NextResponse.json({ error: selErr.message }, { status: 500 })
    }
    const arr: string[] = Array.isArray(existing?.favorite_fonts) ? existing!.favorite_fonts : []
    const next = (arr || []).filter((f) => f !== body.fontFamily)
    const { data, error } = await supabaseAdmin.from('users').update({ favorite_fonts: next }).eq('id', id).select().maybeSingle()
    if (error) {
      console.error('[admin/users:id/favorite-fonts DELETE] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/users:id/favorite-fonts DELETE] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
