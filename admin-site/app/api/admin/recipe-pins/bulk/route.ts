import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const recipeId: string = body.recipeId
    const pins: any[] = Array.isArray(body.pins) ? body.pins : []

    if (!recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 })

    const cookieHeader = req.headers.get('cookie') || ''
    const currentUserId = await getUserIdFromCookieHeader(cookieHeader).catch(() => null)

    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (e) {
      console.warn('[admin/recipe-pins] owner resolution failed', e)
    }

    try {
      const { data: recipeCheck } = await supabaseAdmin.from('recipes').select('id').eq('id', recipeId).limit(1)
      if (!recipeCheck || (Array.isArray(recipeCheck) && recipeCheck.length === 0)) {
        return NextResponse.json({ error: 'recipe not found' }, { status: 400 })
      }
    } catch (e) {
      console.error('[admin/recipe-pins] recipe existence check failed', e)
      return NextResponse.json({ error: 'recipe existence check failed' }, { status: 500 })
    }

    const rows = (pins || []).filter(Boolean).map((p: any) => ({
      id: p.id || `pin-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      recipe_id: recipeId,
      product_id: p.productId,
      user_id: p.userId || ownerUserId || null,
      tag_display_text: p.tagDisplayText || p.tag_display_text || null,
      dot_x_percent: p.dotXPercent ?? p.dot_x_percent ?? 0,
      dot_y_percent: p.dotYPercent ?? p.dot_y_percent ?? 0,
      tag_x_percent: p.tagXPercent ?? p.tag_x_percent ?? 0,
      tag_y_percent: p.tagYPercent ?? p.tag_y_percent ?? 0,
      dot_size_percent: p.dotSizePercent ?? p.dot_size_percent ?? 0,
      tag_font_size_percent: p.tagFontSizePercent ?? p.tag_font_size_percent ?? 0,
      line_width_percent: p.lineWidthPercent ?? p.line_width_percent ?? 0,
      tag_padding_x_percent: p.tagPaddingXPercent ?? p.tag_padding_x_percent ?? 0,
      tag_padding_y_percent: p.tagPaddingYPercent ?? p.tag_padding_y_percent ?? 0,
      tag_border_radius_percent: p.tagBorderRadiusPercent ?? p.tag_border_radius_percent ?? 0,
      tag_border_width_percent: p.tagBorderWidthPercent ?? p.tag_border_width_percent ?? 0,
      dot_color: p.dotColor ?? p.dot_color ?? null,
      dot_shape: p.dotShape ?? p.dot_shape ?? null,
      tag_text: p.tagText ?? p.tag_text ?? null,
      tag_font_family: p.tagFontFamily ?? p.tag_font_family ?? null,
      tag_font_weight: p.tagFontWeight ?? p.tag_font_weight ?? null,
      tag_text_color: p.tagTextColor ?? p.tag_text_color ?? null,
      tag_text_shadow: p.tagTextShadow ?? p.tag_text_shadow ?? null,
      tag_background_color: p.tagBackgroundColor ?? p.tag_background_color ?? null,
      tag_background_opacity: p.tagBackgroundOpacity ?? p.tag_background_opacity ?? null,
      tag_border_color: p.tagBorderColor ?? p.tag_border_color ?? null,
      tag_shadow: p.tagShadow ?? p.tag_shadow ?? null,
      line_type: p.lineType ?? p.line_type ?? null,
      line_color: p.lineColor ?? p.line_color ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    try {
      // Only delete/replace pins owned by the current user (or owner fallback)
      let deleteQuery: any = supabaseAdmin.from('recipe_pins').delete().eq('recipe_id', recipeId)
      if (currentUserId) deleteQuery = deleteQuery.eq('user_id', currentUserId)
      else if (ownerUserId) deleteQuery = deleteQuery.eq('user_id', ownerUserId)
      await deleteQuery
      if (rows.length > 0) {
        // When inserting, set user_id on each row to currentUserId or ownerUserId
        const prepared = rows.map(r => ({ ...r, user_id: r.user_id || currentUserId || ownerUserId || null }))
        const { data, error } = await supabaseAdmin.from('recipe_pins').insert(prepared).select()
        if (error) {
          console.error('[admin/recipe-pins] insert error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ ok: true, data })
      }
      return NextResponse.json({ ok: true, data: [] })
    } catch (e: any) {
      console.error('[admin/recipe-pins] bulk save error', e)
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
    }
  } catch (e: any) {
    console.error('[admin/recipe-pins] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
