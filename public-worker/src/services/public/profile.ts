import { getSupabase } from '../../supabase'
import { getPublicImageUrl, buildResizedImageUrl } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

function parseKeysField(val: any): string[] {
  try {
    if (!val) return []
    if (Array.isArray(val)) return val.filter(Boolean).map(String)
    if (typeof val === 'string') {
      const s = val.trim()
      if (s.startsWith('[')) return JSON.parse(s)
      return [s]
    }
    return []
  } catch (e) { return [] }
}

export async function fetchPublicProfile(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: null }
  const supabase = getSupabase(env)
  try {
    const { data, error } = await supabase.from('users')
      .select('id,name,display_name,bio,profile_image_key,avatar_url,header_image_keys,background_type,background_value,links,social_links')
      .eq('id', ownerId)
      .limit(1)
      .maybeSingle()
    if (error || !data) return { data: null }
    const u: any = data

    const profileImageKey = u.profile_image_key ?? null
    const profileImage = profileImageKey ? (getPublicImageUrl(profileImageKey, env.IMAGES_DOMAIN) || null) : (u.avatar_url || null)

    const headerKeys = parseKeysField(u.header_image_keys || u.headerImageKeys || null)
    const headerImages = headerKeys.map((k: string) => {
      try { return buildResizedImageUrl(k, { width: 800 }, env.IMAGES_DOMAIN) } catch { return null }
    }).filter(Boolean)

    const out: any = {
      id: u.id,
      display_name: u.display_name || u.name || null,
      bio: u.bio ?? null,
      profile_image_key: profileImageKey,
      profile_image: profileImage,
      header_image_keys: headerKeys,
      header_images: headerImages,
      background_type: u.background_type ?? null,
      background_value: u.background_value ?? null,
      social_links: u.social_links ?? u.links ?? null,
    }

    return { data: out }
  } catch (e) {
    return { data: null }
  }
}