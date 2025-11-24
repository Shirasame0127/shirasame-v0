import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

type ReqBody = {
  email: string
  displayName?: string
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({} as ReqBody))
    const email = (body?.email || '').trim().toLowerCase()
    const displayName = body?.displayName || null

    if (!email) {
      return NextResponse.json({ ok: false, error: 'email is required' }, { status: 400 })
    }

    // Only allow ensuring profile for the configured PUBLIC_PROFILE_EMAIL to enforce owner-only writes
    const ownerEmail = (process.env.PUBLIC_PROFILE_EMAIL || '').toString().trim().toLowerCase()
    if (ownerEmail && email !== ownerEmail) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })
    }

    // 1) Ensure there is a row in public.users with this email
    let userRow: any = null
    // resolve configured owner id so we can ensure created row uses that id
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.warn('[ensure-google-profile] failed to resolve owner id', oe)
    }
    try {
      const { data: existingUser } = await supabaseAdmin.from('users').select('*').eq('email', email).maybeSingle()
      if (existingUser) {
        userRow = existingUser
      } else {
        const insert: any = {
          email,
          display_name: displayName || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        if (ownerUserId) insert.id = ownerUserId
        const { data: inserted, error: insErr } = await supabaseAdmin.from('users').insert([insert]).select().maybeSingle()
        if (insErr) {
          console.warn('[ensure-google-profile] users insert error', insErr)
          return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 })
        }
        userRow = inserted
      }
    } catch (e) {
      console.error('[ensure-google-profile] users upsert exception', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }

    // 2) Do not use a separate 'profiles' table — store profile-like fields on `users` instead.
    try {
      const userId = userRow?.id || null
      if (userId && displayName) {
        // Attempt to update the users row with display_name / name if provided
        const { data: updated, error: updErr } = await supabaseAdmin.from('users').update({ display_name: displayName, name: displayName }).eq('id', userId).select().maybeSingle()
        if (updErr) {
          console.warn('[ensure-google-profile] users update display_name warning', updErr)
        }
      }
    } catch (e) {
      console.error('[ensure-google-profile] users update exception', e)
      // Non-fatal: continue — users row exists and will be returned
    }

    return NextResponse.json({ ok: true, data: { user: userRow } }, { status: 200 })
  } catch (e) {
    console.error('[ensure-google-profile] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
