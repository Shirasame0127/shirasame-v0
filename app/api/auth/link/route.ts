import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const userId = body?.userId
    const email = body?.email || null
    const username = body?.username || null

    if (!userId) return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 })

    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    try {
      // Upsert a users row with id = auth.user.id so we can link them
      // Prefer: explicit username -> email local-part (before @) -> null
      const emailLocal = email ? String(email).split('@')[0] : null
      const row = {
        id: userId,
        email,
        display_name: username || emailLocal || null,
        updated_at: new Date().toISOString(),
      }

      // Enforce owner-only writes: only allow linking for configured PUBLIC_PROFILE_EMAIL
      let ownerUserId: string | null = null
      try {
        ownerUserId = await getOwnerUserId()
      } catch (oe) {
        // Don't treat owner resolution failure as fatal in development — warn and continue.
        // Previously this returned 500 and caused linking to fail when owner row wasn't present.
        console.warn('[api/auth/link] failed to resolve owner; continuing without owner constraint', oe)
        ownerUserId = null
      }

      const ownerEmail = (process.env.PUBLIC_PROFILE_EMAIL || '').toString().trim().toLowerCase()
      const providedEmail = (email || '').toString().trim().toLowerCase()
      if (ownerEmail) {
        if (providedEmail) {
          if (providedEmail !== ownerEmail) {
            return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
          }
        } else {
          // If email not provided, only allow if the provided userId equals ownerUserId
          if (userId !== ownerUserId) {
            return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
          }
        }
      }

      // Preserve an existing display_name when present to avoid
      // overwriting admin-updated names during auth linking.
      // Only use provided username/emailLocal when no display_name exists.
      let existingDisplayName: string | null = null
      try {
        const { data: existing, error: existingErr } = await supabaseAdmin.from('users').select('display_name').eq('id', userId).maybeSingle()
        if (!existingErr && existing && existing.display_name) existingDisplayName = existing.display_name
      } catch (ee) {
        // ignore
      }
      if (existingDisplayName) {
        row.display_name = existingDisplayName
      }

      // Use upsert to avoid duplicates
      const { data, error } = await supabaseAdmin.from('users').upsert(row, { onConflict: 'id' }).select().maybeSingle()
      if (error) {
        console.warn('[api/auth/link] upsert error', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, data }, { status: 200 })
    } catch (e) {
      console.error('[api/auth/link] exception', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

  } catch (e) {
    console.error('[api/auth/link] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
