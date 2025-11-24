import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/image-url'
import { getOwnerUserId } from '@/lib/owner'

export async function GET() {
  try {
    // Default to public-mode: return published recipes only and restrict to
    // the configured PUBLIC_PROFILE_EMAIL owner when present. This mirrors
    // other public endpoints in the app.
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (e) {
      // no owner configured or resolution failed — proceed in public mode without owner filter
      ownerUserId = null
    }

    // If an owner is configured/resolvable, return that owner's recipes
    // (include unpublished). Otherwise return publicly published recipes.
    let recipesQuery = supabaseAdmin.from('recipes').select('*').order('created_at', { ascending: false })
    if (ownerUserId) {
      recipesQuery = recipesQuery.eq('user_id', ownerUserId)
    } else {
      recipesQuery = recipesQuery.eq('published', true)
    }

    const { data: recipes, error: recipesErr } = await recipesQuery

    if (recipesErr) {
      console.error('[api/recipes] recipes query error', recipesErr)
      return NextResponse.json({ error: recipesErr.message }, { status: 500 })
    }

    const recipeList = recipes || []
    if (recipeList.length === 0) return NextResponse.json({ data: [] })

    const recipeIds = recipeList.map((r: any) => r.id)

    // images are stored on the recipes row under `images` jsonb

    // Fetch recipe_pins and map them
    let pinsList: any[] = []
    try {
      if (recipeIds.length > 0) {
        const { data: pins, error: pinsErr } = await supabaseAdmin
          .from('recipe_pins')
          .select('*')
          .in('recipe_id', recipeIds)

        if (pinsErr) {
          console.error('[api/recipes] recipe_pins query error', pinsErr)
        } else {
          pinsList = pins || []
        }
      } else {
        pinsList = []
      }
    } catch (pinEx) {
      console.error('[api/recipes] recipe_pins exception', pinEx)
      pinsList = []
    }

    // Normalize pins and group by recipe
    const pinsByRecipe = new Map<string, any[]>()
    for (const p of pinsList) {
      const mapped = {
        id: p.id,
        recipeId: p.recipe_id,
        productId: p.product_id,
        userId: p.user_id,
        tagDisplayText: p.tag_display_text ?? p.tag_text ?? null,
        dotXPercent: Number(p.dot_x_percent ?? p.dot_x ?? p.dot_x_percent ?? 0),
        dotYPercent: Number(p.dot_y_percent ?? p.dot_y ?? p.dot_y_percent ?? 0),
        tagXPercent: Number(p.tag_x_percent ?? p.tag_x ?? 0),
        tagYPercent: Number(p.tag_y_percent ?? p.tag_y ?? 0),
        dotSizePercent: Number(p.dot_size_percent ?? p.dot_size ?? 0),
        tagFontSizePercent: Number(p.tag_font_size_percent ?? p.tag_font_size ?? 0),
        lineWidthPercent: Number(p.line_width_percent ?? p.line_width ?? 0),
        tagPaddingXPercent: Number(p.tag_padding_x_percent ?? p.tag_padding_x ?? 0),
        tagPaddingYPercent: Number(p.tag_padding_y_percent ?? p.tag_padding_y ?? 0),
        tagBorderRadiusPercent: Number(p.tag_border_radius_percent ?? p.tag_border_radius ?? 0),
        tagBorderWidthPercent: Number(p.tag_border_width_percent ?? p.tag_border_width ?? 0),
        dotColor: p.dot_color ?? p.dotColor ?? null,
        dotShape: p.dot_shape ?? p.dotShape ?? null,
        tagText: p.tag_text ?? p.tagText ?? null,
        tagFontFamily: p.tag_font_family ?? p.tagFontFamily ?? null,
        tagFontWeight: p.tag_font_weight ?? p.tagFontWeight ?? null,
        tagTextColor: p.tag_text_color ?? p.tagTextColor ?? null,
        tagTextShadow: p.tag_text_shadow ?? p.tagTextShadow ?? null,
        tagBackgroundColor: p.tag_background_color ?? p.tagBackgroundColor ?? null,
        tagBackgroundOpacity: Number(p.tag_background_opacity ?? p.tagBackgroundOpacity ?? 0),
        tagBorderColor: p.tag_border_color ?? p.tagBorderColor ?? null,
        tagShadow: p.tag_shadow ?? p.tagShadow ?? null,
        lineType: p.line_type ?? p.lineType ?? null,
        lineColor: p.line_color ?? p.lineColor ?? null,
        createdAt: p.created_at || p.createdAt || null,
        updatedAt: p.updated_at || p.updatedAt || null,
      }

      const arr = pinsByRecipe.get(mapped.recipeId) || []
      arr.push(mapped)
      pinsByRecipe.set(mapped.recipeId, arr)
    }

    // Transform rows to frontend shape (including pins)
    const transformed = recipeList.map((r: any) => {
      const imgsRaw = Array.isArray(r.images) ? r.images : []
      const mappedImages = imgsRaw.map((img: any) => ({
        id: img.id,
        recipeId: r.id,
        url: (typeof getPublicImageUrl === 'function') ? (getPublicImageUrl(img.url) || img.url) : img.url,
        width: img.width,
        height: img.height,
      }))

      if (r.base_image_id && mappedImages.length > 1) {
        const idx = mappedImages.findIndex((mi: any) => mi.id === r.base_image_id)
        if (idx > 0) {
          const [base] = mappedImages.splice(idx, 1)
          mappedImages.unshift(base)
        }
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

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/recipes] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
