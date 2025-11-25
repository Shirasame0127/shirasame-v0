import { NextResponse } from "next/server"
import getAdminSupabase from "@/lib/supabase/server"
import { getOwnerUserId } from '@/lib/owner'
import { getPublicImageUrl } from '@/lib/image-url'

function mapRowToClient(row: any) {
  if (!row) return null
  return {
    id: row.id,
    name: row.display_name || row.name || null,
    displayName: row.display_name || row.name || null,
    email: row.email || null,
    // Provide both snake_case and camelCase aliases so client code is resilient
    avatar_url: getPublicImageUrl(row.avatar_url || null),
    avatarUrl: getPublicImageUrl(row.avatar_url || null),
    profile_image: getPublicImageUrl(row.profile_image || row.profile_image_key || null),
    profileImage: getPublicImageUrl(row.profile_image || row.profile_image_key || null),
    profile_image_key: row.profile_image_key || null,
    profileImageKey: row.profile_image_key || null,
    header_image: row.header_image || null,
    headerImage: getPublicImageUrl(row.header_image || null),
    header_images: row.header_image_keys || row.header_image || [],
    headerImageKeys: row.header_image_keys || (row.header_image ? [getPublicImageUrl(row.header_image)] : []),
    header_images_keys: row.header_image_keys || row.header_image || [],
    header_image_keys: row.header_image_keys || (row.header_image ? [row.header_image] : []),
    bio: row.bio || null,
    socialLinks: row.social_links || row.socialLinks || [],
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    backgroundType: row.background_type || null,
    backgroundValue: row.background_value || null,
    background_image_value: row.background_value || null,
    backgroundImageKey: row.background_image_key || null,
    background_image_key: row.background_image_key || null,
    amazonAccessKey: row.amazon_access_key || null,
    amazonSecretKey: row.amazon_secret_key || null,
    amazonAssociateId: row.amazon_associate_id || null,
  }
}

function mapClientToRow(payload: any) {
  const out: any = {}
  if (payload.displayName !== undefined) out.display_name = payload.displayName
  if (payload.display_name !== undefined) out.display_name = payload.display_name
  if (payload.email !== undefined) out.email = payload.email
  if (payload.bio !== undefined) out.bio = payload.bio
  if (payload.profile_image_key !== undefined) out.profile_image_key = payload.profile_image_key
  if (payload.profileImageKey !== undefined) out.profile_image_key = payload.profileImageKey
  if (payload.profileImage !== undefined) out.profile_image = payload.profileImage
  if (payload.profile_image !== undefined) out.profile_image = payload.profile_image
  if (payload.avatar_url !== undefined) out.avatar_url = payload.avatar_url
  if (payload.backgroundType !== undefined) out.background_type = payload.backgroundType
  if (payload.backgroundValue !== undefined) out.background_value = payload.backgroundValue
  if (payload.backgroundImageValue !== undefined) out.background_value = payload.backgroundImageValue
  if (payload.background_image_value !== undefined) out.background_value = payload.background_image_value
  if (payload.backgroundImageKey !== undefined) out.background_image_key = payload.backgroundImageKey
  if (payload.headerImageKeys !== undefined) out.header_image_keys = payload.headerImageKeys
  if (payload.header_image_keys !== undefined) out.header_image_keys = payload.header_image_keys
  if (payload.headerImage !== undefined) out.header_image = payload.headerImage
  if (payload.header_image !== undefined) out.header_image = payload.header_image
  if (payload.socialLinks !== undefined) out.social_links = payload.socialLinks
  if (payload.amazonAccessKey !== undefined) out.amazon_access_key = payload.amazonAccessKey
  if (payload.amazonSecretKey !== undefined) out.amazon_secret_key = payload.amazonSecretKey
  if (payload.amazonAssociateId !== undefined) out.amazon_associate_id = payload.amazonAssociateId
  // Normalize potential alias/typo keys and then filter to allowed DB columns
  function sanitizeSettingsPayload(p: any) {
    const allowed = new Set([
      'display_name','email','bio','profile_image_key','profile_image','avatar_url','background_type','background_value','background_image_key',
      'header_image','header_image_keys','header_images','social_links','amazon_access_key','amazon_secret_key','amazon_associate_id'
    ])
    const out: any = {}
    for (const [k, v] of Object.entries(p || {})) {
      let key = k
      if (key === 'header_images_keys') key = 'header_image_keys'
      if (key === 'headerImageKeys') key = 'header_image_keys'
      if (key === 'backgroundImageValue' || key === 'backgroundValue' || key === 'background_image_value') key = 'background_value'
      const snake = key.includes('_') ? key : key.replace(/([A-Z])/g, (_m, p1) => `_${p1.toLowerCase()}`)
      if (allowed.has(snake)) out[snake] = v
    }
    return out
  }
  return out
}

export async function GET() {
  const supabase = getAdminSupabase()
  try {
    // Resolve configured owner first and fetch that user's row when possible.
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.warn('[api/admin/settings] failed to resolve owner', oe)
    }

    let userQuery: any = null
    if (ownerUserId) {
      userQuery = await supabase.from('users').select('*').eq('id', ownerUserId).maybeSingle()
    } else {
      userQuery = await supabase.from('users').select('*').limit(1).maybeSingle()
    }

    const { data, error } = userQuery || { data: null, error: null }
    if (error) {
      console.warn('[api/admin/settings] GET users error', error)
      return NextResponse.json({ data: null, error: error.message }, { status: 200 })
    }

    // Also fetch amazon credentials for the owner (stored in separate table) and merge into response
    let amazonRow: any = null
    try {
      if (ownerUserId) {
        const { data: aData, error: aErr } = await supabase.from('amazon_credentials').select('*').eq('user_id', ownerUserId).maybeSingle()
          console.log('[api/admin/settings] GET amazon_credentials select result:', { ownerUserId, aData, aErr })
        if (aErr) {
          console.warn('[api/admin/settings] GET amazon_credentials warning', aErr)
        } else {
          amazonRow = aData
        }
      } else {
        // fallback to default row
        const { data: aData, error: aErr } = await supabase.from('amazon_credentials').select('*').eq('id', 'default').maybeSingle()
        if (!aErr) amazonRow = aData
      }
    } catch (ae) {
      console.error('[api/admin/settings] failed to read amazon_credentials', ae)
    }

    const clientRow = mapRowToClient(data) || {}
    if (amazonRow) {
      clientRow.amazonAccessKey = amazonRow.access_key || clientRow.amazonAccessKey
      clientRow.amazonSecretKey = amazonRow.secret_key || clientRow.amazonSecretKey
      clientRow.amazonAssociateId = amazonRow.associate_id || clientRow.amazonAssociateId
    }

    return NextResponse.json({ data: clientRow }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const supabase = getAdminSupabase()
  try {
    const body = await req.json()
    const id = body?.id
    const payload = mapClientToRow(body)
    // Resolve configured owner and restrict settings updates/inserts to that owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[api/admin/settings] failed to resolve owner', oe)
      return NextResponse.json({ data: null, error: 'owner resolution failed' }, { status: 500 })
    }

    if (id) {
      if (id !== ownerUserId) {
        return NextResponse.json({ data: null, error: 'forbidden' }, { status: 403 })
      }
      const { data, error } = await supabase.from("users").update(payload).eq("id", id).select().maybeSingle()
      if (error) {
        console.warn("[api/admin/settings] PUT update error", error)
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ data: mapRowToClient(data) }, { status: 200 })
    }

    // If no id provided, apply changes to owner row (upsert-like behavior)
    const { data: ownerRow, error: ownerErr } = await supabase.from('users').select('*').eq('id', ownerUserId).maybeSingle()
    if (ownerErr) {
      console.warn('[api/admin/settings] failed to fetch owner row', ownerErr)
      return NextResponse.json({ data: null, error: ownerErr.message }, { status: 500 })
    }
    if (ownerRow) {
      const { data, error } = await supabase.from('users').update(payload).eq('id', ownerUserId).select().maybeSingle()
      if (error) {
        console.warn('[api/admin/settings] failed to update owner row', error)
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ data: mapRowToClient(data) }, { status: 200 })
    }

    // No owner row exists: create one using PUBLIC_PROFILE_EMAIL implicitly
    const insertPayload: any = { ...payload, email: process.env.PUBLIC_PROFILE_EMAIL }
    if (ownerUserId) insertPayload.id = ownerUserId
    const { data, error } = await supabase.from("users").insert(insertPayload).select().maybeSingle()
    if (error) {
      console.warn("[api/admin/settings] PUT insert error", error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: mapRowToClient(data) }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

export const runtime = "nodejs"
