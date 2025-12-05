import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/image-url'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')
    const tag = url.searchParams.get('tag')
    const published = url.searchParams.get('published')

    // Determine if this is a public request (no sb-access-token cookie)
    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const isPublicRequest = published === 'true' || !hasAccessCookie

    let ownerUserId: string | null = null
    if (isPublicRequest) {
      try {
        const OWNER_EMAIL = process.env.PUBLIC_PROFILE_EMAIL || ''
        if (OWNER_EMAIL) {
          const u = await supabaseAdmin.from('users').select('id').eq('email', OWNER_EMAIL).limit(1)
          const userRow = Array.isArray(u.data) && u.data.length > 0 ? u.data[0] : null
          ownerUserId = userRow?.id || null
        }
      } catch (e) {
        console.warn('[api/recipes] failed to resolve owner user id for public filter', e)
      }
    }

    // Build base query (avoid non-existent recipe_images relation)
    const baseSelect = '*'
    let query = supabaseAdmin.from('recipes').select(baseSelect)
    if (id) query = supabaseAdmin.from('recipes').select(baseSelect).eq('id', id)
    if (slug) query = supabaseAdmin.from('recipes').select(baseSelect).eq('slug', slug)
    if (tag) query = supabaseAdmin.from('recipes').select(baseSelect).contains('tags', [tag])
    if (published === 'true') query = supabaseAdmin.from('recipes').select(baseSelect).eq('published', true)

    if (isPublicRequest && ownerUserId && !id && !slug) {
      query = query.eq('user_id', ownerUserId)
    }

    const res = await query.order('created_at', { ascending: false })
    if (res.error) {
      console.error('[api/recipes] supabase error', res.error)
      return NextResponse.json({ error: res.error.message || String(res.error) }, { status: 500 })
    }

    const recipes = Array.isArray(res.data) ? res.data : []

    // Normalize pins: batch fetch pins by recipe id to avoid N+1 when pins table
    const recipeIds = recipes.map((r: any) => r.id).filter(Boolean)
    let pinsMap: Record<string, any[]> = {}
    if (recipeIds.length > 0) {
      const pinsRes = await supabaseAdmin.from('recipe_pins').select('*').in('recipe_id', recipeIds)
      if (!pinsRes.error && Array.isArray(pinsRes.data)) {
        pinsMap = pinsRes.data.reduce((acc: any, p: any) => {
          acc[p.recipe_id] = acc[p.recipe_id] || []
          acc[p.recipe_id].push(p)
          return acc
        }, {})
      }
    }

    // attach pins (images omitted as relation is not present in schema)
    const transformed = recipes.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      slug: r.slug,
      published: r.published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      tags: r.tags,
      body: r.body,
      images: [],
      pins: pinsMap[r.id] || [],
    }))

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/recipes] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

