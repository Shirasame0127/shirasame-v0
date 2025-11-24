import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

type Payload = {
  id?: string
  name?: string | null
  displayName?: string | null
  email: string
  avatarUrl?: string | null
  profileImage?: string | null
  profileImageKey?: string | null
  headerImageKeys?: string[] | null
  bio?: string | null
  socialLinks?: any
}

export async function POST(req: Request) {
  try {
    const body: Payload = await req.json().catch(() => ({} as Payload))
    const email = (body?.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ ok: false, error: 'email required' }, { status: 400 })

    // Only allow importing/upserting the configured PUBLIC_PROFILE_EMAIL to enforce owner-only writes
    const ownerEmail = (process.env.PUBLIC_PROFILE_EMAIL || '').toString().trim().toLowerCase()
    if (ownerEmail && email !== ownerEmail) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }

    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    // Prepare user row (use provided id if present to preserve linkage)
    const userRow: any = {
      id: body.id || undefined,
      name: body.name || null,
      display_name: body.displayName || null,
      email,
      avatar_url: body.avatarUrl || null,
      profile_image_key: body.profileImageKey || null,
      profile_image: body.profileImage || null,
      header_image_keys: body.headerImageKeys || null,
      bio: body.bio || null,
      social_links: body.socialLinks || null,
      updated_at: new Date().toISOString(),
    }

    // Upsert into public.users; if id is provided, upsert by id, else by email
    try {
      const onConflict = body.id ? 'id' : 'email'
      const { data: udata, error: uerr } = await supabaseAdmin.from('users').upsert(userRow, { onConflict }).select().maybeSingle()
      if (uerr) {
        console.error('[import-profile] users upsert error', uerr)
        return NextResponse.json({ ok: false, error: uerr.message }, { status: 500 })
      }

      const userId = (udata && udata.id) || userRow.id || null

      // Do not use a separate `profiles` table. Persist profile-like fields on `users` table.
      if (userId) {
        const updatePayload: any = {}
        if (body.displayName) updatePayload.display_name = body.displayName
        if (body.name) updatePayload.name = body.name
        if (typeof body.avatarUrl !== 'undefined') updatePayload.avatar_url = body.avatarUrl
        if (typeof body.profileImage !== 'undefined') updatePayload.profile_image = body.profileImage
        if (typeof body.profileImageKey !== 'undefined') updatePayload.profile_image_key = body.profileImageKey
        if (typeof body.headerImageKeys !== 'undefined') updatePayload.header_image_keys = body.headerImageKeys
        if (typeof body.bio !== 'undefined') updatePayload.bio = body.bio
        if (typeof body.socialLinks !== 'undefined') updatePayload.social_links = body.socialLinks
        if (Object.keys(updatePayload).length > 0) {
          try {
            const { data: updated, error: updErr } = await supabaseAdmin.from('users').update(updatePayload).eq('id', userId).select().maybeSingle()
            if (updErr) console.warn('[import-profile] users update warning', updErr)
          } catch (e) {
            console.warn('[import-profile] users update exception', e)
          }
        }
      }

      return NextResponse.json({ ok: true, data: { user: udata } }, { status: 200 })
    } catch (e) {
      console.error('[import-profile] exception', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

  } catch (e) {
    console.error('[import-profile] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
