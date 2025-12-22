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
      .select('*')
      .eq('id', ownerId)
      .single()

    if (error) {
      console.error('fetchPublicProfile supabase error', { ownerId, error })
      return { data: null }
    }
    if (!data) {
      console.error('fetchPublicProfile: no user found', { ownerId })
      return { data: null }
    }
    const u: any = data
    // Build transformed URLs only (no raw keys)
    const profileImageKey = u.profile_image_key ?? null
    const profile_image = profileImageKey
      ? (getPublicImageUrl(profileImageKey, env.IMAGES_DOMAIN) || null)
      : (u.avatar_url || null)

    const headerKeys = parseKeysField(u.header_image_keys || u.headerImageKeys || null)
    const header_images = headerKeys
      .map((k: string) => {
        try { return buildResizedImageUrl(k, { width: 800 }, env.IMAGES_DOMAIN) } catch { return null }
      })
      .filter(Boolean)

    // Normalize social_links: if stored as JSON string, parse it
    let socialLinks: any = u.social_links ?? u.links ?? null
    try {
      if (typeof socialLinks === 'string' && socialLinks.trim().length > 0) {
        socialLinks = JSON.parse(socialLinks)
      }
    } catch (e) {
      console.error('fetchPublicProfile: failed to parse social_links', { ownerId, error: e })
      socialLinks = null
    }

    const out: any = {
      display_name: u.display_name || u.name || null,
      bio: u.bio ?? null,
      social_links: socialLinks,
      profile_image: profile_image,
      header_images: header_images,
      background_type: u.background_type ?? null,
      background_value: u.background_value ?? null,
    }

    return { data: out }
  } catch (e) {
    console.error('fetchPublicProfile exception', { ownerId, error: e })
    return { data: null }
  }
}