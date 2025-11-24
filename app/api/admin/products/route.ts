import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'
import { getPublicImageUrl } from '@/lib/image-url'

function mapProductPayloadToDb(payload: any) {
  // Only map fields that exist in the `products` table created by `sql/add_content_tables.sql`.
  const genId = () => (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') ? (crypto as any).randomUUID() : `prod-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  return {
    // Always generate a fresh id for newly created products to avoid client-supplied duplicate keys.
    id: genId(),
    user_id: payload.userId || payload.user_id,
    title: payload.title,
    slug: payload.slug,
    short_description: payload.shortDescription || payload.short_description,
    body: payload.body,
    tags: payload.tags,
    show_price: typeof payload.showPrice === 'boolean' ? payload.showPrice : payload.show_price,
    notes: payload.notes || payload.notes,
    related_links: Array.isArray(payload.relatedLinks) ? payload.relatedLinks : payload.related_links,
    price: payload.price,
    published: payload.published,
    created_at: payload.createdAt || new Date().toISOString(),
    updated_at: payload.updatedAt || new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        images:product_images(*),
        affiliateLinks:affiliate_links(*)
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[admin/products] fetch error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match frontend expectations (camelCase)
    const products = data?.map((p: any) => ({
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
      images: Array.isArray(p.images)
        ? p.images.map((img: any) => ({ ...img, url: getPublicImageUrl(img.url) || img.url }))
        : p.images,
      affiliateLinks: p.affiliateLinks,
      showPrice: p.show_price,
      notes: p.notes,
      relatedLinks: p.related_links,
    }))

    return NextResponse.json(products)
  } catch (e: any) {
    console.error('[admin/products] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Server-side validation: product must include at least one image
    const incomingImages = Array.isArray(body.images) ? body.images : []
    if (incomingImages.length === 0) {
      return NextResponse.json({ error: '商品画像は必須です。少なくとも1枚の画像をアップロードしてください。' }, { status: 400 })
    }

    // Extract affiliateLinks if present — they belong in `affiliate_links` table, not `products`.
    const affiliateLinks: Array<any> = Array.isArray(body.affiliateLinks) ? body.affiliateLinks : []

    const productRow = mapProductPayloadToDb(body)

    // Force the product to be owned by the configured PUBLIC_PROFILE_EMAIL owner.
    try {
      const ownerUserId = await getOwnerUserId()
      productRow.user_id = ownerUserId
    } catch (ownerErr: any) {
      console.error('[admin/products] failed to resolve owner user id', ownerErr)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    // Try insert; if slug unique constraint fails, retry with a modified slug
    let productData: any = null
    try {
      const insertRes = await supabaseAdmin.from("products").insert([productRow]).select().single()
      productData = insertRes.data
      if (insertRes.error) throw insertRes.error
    } catch (prodErr: any) {
      console.warn('[admin/products] insert product error, checking error type', prodErr)
      const msg = String(prodErr?.message || '')
      const code = (prodErr as any)?.code || ''
      // If error is unique violation, attempt slug retries
      if (code === '23505' || /duplicate key value violates unique constraint/.test(msg)) {
        // If it's a slug conflict, try appending a suffix and retry a few times
        const baseSlug = (productRow.slug || 'product').toString().slice(0, 180)
        let attempts = 0
        let succeeded = false
        while (attempts < 5 && !succeeded) {
          const attemptSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(2,6)}`
          const tryRow = { ...productRow, slug: attemptSlug }
          try {
            const r = await supabaseAdmin.from('products').insert([tryRow]).select().single()
            if (!r.error && r.data) {
              productData = r.data
              succeeded = true
              break
            }
          } catch (e) {
            // continue
          }
          attempts++
        }
        if (!succeeded) {
          console.error('[admin/products] failed to insert product after slug retries', prodErr)
          return NextResponse.json({ error: prodErr.message }, { status: 500 })
        }
      } else {
        // If the error indicates a missing column in the products table (schema mismatch),
        // attempt a fallback insert without optional columns that may not exist yet.
        const missingColumnError = code === 'PGRST204' || /Could not find the '.*' column/.test(msg)
        if (missingColumnError) {
          try {
            const fallbackRow: any = { ...productRow }
            // remove optional fields that older schemas may not have
            delete fallbackRow.related_links
            delete fallbackRow.show_price
            delete fallbackRow.notes
            const r = await supabaseAdmin.from('products').insert([fallbackRow]).select().single()
            if (r.error) throw r.error
            productData = r.data
          } catch (fallbackErr) {
            console.error('[admin/products] fallback insert failed', fallbackErr)
            return NextResponse.json({ error: String((fallbackErr as any)?.message || fallbackErr) }, { status: 500 })
          }
        } else {
          console.error('[admin/products] insert product error', prodErr)
          return NextResponse.json({ error: prodErr.message }, { status: 500 })
        }
      }
    }

    // Insert affiliate links if any
    let insertedAffiliateLinks: any[] = []
    let affiliateInsertError: any = null
    if (affiliateLinks.length > 0) {
      const rows = affiliateLinks.filter(Boolean).map((l: any) => ({ product_id: productData.id, provider: l.provider, url: l.url, label: l.label }))
      const { data: affData, error: affErr } = await supabaseAdmin.from('affiliate_links').insert(rows).select()
      if (affErr) {
        console.error('[admin/products] insert affiliate_links error', affErr)
        affiliateInsertError = affErr
      } else {
        insertedAffiliateLinks = affData || []
      }
    }

    // Insert product images (required — we already validated presence above)
    let insertedImages: any[] = []
    let imagesInsertError: any = null
    try {
      const images = incomingImages
      const imageRows = images.filter(Boolean).map((img: any, idx: number) => ({
        id: img.id || `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${idx}`,
        product_id: productData.id,
        url: img.url,
        width: img.width || null,
        height: img.height || null,
        aspect: img.aspect || null,
        role: img.role || null,
      }))
      const { data: imgData, error: imgErr } = await supabaseAdmin.from('product_images').insert(imageRows).select()
      if (imgErr) {
        console.error('[admin/products] insert product_images error', imgErr)
        imagesInsertError = imgErr
      } else {
        insertedImages = imgData || []
      }
    } catch (imgEx) {
      console.error('[admin/products] product images insertion exception', imgEx)
      imagesInsertError = imgEx
    }

    const responsePayload: any = { data: productData, affiliateLinks: insertedAffiliateLinks, productImages: (insertedImages || []).map((img: any) => ({ ...img, url: getPublicImageUrl(img.url) || img.url })) }
    const errors: any = {}
    if (affiliateInsertError) errors.affiliateLinks = affiliateInsertError?.message ?? affiliateInsertError
    if (imagesInsertError) errors.productImages = imagesInsertError?.message ?? imagesInsertError
    if (Object.keys(errors).length > 0) responsePayload.errors = errors

    // If there were partial errors, still return 200 but include error details so client can surface them.
    return NextResponse.json(responsePayload)
  } catch (e: any) {
    console.error('[admin/products] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
