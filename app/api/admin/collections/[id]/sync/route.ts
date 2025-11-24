import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = params.id

    // Ensure collection belongs to owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collections/sync] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { data: collection, error: colErr } = await supabaseAdmin.from('collections').select('id,user_id').eq('id', collectionId).maybeSingle()
    if (colErr) {
      console.error('[admin/collections/sync] failed to fetch collection for ownership check', colErr)
      return NextResponse.json({ error: 'failed to validate collection' }, { status: 500 })
    }
    if (!collection || collection.user_id !== ownerUserId) {
      return NextResponse.json({ error: 'collection not found or not owned by configured profile' }, { status: 403 })
    }

    // fetch collection_items for this collection
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('collection_items')
      .select('id, product_id')
      .eq('collection_id', collectionId)

    if (itemsErr) {
      console.error('[admin/collections/sync] items fetch error', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    const productIds = (items || []).map((it: any) => it.product_id)
    if (productIds.length === 0) {
      return NextResponse.json({ data: { deleted: 0, totalCount: 0, existingCount: 0 } })
    }

    // find existing products
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id')
      .in('id', productIds)

    if (prodErr) {
      console.error('[admin/collections/sync] products fetch error', prodErr)
      return NextResponse.json({ error: prodErr.message }, { status: 500 })
    }

    const existingIds = new Set((products || []).map((p: any) => p.id))
    const missingItems = (items || []).filter((it: any) => !existingIds.has(it.product_id))

    if (missingItems.length === 0) {
      return NextResponse.json({ data: { deleted: 0, totalCount: productIds.length, existingCount: productIds.length } })
    }

    const missingProductIds = missingItems.map((m: any) => m.product_id)

    // delete collection_items that reference missing products
    const { error: delErr } = await supabaseAdmin
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .in('product_id', missingProductIds)

    if (delErr) {
      console.error('[admin/collections/sync] delete error', delErr)
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    // return updated counts
    const remainingCount = productIds.length - missingProductIds.length
    return NextResponse.json({ data: { deleted: missingProductIds.length, totalCount: productIds.length, existingCount: remainingCount } })
  } catch (e: any) {
    console.error('[admin/collections/sync] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
