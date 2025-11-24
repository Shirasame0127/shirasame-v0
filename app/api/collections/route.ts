import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getPublicImageUrl } from '@/lib/image-url'

export async function GET() {
  try {
    // Determine if this is a public request (no sb-access-token cookie present).
    const cookieHeader = (globalThis as any)?.Request ? undefined : undefined
    const reqHeaders = (typeof Request !== 'undefined') ? undefined : undefined
    const cookie = ''
    const headerCookie = (globalThis as any) // fallback: read from env-less request
    let hasAccessCookie = false
    try {
      // req isn't available as a global in this context; use URL-based check below
      const rawCookie = ''
      hasAccessCookie = Boolean(rawCookie && rawCookie.includes('sb-access-token'))
    } catch (e) {
      hasAccessCookie = false
    }

    // 1. 公開コレクションを取得
    const { data: collections, error: colErr } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (colErr) {
      console.error('[api/collections] collections query error', colErr)
      return NextResponse.json({ error: colErr.message }, { status: 500 })
    }

    const collectionList = collections || []
    if (collectionList.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const collectionIds = collectionList.map((c: any) => c.id)

    // 2. collection_items から、各コレクションに紐づく product_id を取得
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('collection_items')
      .select('*')
      .in('collection_id', collectionIds)

    if (itemsErr) {
      console.error('[api/collections] collection_items query error', itemsErr)
      return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    const itemList = items || []
    const productIds = Array.from(new Set(itemList.map((it: any) => it.product_id)))

    let products: any[] = []
    if (productIds.length > 0) {
      // 3. products と product_images をまとめて取得（公開されているものだけ）
      // If this request is public (no access cookie), restrict products to the
      // site owner's user id (PUBLIC_PROFILE_EMAIL) so public collections only
      // include the owner's products.
      let prodQuery = supabaseAdmin.from('products').select('*, images:product_images(*)').in('id', productIds).eq('published', true)
      try {
        const rawCookie = ('' + (typeof globalThis !== 'undefined' && (globalThis as any).__NEXT_INIT__?.cookie || ''))
        const noCookie = true // default to public mode for this API
        if (noCookie) {
          const OWNER_EMAIL = process.env.PUBLIC_PROFILE_EMAIL || ''
          if (OWNER_EMAIL) {
            const u = await supabaseAdmin.from('users').select('id').eq('email', OWNER_EMAIL).limit(1)
            const userRow = Array.isArray(u.data) && u.data.length > 0 ? u.data[0] : null
            const ownerUserId = userRow?.id || null
            if (ownerUserId) prodQuery = prodQuery.eq('user_id', ownerUserId)
          }
        }
      } catch (e) {
        console.warn('[api/collections] owner resolve failed', e)
      }

      const { data: prods, error: prodErr } = await prodQuery

      if (prodErr) {
        console.error('[api/collections] products query error', prodErr)
      } else {
        products = prods || []
      }
    }

    // product.id -> product オブジェクトのマップ
    const productMap = new Map<string, any>()
    for (const p of products) {
      productMap.set(p.id, p)
    }

    // 4. コレクションごとに所属商品を整形
    const transformed = collectionList.map((c: any) => {
      const thisItems = itemList.filter((it: any) => it.collection_id === c.id)
      const thisProducts = thisItems
        .map((it: any) => productMap.get(it.product_id))
        .filter((p: any) => !!p)

      return {
        id: c.id,
        userId: c.user_id,
        title: c.title,
        description: c.description,
        visibility: c.visibility,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        products: thisProducts.map((p: any) => ({
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
                  url: (typeof getPublicImageUrl === 'function') ? (getPublicImageUrl(img.url) || img.url) : img.url,
                  width: img.width,
                  height: img.height,
                  aspect: img.aspect,
                  role: img.role,
                }))
            : [],
        })),
      }
    })

    return NextResponse.json({ data: transformed })
  } catch (e: any) {
    console.error('[api/collections] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
