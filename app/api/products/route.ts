import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getPublicImageUrl } from '@/lib/image-url'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const slug = url.searchParams.get("slug")
    const tag = url.searchParams.get("tag")
    const published = url.searchParams.get("published")

    // Determine if this is a public request: either explicitly asking for
    // published=true or the request has no sb-access-token cookie (client
    // public page). In public mode we restrict products to the site owner's
    // user id (PUBLIC_PROFILE_EMAIL) to ensure only the owner's products are shown.
    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const isPublicRequest = (published === 'true') || !hasAccessCookie
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
        console.warn('[api/products] failed to resolve owner user id for public filter', e)
      }
    }

    // ベースクエリ: products と関連する product_images と affiliate_links を取得
    const baseSelect = `*, images:product_images(*), affiliateLinks:affiliate_links(*)`
    let query = supabaseAdmin.from("products").select(baseSelect)

    if (id) {
      query = supabaseAdmin.from("products").select(baseSelect).eq("id", id)
    } else if (slug) {
      query = supabaseAdmin.from("products").select(baseSelect).eq("slug", slug)
    } else if (tag) {
      query = supabaseAdmin.from("products").select(baseSelect).contains("tags", [tag])
    } else if (published === "true") {
      query = supabaseAdmin.from("products").select(baseSelect).eq("published", true)
    }

    // If this is a public request and we resolved an owner user id, restrict
    // the query to that user's products so public pages only show the owner's data.
    if (isPublicRequest && ownerUserId) {
      query = query.eq('user_id', ownerUserId)
    }

    const { data, error } = await query
    if (error) {
      console.error('[api/products] GET error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // フロントの Product 型に合わせて整形
    const transformed = (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      title: p.title,
      slug: p.slug,
      shortDescription: p.short_description,
      body: p.body,
      tags: p.tags,
      price: p.price,
      published: p.published,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      showPrice: p.show_price,
      notes: p.notes,
      relatedLinks: p.related_links,
      images: Array.isArray(p.images)
        ? p.images.map((img: any) => ({
            id: img.id,
            productId: img.product_id,
            url: getPublicImageUrl(img.url) || img.url,
            width: img.width,
            height: img.height,
            aspect: img.aspect,
            role: img.role,
          }))
        : [],
      affiliateLinks: Array.isArray(p.affiliateLinks)
        ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label }))
        : [],
    }))

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/products] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
