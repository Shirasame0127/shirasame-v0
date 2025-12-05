import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

function mapRecipePayload(payload: any) {
  return {
    id: payload.id || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `recipe-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
    user_id: payload.userId || payload.user_id || null,
    title: payload.title || payload.name || null,
    slug: payload.slug || null,
    body: payload.body || payload.content || null,
    published: typeof payload.published === 'boolean' ? payload.published : payload.published ?? false,
    created_at: payload.createdAt || new Date().toISOString(),
    updated_at: payload.updatedAt || new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    const recipeRow = mapRecipePayload(body)
    if (currentUserId) {
      recipeRow.user_id = currentUserId
    } else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) recipeRow.user_id = ownerId
      } catch (e) {
        console.warn('[admin/recipes] owner resolution failed', e)
      }
    }

    const { data, error } = await supabaseAdmin.from('recipes').insert([recipeRow]).select().single()
    if (error) {
      console.error('[admin/recipes] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    if (!body || !body.id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const id = body.id
    const published = typeof body.published === 'boolean' ? body.published : undefined
    if (typeof published === 'undefined') return NextResponse.json({ error: 'missing published flag' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    let query: any = supabaseAdmin.from('recipes').update({ published, updated_at: new Date().toISOString() }).eq('id', id).select()
    if (currentUserId) {
      query = supabaseAdmin.from('recipes').update({ published, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', currentUserId).select()
    } else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) query = supabaseAdmin.from('recipes').update({ published, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', ownerId).select()
      } catch (e) {}
    }

    const { data, error } = await query.single()
    if (error) {
      console.error('[admin/recipes PATCH] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes PATCH] exception', e)
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

    let query: any = supabaseAdmin.from('recipes').delete().eq('id', id).select()
    if (currentUserId) {
      query = supabaseAdmin.from('recipes').delete().eq('id', id).eq('user_id', currentUserId).select()
    } else {
      try {
        const ownerId = await getOwnerUserId()
        if (ownerId) query = supabaseAdmin.from('recipes').delete().eq('id', id).eq('user_id', ownerId).select()
      } catch (e) {}
    }

    const { data, error } = await query
    if (error) {
      console.error('[admin/recipes DELETE] delete error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || (Array.isArray(data) && data.length === 0)) return NextResponse.json({ error: 'not found' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipes DELETE] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
