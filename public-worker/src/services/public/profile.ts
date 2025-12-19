import { getSupabase } from '../../supabase'
import { getPublicImageUrl } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicProfile(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: null }
  const supabase = getSupabase(env)
  try {
    const { data, error } = await supabase.from('users').select('id,name,display_name,profile_image_key,bio,links').eq('id', ownerId).limit(1).maybeSingle()
    if (error || !data) return { data: null }
    const u: any = data
    const profileImage = u.profile_image_key ? getPublicImageUrl(u.profile_image_key, env.IMAGES_DOMAIN) : (u.avatar_url || null)
    return { data: { id: u.id, name: u.name || u.display_name || null, bio: u.bio || null, links: u.links || null, profileImage } }
  } catch (e) {
    return { data: null }
  }
}
