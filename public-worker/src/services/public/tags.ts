import { getSupabase } from '../../supabase'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicTags(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { data } = await supabase.from('tags').select('id, name, "group", link_url, link_label, sort_order, created_at').eq('user_id', ownerId).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    return { data: data || [] }
  } catch (e) {
    return { data: [] }
  }
}
