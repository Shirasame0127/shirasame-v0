import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
// getOwnerUserId is optional; if project doesn't have it, linking still attempts to proceed
async function getOwnerUserIdFallback(): Promise<string | null> {
  try {
    const ownerEmail = (process.env.PUBLIC_PROFILE_EMAIL || '').toString().trim().toLowerCase()
    if (!ownerEmail) return null
    const { data } = await supabaseAdmin.from('users').select('id').eq('email', ownerEmail).limit(1).maybeSingle()
    return data?.id || null
  } catch { return null }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const userId = body?.userId
    const email = body?.email || null
    const username = body?.username || null

    if (!userId) return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 })
    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    try {
      const emailLocal = email ? String(email).split('@')[0] : null
      const row = {
        id: userId,
        email,
        display_name: username || emailLocal || null,
        updated_at: new Date().toISOString(),
      }

      let ownerUserId: string | null = null
      try { ownerUserId = await getOwnerUserIdFallback() } catch (oe) { console.warn('[api/auth/link] owner resolve failed', oe); ownerUserId = null }

      const ownerEmail = (process.env.PUBLIC_PROFILE_EMAIL || '').toString().trim().toLowerCase()
      const providedEmail = (email || '').toString().trim().toLowerCase()
      if (ownerEmail) {
        if (providedEmail) {
          if (providedEmail !== ownerEmail) {
            return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
          }
        } else {
          if (userId !== ownerUserId) {
            return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
          }
        }
      }

      let existingDisplayName: string | null = null
      try {
        const { data: existing, error: existingErr } = await supabaseAdmin.from('users').select('display_name').eq('id', userId).maybeSingle()
        if (!existingErr && existing && existing.display_name) existingDisplayName = existing.display_name
      } catch (ee) {}
      if (existingDisplayName) row.display_name = existingDisplayName

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
