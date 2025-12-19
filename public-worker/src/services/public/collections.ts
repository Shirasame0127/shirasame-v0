import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicCollections(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  const supabase = getSupabase(env)
  try {
    // Return public collections (visibility = 'public'). Using visibility avoids RLS blocking
    // reads that may occur when attempting to filter by `user_id` with an anon key.
    // Select commonly-used fields and order by legacy `order` column (fallback to created_at if absent)
    const { data } = await supabase.from('collections').select('id,title,description,order,item_count,created_at').eq('visibility', 'public').order('order', { ascending: true })
    const rows = Array.isArray(data) ? data : []
    const ids = rows.map((r: any) => r.id).filter(Boolean)
    if (ids.length === 0) return { data: rows }
    const { data: items = [] } = await supabase.from('collection_items').select('*').in('collection_id', ids)
    const itemsByCollection = new Map<string, any[]>()
    for (const it of items || []) {
      const colId = it.collection_id
      if (!itemsByCollection.has(colId)) itemsByCollection.set(colId, [])
      itemsByCollection.get(colId).push(it)
    }

    // Fetch products referenced by collection_items and replace items with product objects
    const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id).filter(Boolean)))
    let productsById = new Map<string, any>()
    if (productIds.length > 0) {
      const { data: products = [] } = await supabase.from('products').select('*').in('id', productIds)
      for (const p of products || []) productsById.set(p.id, p)
    }

    for (const r of rows) {
      const rawItems = itemsByCollection.get(r.id) || []
      // Preserve order from collection_items.order when available
      rawItems.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      r.items = rawItems.map((it: any) => productsById.get(it.product_id)).filter(Boolean)
    }
    return { data: rows }
  } catch (e) {
    return { data: [] }
  }
}