import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/image-url'
import { getUserIdFromCookieHeader } from '@/lib/server-auth'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')
    const published = url.searchParams.get('published')

    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const isPublicRequest = published === 'true' || !hasAccessCookie

    // If logged in, try to resolve current user id and scope queries
    let currentUserId: string | null = null
    if (hasAccessCookie) {
      try {
        currentUserId = await getUserIdFromCookieHeader(cookieHeader)
      } catch (e) {
        currentUserId = null
      }
    }

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
        console.warn('[api/collections] failed to resolve owner user id for public filter', e)
      }
    }

    // collection_images はスキーマに存在しないため結合しない
    const select = `*, items:collection_items(*)`
    let query = supabaseAdmin.from('collections').select(select)
    if (id) query = supabaseAdmin.from('collections').select(select).eq('id', id)
    if (slug) query = supabaseAdmin.from('collections').select(select).eq('slug', slug)
    if (published === 'true') query = supabaseAdmin.from('collections').select(select).eq('published', true)

    // If logged in, scope to the logged-in user. Otherwise, for public
    // requests fall back to the configured owner (if present).
    if (currentUserId) {
      query = query.eq('user_id', currentUserId)
    } else if (isPublicRequest && ownerUserId && !id && !slug) {
      query = query.eq('user_id', ownerUserId)
    }

    const res = await query.order('created_at', { ascending: false })
    if (res.error) {
      console.error('[api/collections] supabase error', res.error)
      return NextResponse.json({ error: res.error.message || String(res.error) }, { status: 500 })
    }

    const collections = Array.isArray(res.data) ? res.data : []

    const transformed = collections.map((c: any) => {
      const items = Array.isArray(c.items) ? c.items : []
      return {
        id: c.id,
        userId: c.user_id,
        title: c.title,
        slug: c.slug,
        published: c.published,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        description: c.description,
        images: [],
        items,
      }
    })

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/collections] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

