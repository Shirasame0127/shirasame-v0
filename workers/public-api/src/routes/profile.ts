import { Context } from 'hono'
import { getSupabaseAdmin } from '../lib/supabase'
import { getPublicImageUrl } from '../lib/images'
import type { Env } from '../lib/types'

export async function handleProfile(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const supabase = getSupabaseAdmin(env)
  try {
    const email = env.PUBLIC_PROFILE_EMAIL || 'shirasame.official@gmail.com'
    const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1)
    if (error) return c.json(null)
    const user = Array.isArray(data) && data.length > 0 ? (data[0] as any) : null
    if (!user) {
      const placeholder = {
        id: 'anon',
        name: 'Samehome',
        displayName: 'Samehome',
        email: null,
        avatarUrl: '/placeholder.svg',
        profileImage: '/placeholder.svg',
        profileImageKey: null,
        headerImage: '/images/shirasame_background_sm.jpg',
        headerImages: ['/images/shirasame_background_sm.jpg'],
        headerImageKey: null,
        headerImageKeys: ['/images/shirasame_background_sm.jpg'],
        bio: 'ようこそ。同じ部屋のおすすめを集めています。',
        socialLinks: null,
      }
      return c.json({ data: placeholder })
    }
    const transformed = {
      id: user.id,
      name: user.name || null,
      displayName: user.display_name || user.displayName || user.name || null,
      email: user.email || null,
      avatarUrl: getPublicImageUrl(user.avatar_url || user.avatarUrl || user.profile_image || null, env),
      profileImage: getPublicImageUrl(user.profile_image || user.profile_image_key || user.profileImageKey || null, env),
      profileImageKey: (user.profile_image_key || user.profileImageKey) || null,
      headerImage: getPublicImageUrl(user.header_image || (Array.isArray(user.header_image_keys) ? user.header_image_keys[0] : null) || null, env),
      headerImages: (user.header_image_keys || (user.header_image ? [user.header_image] : null))
        ? (Array.isArray(user.header_image_keys) ? user.header_image_keys.map((h: any) => getPublicImageUrl(h, env)) : (user.header_image ? [getPublicImageUrl(user.header_image, env)] : null))
        : null,
      headerImageKey: user.header_image_key || null,
      headerImageKeys: user.header_image_keys || null,
      bio: user.bio || null,
      socialLinks: user.social_links || user.socialLinks || null,
    }
    return c.json({ data: transformed })
  } catch (e: any) {
    return c.json(null)
  }
}
