import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const { recipeId, url, width, height, id } = body as any
    if (!recipeId || !url) return NextResponse.json({ error: 'recipeId and url are required' }, { status: 400 })

    const ownerId = await getOwnerUserId().catch(() => null)

    // Prepare row
    const row: any = {
      recipe_id: recipeId,
      url,
      width: width || null,
      height: height || null,
      uploaded_at: new Date().toISOString(),
    }

    try {
      // This endpoint previously wrote into `recipe_images` table. We now keep
      // images on the `recipes.images` jsonb column. Implement an upsert that
      // reads the current images array, updates or appends, and writes back.
      const { data: recipeRow, error: fetchErr } = await supabaseAdmin
        .from('recipes')
        .select('images')
        .eq('id', recipeId)
        .maybeSingle()

      if (fetchErr) {
        console.error('[admin/recipe-images/upsert] fetch recipe images error', fetchErr)
        return NextResponse.json({ error: fetchErr.message }, { status: 500 })
      }

      const existingImages = Array.isArray((recipeRow as any)?.images) ? (recipeRow as any).images : []

      if (id) {
        // update existing image entry if present
        let found = false
        const updated = existingImages.map((img: any) => {
          if (img.id === id) {
            found = true
            return { ...img, url, width: width || img.width, height: height || img.height }
          }
          return img
        })

        // if not found, append as new
        const finalImages = found ? updated : [...updated, { id, url, width: width || null, height: height || null, uploadedAt: new Date().toISOString() }]

        const { data, error } = await supabaseAdmin.from('recipes').update({ images: finalImages }).eq('id', recipeId).select().maybeSingle()
        if (error) {
          console.error('[admin/recipe-images/upsert] update recipe images error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ data })
      } else {
        // create new image entry with generated id
        const newId = `image-${Date.now()}`
        const insertObj = { id: newId, url, width: width || null, height: height || null, uploadedAt: new Date().toISOString() }
        const finalImages = [insertObj, ...existingImages]

        const { data, error } = await supabaseAdmin.from('recipes').update({ images: finalImages }).eq('id', recipeId).select().maybeSingle()
        if (error) {
          console.error('[admin/recipe-images/upsert] insert recipe images error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ data })
      }
    } catch (e: any) {
      console.error('[admin/recipe-images/upsert] exception', e)
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
    }
  } catch (e: any) {
    console.error('[admin/recipe-images/upsert] outer exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
