import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function GET(req: Request, { params }: { params: any }) {
  try {
    // Next.js may pass `params` as a Promise in some environments — await if needed
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const collectionId = maybeParams?.id || (params && (params as any).id)

    // Ensure collection belongs to owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/collections/inspect] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    const { data: collection, error: colErr } = await supabaseAdmin.from('collections').select('id,user_id').eq('id', collectionId).maybeSingle()
    if (colErr) {
      console.error('[admin/collections/inspect] failed to fetch collection for ownership check', colErr)
      return NextResponse.json({ error: 'failed to validate collection' }, { status: 500 })
    }
    if (!collection || collection.user_id !== ownerUserId) {
      return NextResponse.json({ error: 'collection not found or not owned by configured profile' }, { status: 403 })
    }

    // get all collection_items for this collection
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('collection_items')
      .select('product_id')
      .eq('collection_id', collectionId)

    if (itemsErr) {
      console.error('[admin/collections/inspect] items fetch error', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    const productIds = (items || []).map((it: any) => it.product_id)
    const totalCount = productIds.length

    if (totalCount === 0) {
      return NextResponse.json({ data: { totalCount: 0, existingCount: 0, missingCount: 0, missingIds: [] } })
    }

    // fetch existing products with those ids
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id')
      .in('id', productIds)

    if (prodErr) {
      console.error('[admin/collections/inspect] products fetch error', prodErr)
      return NextResponse.json({ error: prodErr.message }, { status: 500 })
    }

    const existingIds = new Set((products || []).map((p: any) => p.id))
    const missingIds = productIds.filter((id: string) => !existingIds.has(id))

    // If there are missing product references, delete those collection_items immediately
    if (missingIds.length > 0) {
      try {
        const { data: deletedRows, error: delErr } = await supabaseAdmin
          .from('collection_items')
          .delete()
          .select('product_id')
          .eq('collection_id', collectionId)
          .in('product_id', missingIds)

        if (delErr) {
          console.error('[admin/collections/inspect] delete missing items error', delErr)
          return NextResponse.json({ error: delErr.message }, { status: 500 })
        }

        const deletedCount = Array.isArray(deletedRows) ? deletedRows.length : 0
        const existingCount = totalCount - deletedCount

        return NextResponse.json({ data: {
          totalCount,
          existingCount,
          missingCount: 0,
          missingIds: [],
          deleted: deletedCount,
        }})
      } catch (e: any) {
        console.error('[admin/collections/inspect] delete exception', e)
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
      }
    }

    return NextResponse.json({ data: {
      totalCount,
      existingCount: totalCount - missingIds.length,
      missingCount: missingIds.length,
      missingIds,
    }})
  } catch (e: any) {
    console.error('[admin/collections/inspect] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
