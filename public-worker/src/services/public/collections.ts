import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicCollections(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  const supabase = getSupabase(env)
  try {
    // If an explicit public owner is configured, return that user's collections.
    // Otherwise fall back to returning collections with visibility = 'public'.
    if (!ownerId) {
      const { data } = await supabase.from('collections').select('id,title,description,items').eq('visibility', 'public').order('sort_order', { ascending: true })
      const rows = Array.isArray(data) ? data : []
      return { data: rows }
    }
    const { data } = await supabase.from('collections').select('id,title,description,items').eq('user_id', ownerId).order('sort_order', { ascending: true })
    const rows = Array.isArray(data) ? data : []
    return { data: rows }
  } catch (e) {
    return { data: [] }
  }
}