import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/image-url'

export async function GET() {
  try {
    // Return the public profile for the site owner.
    // Prefer explicitly-configured email so public page always shows the intended account.
    const OWNER_EMAIL = process.env.PUBLIC_PROFILE_EMAIL || 'shirasame.official@gmail.com'
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', OWNER_EMAIL).limit(1)
    if (error) {
      console.warn('[api/profile] supabase users fetch error', error)
      return NextResponse.json(null)
    }

    const user = Array.isArray(data) && data.length > 0 ? data[0] : null
    // If no profile exists in DB, return a friendly placeholder profile so the public page shows header and card.
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
      return NextResponse.json({ data: placeholder })
    }

    // Map DB columns to client-expected shape
    const transformed = {
      id: user.id,
      name: user.name || null,
      displayName: user.display_name || user.displayName || user.name || null,
      email: user.email || null,
      avatarUrl: getPublicImageUrl(user.avatar_url || user.avatarUrl || user.profile_image || null),
      profileImage: getPublicImageUrl(user.profile_image || user.profile_image_key || user.profileImageKey || null),
      profileImageKey: (user.profile_image_key || user.profileImageKey) || null,
      headerImage: getPublicImageUrl(user.header_image || (Array.isArray(user.header_image_keys) ? user.header_image_keys[0] : null) || null),
      headerImages: (user.header_image_keys || (user.header_image ? [user.header_image] : null))
        ? (Array.isArray(user.header_image_keys) ? user.header_image_keys.map((h: any) => getPublicImageUrl(h)) : (user.header_image ? [getPublicImageUrl(user.header_image)] : null))
        : null,
      headerImageKey: user.header_image_key || null,
      headerImageKeys: user.header_image_keys || null,
      bio: user.bio || null,
      socialLinks: user.social_links || user.socialLinks || null,
    }

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/profile] exception', e)
    return NextResponse.json(null)
  }
}
