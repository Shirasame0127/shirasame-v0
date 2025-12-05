import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

function mapProductPayload(payload: any) {
  return {
    id: payload.id || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `product-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
    user_id: payload.userId || payload.user_id || null,
    title: payload.title || null,
    slug: payload.slug || null,
    short_description: payload.shortDescription || payload.short_description || null,
    body: payload.body || null,
    tags: payload.tags || [],
    price: typeof payload.price === 'number' ? payload.price : payload.price ? Number(payload.price) : null,
    published: typeof payload.published === 'boolean' ? payload.published : payload.published ?? false,
    show_price: typeof payload.showPrice === 'boolean' ? payload.showPrice : payload.show_price ?? true,
    notes: payload.notes || null,
    related_links: payload.relatedLinks || null,
    created_at: payload.createdAt || new Date().toISOString(),
    updated_at: payload.updatedAt || new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    if (!currentUserId) {
      return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
    }

    const q = supabaseAdmin.from('products').select('*, images:product_images(*)').eq('user_id', currentUserId)
    const { data, error } = await q
    if (error) {
      console.error('[admin/products] GET error', error)
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
    }

    return NextResponse.json({ products: data || [] })
  } catch (e: any) {
    console.error('[admin/products] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)
    const row = mapProductPayload(body)

    if (currentUserId) {
      row.user_id = currentUserId
    } else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) row.user_id = ownerId
      } catch (e) {
        console.warn('[admin/products] owner resolution failed', e)
      }
    }

    const { data, error } = await supabaseAdmin.from('products').insert([row]).select().single()
    if (error) {
      console.error('[admin/products] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/products] POST exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })
    if (!id && !body.id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const targetId = id || body.id
    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    let query: any = supabaseAdmin.from('products').update(body).eq('id', targetId).select()
    if (currentUserId) query = supabaseAdmin.from('products').update(body).eq('id', targetId).eq('user_id', currentUserId).select()
    else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) query = supabaseAdmin.from('products').update(body).eq('id', targetId).eq('user_id', ownerId).select()
      } catch (e) {}
    }

    const { data, error } = await query.single()
    if (error) {
      console.error('[admin/products PUT] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/products] PUT exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const id = body?.id || null
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    let query: any = supabaseAdmin.from('products').delete().eq('id', id).select()
    if (currentUserId) query = supabaseAdmin.from('products').delete().eq('id', id).eq('user_id', currentUserId).select()
    else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) query = supabaseAdmin.from('products').delete().eq('id', id).eq('user_id', ownerId).select()
      } catch (e) {}
    }

    const { data, error } = await query
    if (error) {
      console.error('[admin/products DELETE] delete error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || (Array.isArray(data) && data.length === 0)) return NextResponse.json({ error: 'not found' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/products] DELETE exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
