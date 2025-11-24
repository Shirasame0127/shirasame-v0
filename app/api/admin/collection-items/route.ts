import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

function makeId() {
  return `ci-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const collectionId = body.collectionId
    const productId = body.productId
    if (!collectionId || !productId) return NextResponse.json({ error: 'missing params' }, { status: 400 })

    // Ensure the collection belongs to the configured owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collection-items] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { data: collection, error: colErr } = await supabaseAdmin.from('collections').select('id, user_id').eq('id', collectionId).maybeSingle()
    if (colErr) {
      console.error('[admin/collection-items] failed to fetch collection for ownership check', colErr)
      return NextResponse.json({ error: 'failed to validate collection' }, { status: 500 })
    }
    if (!collection || collection.user_id !== ownerUserId) {
      return NextResponse.json({ error: 'collection not found or not owned by configured profile' }, { status: 403 })
    }

    // compute next order
    const { data: existing, error: qErr } = await supabaseAdmin
      .from('collection_items')
      .select('"order"')
      .eq('collection_id', collectionId)

    if (qErr) {
      console.error('[admin/collection-items] order query error', qErr)
    }

    const maxOrder = (existing || []).reduce((acc: number, r: any) => Math.max(acc, r.order || 0), 0)

    const row = {
      id: makeId(),
      collection_id: collectionId,
      product_id: productId,
      order: maxOrder + 1,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin.from('collection_items').insert([row]).select().single()
    if (error) {
      console.error('[admin/collection-items] POST error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Recalculate item count for the collection and persist to collections table
    try {
      const { data: allItems } = await supabaseAdmin.from('collection_items').select('id').eq('collection_id', collectionId)
      const newCount = Array.isArray(allItems) ? allItems.length : 0
      const { error: updateErr } = await supabaseAdmin.from('collections').update({ item_count: newCount }).eq('id', collectionId).eq('user_id', ownerUserId)
      if (updateErr) {
        // log but don't fail the entire operation
        console.warn('[admin/collection-items] failed to update collection item_count', updateErr)
      }

      return NextResponse.json({ data: { item: data, itemCount: newCount } })
    } catch (e: any) {
      console.error('[admin/collection-items] post-count exception', e)
      return NextResponse.json({ data: { item: data, itemCount: null } })
    }
  } catch (e: any) {
    console.error('[admin/collection-items] POST exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const collectionId = body.collectionId
    const productId = body.productId
    if (!collectionId || !productId) return NextResponse.json({ error: 'missing params' }, { status: 400 })

    // Ensure the collection belongs to the configured owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collection-items] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { data: collection, error: colErr } = await supabaseAdmin.from('collections').select('id, user_id').eq('id', collectionId).maybeSingle()
    if (colErr) {
      console.error('[admin/collection-items] failed to fetch collection for ownership check', colErr)
      return NextResponse.json({ error: 'failed to validate collection' }, { status: 500 })
    }
    if (!collection || collection.user_id !== ownerUserId) {
      return NextResponse.json({ error: 'collection not found or not owned by configured profile' }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from('collection_items').delete().eq('collection_id', collectionId).eq('product_id', productId)
    if (error) {
      console.error('[admin/collection-items] DELETE error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Recalculate item count and persist
    try {
      const { data: allItems } = await supabaseAdmin.from('collection_items').select('id').eq('collection_id', collectionId)
      const newCount = Array.isArray(allItems) ? allItems.length : 0
      const { error: updateErr } = await supabaseAdmin.from('collections').update({ item_count: newCount }).eq('id', collectionId).eq('user_id', ownerUserId)
      if (updateErr) {
        console.warn('[admin/collection-items] failed to update collection item_count', updateErr)
      }
      return NextResponse.json({ data: { deleted: true, itemCount: newCount } })
    } catch (e: any) {
      console.error('[admin/collection-items] delete-count exception', e)
      return NextResponse.json({ data: { deleted: true, itemCount: null } })
    }
  } catch (e: any) {
    console.error('[admin/collection-items] DELETE exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
