import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const pin = body || {}
    if (!pin || !pin.recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    const row = {
      id: pin.id || `pin-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      recipe_id: pin.recipeId,
      product_id: pin.productId || null,
      user_id: currentUserId || pin.userId || null,
      tag_display_text: pin.tagDisplayText || pin.tag_display_text || null,
      dot_x_percent: pin.dotXPercent ?? pin.dot_x_percent ?? 0,
      dot_y_percent: pin.dotYPercent ?? pin.dot_y_percent ?? 0,
      tag_x_percent: pin.tagXPercent ?? pin.tag_x_percent ?? 0,
      tag_y_percent: pin.tagYPercent ?? pin.tag_y_percent ?? 0,
    }

    if (!row.user_id) {
      try {
        const owner = await getOwnerUserId()
        if (owner) row.user_id = owner
      } catch (e) {
      }
    }

    const { data, error } = await supabaseAdmin.from('recipe_pins').insert([row]).select().single()
    if (error) {
      console.error('[admin/recipe-pins] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/recipe-pins] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
