import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request, context: any) {
  try {
    // In Next.js App Router, `context.params` can be a Promise in some runtimes.
    // Await it to safely access dynamic route params.
    const params = await context.params
    const collectionId = params.id
    // get collection_items
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('"order"', { ascending: true })

    if (itemsErr) {
      console.error('[admin/collections/:id/items] items query error', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    const productIds = (items || []).map((it: any) => it.product_id)

    let products: any[] = []
    if (productIds.length > 0) {
      const { data: prods, error: prodErr } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds)

      if (prodErr) {
        console.error('[admin/collections/:id/items] products query error', prodErr)
      } else {
        products = prods || []
      }
    }

    // Map items to product objects in order
    const list = (items || []).map((it: any) => {
      const p = products.find((pp) => pp.id === it.product_id) || null
      return {
        id: it.id,
        collectionId: it.collection_id,
        productId: it.product_id,
        order: it.order,
        createdAt: it.created_at,
        product: p ? {
          id: p.id,
          title: p.title,
          shortDescription: p.short_description,
          price: p.price,
          published: p.published,
        } : null,
      }
    })

    return NextResponse.json({ data: list })
  } catch (e: any) {
    console.error('[admin/collections/:id/items] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
