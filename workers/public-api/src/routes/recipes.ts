import { Context } from 'hono'
import { getSupabaseAdmin } from '../lib/supabase'
import { getOwnerUserId } from '../lib/publicMode'
import { getPublicImageUrl } from '../lib/images'
import type { Env } from '../lib/types'

export async function handleRecipes(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const supabase = getSupabaseAdmin(env)
  try {
    let ownerUserId: string | null = null
    try { ownerUserId = await getOwnerUserId(env) } catch { ownerUserId = null }

    let recipesQuery = supabase.from('recipes').select('*').order('created_at', { ascending: false })
    if (ownerUserId) recipesQuery = recipesQuery.eq('user_id', ownerUserId)
    else recipesQuery = recipesQuery.eq('published', true)

    const { data: recipes, error: recipesErr } = await recipesQuery
    if (recipesErr) return c.json({ error: { code: 'db_error', message: recipesErr.message } }, 500)
    const recipeList = recipes || []
    if (recipeList.length === 0) return c.json({ data: [] })

    const recipeIds = recipeList.map((r: any) => r.id)
    let pinsList: any[] = []
    if (recipeIds.length > 0) {
      const { data: pins, error: pinsErr } = await supabase.from('recipe_pins').select('*').in('recipe_id', recipeIds)
      if (!pinsErr) pinsList = pins || []
    }

    const pinsByRecipe = new Map<string, any[]>()
    for (const p of pinsList) {
      const mapped = {
        id: p.id,
        recipeId: p.recipe_id,
        productId: p.product_id,
        userId: p.user_id,
        tagDisplayText: p.tag_display_text ?? p.tag_text ?? null,
        dotXPercent: Number(p.dot_x_percent ?? p.dot_x ?? 0),
        dotYPercent: Number(p.dot_y_percent ?? p.dot_y ?? 0),
        tagXPercent: Number(p.tag_x_percent ?? p.tag_x ?? 0),
        tagYPercent: Number(p.tag_y_percent ?? p.tag_y ?? 0),
        dotSizePercent: Number(p.dot_size_percent ?? p.dot_size ?? 0),
        tagFontSizePercent: Number(p.tag_font_size_percent ?? p.tag_font_size ?? 0),
        lineWidthPercent: Number(p.line_width_percent ?? p.line_width ?? 0),
        tagPaddingXPercent: Number(p.tag_padding_x_percent ?? p.tag_padding_x ?? 0),
        tagPaddingYPercent: Number(p.tag_padding_y_percent ?? p.tag_padding_y ?? 0),
        tagBorderRadiusPercent: Number(p.tag_border_radius_percent ?? p.tag_border_radius ?? 0),
        tagBorderWidthPercent: Number(p.tag_border_width_percent ?? p.tag_border_width ?? 0),
        dotColor: p.dot_color ?? null,
        dotShape: p.dot_shape ?? null,
        tagText: p.tag_text ?? null,
        tagFontFamily: p.tag_font_family ?? null,
        tagFontWeight: p.tag_font_weight ?? null,
        tagTextColor: p.tag_text_color ?? null,
        tagTextShadow: p.tag_text_shadow ?? null,
        tagBackgroundColor: p.tag_background_color ?? null,
        tagBackgroundOpacity: Number(p.tag_background_opacity ?? 0),
        tagBorderColor: p.tag_border_color ?? null,
        tagShadow: p.tag_shadow ?? null,
        lineType: p.line_type ?? null,
        lineColor: p.line_color ?? null,
        createdAt: p.created_at || null,
        updatedAt: p.updated_at || null,
      }
      const arr = pinsByRecipe.get(mapped.recipeId) || []
      arr.push(mapped)
      pinsByRecipe.set(mapped.recipeId, arr)
    }

    const transformed = recipeList.map((r: any) => {
      const imgsRaw = Array.isArray(r.images) ? r.images : []
      const mappedImages = imgsRaw.map((img: any) => ({
        id: img.id,
        recipeId: r.id,
        url: getPublicImageUrl(img.url, env),
        width: img.width,
        height: img.height,
      }))
      if (r.base_image_id && mappedImages.length > 1) {
        const idx = mappedImages.findIndex((mi: any) => mi.id === r.base_image_id)
        if (idx > 0) { const [base] = mappedImages.splice(idx, 1); mappedImages.unshift(base) }
      }
      const mappedPins = pinsByRecipe.get(r.id) || []
      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        published: !!r.published,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        images: mappedImages,
        imageDataUrl: r.image_data_url || (mappedImages.length > 0 ? mappedImages[0].url : null) || null,
        pins: mappedPins,
      }
    })

    return c.json({ data: transformed })
  } catch (e: any) {
    return c.json({ error: { code: 'exception', message: String(e?.message || e) } }, 500)
  }
}
