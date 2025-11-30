import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getPublicImageUrl } from '@/lib/image-url'
import crypto from 'crypto'

export async function GET(req: Request) {
  try {
    // Simple in-memory cache for public shallow listings to improve dev responsiveness.
    // Keyed by full query string; TTL is short to keep data fresh.
    const CACHE_TTL = 10 * 1000 // 10s
    // @ts-ignore - module-level cache (kept across invocations in the same process)
    if (!(global as any)._productsCache) (global as any)._productsCache = new Map()
    const productsCache: Map<string, any> = (global as any)._productsCache

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const slug = url.searchParams.get("slug")
    const tag = url.searchParams.get("tag")
    const published = url.searchParams.get("published")

    // Determine if this is a public request:
    // - explicitly asking for published=true
    // - no sb-access-token cookie
    // - OR request comes from the configured public host (e.g. `shirasame.example.com`)
    const cookieHeader = req.headers.get('cookie') || ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const host = new URL(req.url).hostname
    const PUBLIC_HOST = process.env.PUBLIC_HOST || process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
    const isHostPublic = PUBLIC_HOST ? host === PUBLIC_HOST : false
    const isPublicRequest = (published === 'true') || !hasAccessCookie || isHostPublic
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
    // shallow 用は必要最小限のカラムのみを取得（affiliateLinks を除外、images は限定列）
    const shallowSelect = `id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)`
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
    // However, when requesting a specific product by `id` or `slug` we should
    // not apply the owner filter — callers expect the exact resource they
    // asked for (e.g. modal fetches). Apply owner restriction only for list
    // style queries (no id/slug provided).
    if (isPublicRequest && ownerUserId && !id && !slug) {
      query = query.eq('user_id', ownerUserId)
    }

    const shallow = url.searchParams.get('shallow') === 'true' || url.searchParams.get('list') === 'true'
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    // allow adjusting default listing size for shallow (faster initial loads)
    let limit = limitParam ? Math.max(0, parseInt(limitParam, 10) || 0) : null
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0

    // Default to a reasonable page size for public shallow listings to avoid huge payloads
    if (shallow && (limit === null || limit === 0)) {
      limit = 24
    }

    // If limit is provided, request exact count from Supabase and apply range for pagination
    let data: any = null
    let error: any = null
    let count: number | null = null

    const cacheKey = url.pathname + url.search
    // Use cache only for public shallow listings without count (fast-read scenario)
    const useCache = shallow && isPublicRequest && !url.searchParams.get('count')
    if (useCache) {
      const cached = productsCache.get(cacheKey)
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.payload)
      }
    }

    const wantCount = url.searchParams.get('count') === 'true'
    // Measure DB query and transform timings for profiling
    const tStart = Date.now()
    if (limit && limit > 0) {
      if (wantCount) {
        // request exact count when explicitly asked — this is slower
        const res = await query.range(offset, offset + Math.max(0, (limit || 0) - 1)).select(baseSelect, { count: 'exact' })
        data = res.data || null
        error = res.error || null
        // Supabase returns count when count option is used
        // @ts-ignore
        count = typeof res.count === 'number' ? res.count : null
      } else {
        // faster path: do not ask for exact count; use range to limit results only
        // for shallow requests, avoid fetching affiliateLinks and full images
        const selectStr = shallow ? shallowSelect : baseSelect
        const res = await query.range(offset, offset + Math.max(0, (limit || 0) - 1)).select(selectStr)
        data = res.data || null
        error = res.error || null
      }
    } else {
      const selectStr = shallow ? shallowSelect : baseSelect
      const res = await query.select(selectStr)
      data = res.data || null
      error = res.error || null
    }
    const tQueryEnd = Date.now()

    if (error) {
      console.error('[api/products] GET error', error)
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
    }

    // フロントの Product 型に合わせて整形
    // When `shallow` is requested, return a lightweight shape suitable for listings.
    const tTransformStart = Date.now()
    const transformed = (data || []).map((p: any) => {
      if (shallow) {
        // For listing views avoid sending large blobs (e.g. data: URIs) or full bodies.
        const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
        // Return the canonical public image URL in shallow listings. The client
        // can choose whether to call the thumbnail proxy (`/api/images/thumbnail`)
        // or use the original URL directly. Returning the original URL here
        // avoids embedding a thumbnail-proxy URL which could be double-encoded
        // and cause recursive thumbnail calls.
        const imgUrl = firstImg && typeof firstImg.url === 'string' && !firstImg.url.startsWith('data:')
          ? getPublicImageUrl(firstImg.url) || firstImg.url
          : null

        // If a CDN base is configured and the image is hosted in R2, prefer
        // returning the CDN-hosted pre-generated thumbnail URL for listings.
        // This uses the same deterministic hash scheme as the thumbnail
        // generator so clients can obtain cached thumbnails without on-demand processing.
        let listingImageUrl: string | null = imgUrl
        try {
          const CDN_BASE = process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE || ''
          const r2Account = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT || ''
          const r2Bucket = process.env.R2_BUCKET || 'images'
          if (CDN_BASE && imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('https'))) {
            const cdnBase = CDN_BASE.replace(/\/$/, '')
            const srcForHash = imgUrl
            const hash = crypto.createHash('sha256').update(`${srcForHash}|w=400|h=0`).digest('hex')
            const thumbKey = `thumbnails/${hash}-400x0.jpg`
            listingImageUrl = `${cdnBase}/${r2Bucket}/${thumbKey}`
          }
        } catch (e) {
          // fallback to canonical imgUrl if any error
          listingImageUrl = imgUrl
        }

        return {
          id: p.id,
          userId: p.user_id,
          title: p.title,
          slug: p.slug,
          tags: p.tags,
          price: p.price,
          published: p.published,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          // include only a single canonical image url and basic image dims
          image: listingImageUrl
            ? { url: listingImageUrl, width: firstImg?.width || null, height: firstImg?.height || null, role: firstImg?.role || null }
            : null,
        }
      }

      return {
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
      }
    })
    const tTransformEnd = Date.now()

    // Log simple profiling info — visible in server logs to spot slow spots
    try {
      const qms = (tQueryEnd - tStart)
      const tms = (tTransformEnd - tTransformStart)
      console.info('[api/products] timings (ms)', { queryMs: qms, transformMs: tms, countRequested: wantCount, shallow })
    } catch {}

    const meta: any = {}
    if (typeof count === 'number') {
      meta.total = count
      meta.limit = limit || null
      meta.offset = offset || 0
    }

    const payload = { data: transformed, meta }
    if (useCache) {
      try {
        productsCache.set(cacheKey, { ts: Date.now(), payload })
      } catch {}
    }

    // For public shallow listings, allow short browser caching
    if (shallow && isPublicRequest) {
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=10' } })
    }

    return NextResponse.json(payload)
  } catch (e: any) {
    console.error('[api/products] GET exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
