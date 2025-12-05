import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/image-url'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const recipeId = url.searchParams.get('recipeId')

    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    let currentUserId: string | null = null
    if (hasAccessCookie) {
      try { currentUserId = await getUserIdFromCookieHeader(cookieHeader) } catch { currentUserId = null }
    }

    let query: any = supabaseAdmin.from('recipe_pins').select('*')
    if (recipeId) query = query.eq('recipe_id', recipeId)
    if (currentUserId) query = query.eq('user_id', currentUserId)
    const { data, error } = await query
    if (error) {
      console.error('[api/recipe-pins] fetch error', error)
      const msg = String(error?.message || error)
      if (/Could not find the table/i.test(msg) || /relation "recipe_pins" does not exist/i.test(msg)) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const pins = (data || []).map((p: any) => ({
      id: p.id,
      recipeId: p.recipe_id,
      productId: p.product_id,
      userId: p.user_id,
      tagDisplayText: p.tag_display_text || null,
      dotXPercent: p.dot_x_percent,
      dotYPercent: p.dot_y_percent,
      tagXPercent: p.tag_x_percent,
      tagYPercent: p.tag_y_percent,
      dotSizePercent: p.dot_size_percent,
      tagFontSizePercent: p.tag_font_size_percent,
      lineWidthPercent: p.line_width_percent,
      tagPaddingXPercent: p.tag_padding_x_percent,
      tagPaddingYPercent: p.tag_padding_y_percent,
      tagBorderRadiusPercent: p.tag_border_radius_percent,
      tagBorderWidthPercent: p.tag_border_width_percent,
      dotColor: p.dot_color,
      dotShape: p.dot_shape,
      tagText: p.tag_text,
      tagFontFamily: p.tag_font_family,
      tagFontWeight: p.tag_font_weight,
      tagTextColor: p.tag_text_color,
      tagTextShadow: p.tag_text_shadow,
      tagBackgroundColor: p.tag_background_color,
      tagBackgroundOpacity: p.tag_background_opacity,
      tagBorderColor: p.tag_border_color,
      tagShadow: p.tag_shadow,
      lineType: p.line_type,
    }))

    return NextResponse.json(pins)
  } catch (e: any) {
    console.error('[api/recipe-pins] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
