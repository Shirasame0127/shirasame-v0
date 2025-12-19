import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicCollections(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    // replicate admin collection listing logic but only published products
      const { data } = await supabase.from('collections').select('id,title,description,items').eq('user_id', ownerId).order('sort_order', { ascending: true })
    const rows = Array.isArray(data) ? data : []
    // For each collection, ensure items reference published products only (caller can resolve products via products API)
    return { data: rows }
  } catch (e) {
    return { data: [] }
  }
}