import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'
import { getPublicImageUrl } from '@/lib/image-url'

function ensureImageKeyFrom(body: any): string | null {
  try {
    if (!body) return null
    if (body.key) return body.key
    const u = body.url || body.imageUrl || body.src || null
    if (!u) return null
    try {
      if (typeof u === 'string' && u.startsWith('http')) {
        const parsed = new URL(u)
        return (parsed.pathname || '').split('/').pop()?.split('?')[0] || null
      }
    } catch (e) {
      return String(u).split('/').pop()?.split('?')[0] || null
    }
    return String(u).split('/').pop()?.split('?')[0] || null
  } catch (e) {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const { recipeId, width, height, id } = body as any
    const key = ensureImageKeyFrom(body)
    if (!recipeId || !key) return NextResponse.json({ error: 'recipeId and key are required' }, { status: 400 })

    const ownerId = await getOwnerUserId().catch(() => null)

    const publicUrl = getPublicImageUrl(key)
    const url = publicUrl || null
    const row: any = {
      recipe_id: recipeId,
      key,
      url,
      width: width || null,
      height: height || null,
      uploaded_at: new Date().toISOString(),
    }

    try {
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
        let found = false
        const updated = existingImages.map((img: any) => {
          if (img.id === id) {
            found = true
            return { ...img, key: key ?? img.key ?? null, url: url, width: width || img.width, height: height || img.height }
          }
          return img
        })

        const finalImages = found ? updated : [...updated, { id, key: key ?? null, url: url, width: width || null, height: height || null, uploadedAt: new Date().toISOString() }]

        const { data, error } = await supabaseAdmin.from('recipes').update({ images: finalImages }).eq('id', recipeId).select().maybeSingle()
        if (error) {
          console.error('[admin/recipe-images/upsert] update recipe images error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ data })
      } else {
        const newId = `image-${Date.now()}`
        const insertObj = { id: newId, key: key ?? null, url, width: width || null, height: height || null, uploadedAt: new Date().toISOString() }
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
