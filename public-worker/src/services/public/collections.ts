import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicCollections(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  const supabase = getSupabase(env)
  try {
    // Return public collections (visibility = 'public'). Using visibility avoids RLS blocking
    // reads that may occur when attempting to filter by `user_id` with an anon key.
    const { data } = await supabase.from('collections').select('id,title,description').eq('visibility', 'public').order('sort_order', { ascending: true })
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
    for (const r of rows) { r.items = itemsByCollection.get(r.id) || [] }
    return { data: rows }
  } catch (e) {
    return { data: [] }
  }
}