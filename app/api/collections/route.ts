import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getPublicImageUrl } from '@/lib/image-url'
import { resolvePublicContext } from '@/lib/public-context'
import type { ApiResponse } from '@/lib/api'

export async function GET(req: Request) {
  try {
    // Determine public context (host/cookie) + owner
    const { isPublicRequest, ownerUserId } = await resolvePublicContext(req)
    const url = new URL(req.url)
    const shallow = url.searchParams.get('shallow') === 'true'
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    const wantCount = url.searchParams.get('count') === 'true'
    const limit = limitParam ? Math.max(0, parseInt(limitParam, 10) || 0) : null
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0

    // 1. 公開コレクションを取得
    let collections: any[] = []
    let colErr: any = null
    let total: number | null = null
    if (limit && limit > 0) {
      if (wantCount) {
        const res = await supabaseAdmin
          .from('collections')
          .select('*', { count: 'exact' })
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .range(offset, offset + Math.max(0, (limit || 0) - 1))
        collections = res.data || []
        colErr = res.error || null
        // @ts-ignore
        total = typeof res.count === 'number' ? res.count : null
      } else {
        const res = await supabaseAdmin
          .from('collections')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .range(offset, offset + Math.max(0, (limit || 0) - 1))
        collections = res.data || []
        colErr = res.error || null
      }
    } else {
      const res = await supabaseAdmin
        .from('collections')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
      collections = res.data || []
      colErr = res.error || null
    }

    if (colErr) {
      console.error('[api/collections] collections query error', colErr)
      return NextResponse.json({ error: colErr.message }, { status: 500 })
    }

    const collectionList = collections || []
    if (collectionList.length === 0) {
      const emptyPayload: ApiResponse<any[]> = { data: [], meta: total != null ? { total, limit, offset } : undefined }
      return NextResponse.json(emptyPayload)
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
      // Include affiliate_links unless shallow listing is requested
      const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
      const shallowSelect = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)'
      let prodQuery = supabaseAdmin
        .from('products')
        .select(shallow ? shallowSelect : baseSelect)
        .in('id', productIds)
        .eq('published', true)

      if (isPublicRequest && ownerUserId) {
        prodQuery = prodQuery.eq('user_id', ownerUserId)
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
          affiliateLinks: shallow
            ? []
            : (Array.isArray(p.affiliateLinks)
            ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label }))
            : []),
        })),
      }
    })

    const payload: ApiResponse<any[]> = { data: transformed, meta: total != null ? { total, limit, offset } : undefined }
    // Public response: allow short-term caching
    if (isPublicRequest) {
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=60' } })
    }
    return NextResponse.json(payload)
  } catch (e: any) {
    console.error('[api/collections] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
