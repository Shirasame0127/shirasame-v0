import { getSupabase } from '../../supabase'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicTagGroups(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { data } = await supabase.from('tag_groups').select('name, label, sort_order, created_at').eq('user_id', ownerId).order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
    return { data: data || [] }
  } catch (e) {
    return { data: [] }
  }
}
