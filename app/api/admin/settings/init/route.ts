import { NextResponse } from "next/server"
import getAdminSupabase from "@/lib/supabase/server"

function mapRowToClient(row: any) {
  if (!row) return null
  return {
    id: row.id,
    displayName: row.display_name || row.name || null,
    display_name: row.display_name || row.name || null,
    email: row.email || null,
    bio: row.bio || null,
    socialLinks: row.social_links || [],
    headerImageKeys: row.header_image_keys || [],
    profile_image_key: row.profile_image_key || null,
    backgroundType: row.background_type || null,
    backgroundValue: row.background_value || null,
    amazonAccessKey: row.amazon_access_key || null,
    amazonSecretKey: row.amazon_secret_key || null,
    amazonAssociateId: row.amazon_associate_id || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

export async function GET() {
  const supabase = getAdminSupabase()
  try {
    const { data: existing, error: selectErr } = await supabase.from('users').select('*').limit(1).maybeSingle()
    if (selectErr) {
      console.warn('[api/admin/settings/init] select error', selectErr)
      return NextResponse.json({ data: null, error: selectErr.message }, { status: 200 })
    }

    if (existing) {
      return NextResponse.json({ data: mapRowToClient(existing) }, { status: 200 })
    }

    // No user exists — create a default user record
    const now = new Date().toISOString()
    // Create or ensure a user row for the configured PUBLIC_PROFILE_EMAIL owner
    let ownerUserId: string | null = null
    try {
      ownerUserId = await (await import('@/lib/owner')).getOwnerUserId()
    } catch (oe) {
      // If owner not resolvable, fall back to creating a default owner row with PUBLIC_PROFILE_EMAIL
      console.warn('[api/admin/settings/init] owner resolution failed, will attempt to create default owner row', oe)
    }

    if (!ownerUserId) {
      const defaultUser = {
        display_name: '管理者',
        bio: '初期ユーザー（自動作成）',
        email: process.env.PUBLIC_PROFILE_EMAIL || 'admin@example.com',
        profile_image_key: null,
        avatar_url: null,
        background_type: 'color',
        background_value: '#ffffff',
        social_links: [],
        header_image_keys: [],
        amazon_access_key: null,
        amazon_secret_key: null,
        amazon_associate_id: null,
        created_at: now,
        updated_at: now,
      }

      const { data: inserted, error: insertErr } = await supabase.from('users').insert(defaultUser).select().maybeSingle()
      if (insertErr) {
        console.error('[api/admin/settings/init] insert error', insertErr)
        return NextResponse.json({ data: null, error: insertErr.message }, { status: 500 })
      }

      return NextResponse.json({ data: mapRowToClient(inserted) }, { status: 201 })
    }

    // owner exists; return owner row
    const { data: ownerRow, error: ownerErr } = await supabase.from('users').select('*').eq('id', ownerUserId).maybeSingle()
    if (ownerErr) {
      console.error('[api/admin/settings/init] failed to fetch owner row', ownerErr)
      return NextResponse.json({ data: null, error: ownerErr.message }, { status: 500 })
    }

    if (ownerRow) {
      return NextResponse.json({ data: mapRowToClient(ownerRow) }, { status: 200 })
    }
    if (insertErr) {
      console.error('[api/admin/settings/init] insert error', insertErr)
      return NextResponse.json({ data: null, error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ data: mapRowToClient(inserted) }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
