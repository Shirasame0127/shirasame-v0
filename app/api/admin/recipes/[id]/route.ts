import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

function mapClientToRow(body: any) {
  if (!body || typeof body !== 'object') return body
  const out: any = {}
  for (const k of Object.keys(body)) {
    const v = body[k]
    switch (k) {
      case 'userId':
        out['user_id'] = v
        break
      case 'imageUrl':
        out['image_url'] = v
        break
      case 'imageDataUrl':
        out['image_data_url'] = v
        break
      case 'imageWidth':
        out['image_width'] = v
        break
      case 'imageHeight':
        out['image_height'] = v
        break
      case 'createdAt':
        out['created_at'] = v
        break
      case 'updatedAt':
        out['updated_at'] = v
        break
      default:
        out[k] = v
    }
  }
  return out
}

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('recipes').select('*').eq('id', id).maybeSingle()
    if (error) {
      console.error('[admin/recipes:id GET] select error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes:id GET] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const updates = { ...mapClientToRow(body), updated_at: new Date().toISOString() }

    // Enforce owner when configured
    try {
      const ownerId = await getOwnerUserId()
      if (ownerId) {
        const { data, error } = await supabaseAdmin.from('recipes').update(updates).eq('id', id).eq('user_id', ownerId).select().maybeSingle()
        if (error) {
          console.error('[admin/recipes:id PUT] update error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        if (!data) return NextResponse.json({ error: 'not found or owner mismatch' }, { status: 404 })
        return NextResponse.json({ data })
      }
    } catch (e) {
      // owner resolution failed — fall back to update without owner constraint
    }

    const { data, error } = await supabaseAdmin.from('recipes').update(updates).eq('id', id).select().maybeSingle()
    if (error) {
      console.error('[admin/recipes:id PUT] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes:id PUT] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    // Enforce owner if possible
    try {
      const ownerId = await getOwnerUserId()
      if (ownerId) {
        const { data, error } = await supabaseAdmin.from('recipes').delete().eq('id', id).eq('user_id', ownerId).select()
        if (error) {
          console.error('[admin/recipes:id DELETE] delete error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        if (!data || (Array.isArray(data) && data.length === 0)) return NextResponse.json({ error: 'not found' }, { status: 404 })
        return NextResponse.json({ data })
      }
    } catch (e) {
      // fall back
    }

    const { data, error } = await supabaseAdmin.from('recipes').delete().eq('id', id).select()
    if (error) {
      console.error('[admin/recipes:id DELETE] delete error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data || (Array.isArray(data) && data.length === 0)) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes:id DELETE] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
