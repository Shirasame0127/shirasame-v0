import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    console.log('[api/images/complete] request body:', body)
    const url = body?.url || body?.result?.url || body?.result?.default || null
    const key = body?.key || body?.filename || body?.result?.filename || null
    const userId = body?.userId || body?.user_id || body?.userID || null
    const target = body?.target || body?.type || 'header' // 'header' or 'profile'

    if (!url) return NextResponse.json({ ok: false, error: 'url is required' }, { status: 400 })

    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'no supabase client' }, { status: 500 })

    // Insert into images table (associate with owner)
    try {
      let ownerUserId: string | null = null
      try {
        ownerUserId = await getOwnerUserId()
      } catch (oe) {
        console.error('[api/images/complete] failed to resolve owner', oe)
        return NextResponse.json({ ok: false, error: 'owner resolution failed' }, { status: 500 })
      }

      const insertObj: any = { url, user_id: ownerUserId }
      if (key) insertObj.filename = key
      insertObj.metadata = { source: 'cloudflare-direct', key }
      console.log('[api/images/complete] inserting image metadata:', insertObj)

      const { data, error } = await supabaseAdmin.from('images').insert([insertObj]).select().maybeSingle()
      console.log('[api/images/complete] supabase insert result:', { data, error })
      if (error) {
        console.warn('[api/images/complete] supabase insert error', error)
      }

      // If userId provided, update user's header or profile image
      // Always apply user image updates to the configured owner only
      try {
        const ownerUserId2 = ownerUserId
        if (ownerUserId2) {
            if (target === 'profile' || target === 'avatar') {
            // Store direct URL to profile_image and keep profile_image_key for compatibility
            const { data: upData, error: upErr } = await supabaseAdmin.from('users').update({ profile_image: url, profile_image_key: url }).eq('id', ownerUserId2).select().maybeSingle()
            console.log('[api/images/complete] updated profile field result:', { upData, upErr })
            if (upErr) console.warn('[api/images/complete] failed to update owner profile_image', upErr)
          } else {
            // Append to header_image_keys array and update header_image (single direct field) to latest
            const { data: userRow, error: selErr } = await supabaseAdmin.from('users').select('header_image_keys, header_image').eq('id', ownerUserId2).maybeSingle()
            if (selErr) {
              console.warn('[api/images/complete] failed to fetch owner for header update', selErr)
            } else {
              const existing: any[] = userRow?.header_image_keys || []
              const newArr = [...existing, url]
              const updatePayload: any = { header_image_keys: newArr, header_image: url }
              console.log('[api/images/complete] updating owner header with payload:', updatePayload)
              const { data: upData, error: upErr } = await supabaseAdmin.from('users').update(updatePayload).eq('id', ownerUserId2).select().maybeSingle()
              console.log('[api/images/complete] update header result:', { upData, upErr })
              if (upErr) console.warn('[api/images/complete] failed to update owner header_image(s)', upErr)
            }
          }
        }
      } catch (e) {
        console.error('[api/images/complete] error updating owner', e)
      }

      return NextResponse.json({ ok: true, data }, { status: 200 })
    } catch (e) {
      console.error('[api/images/complete] exception', e)
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
    }
  } catch (e) {
    console.error('[api/images/complete] outer exception', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
