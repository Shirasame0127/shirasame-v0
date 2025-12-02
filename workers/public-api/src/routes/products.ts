import { Context } from 'hono'
import { productsQuerySchema } from '../lib/validator'
import { getSupabaseAdmin } from '../lib/supabase'
import { getOwnerUserId, isPublicRequest } from '../lib/publicMode'
import { getPublicImageUrl, getTransformedListingUrl } from '../lib/images'
import type { Env } from '../lib/types'

export async function handleProducts(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const req = c.req.raw
  // Cache only public + shallow listings without exact count
  const url = new URL(req.url)
  const qp = Object.fromEntries(url.searchParams.entries())
  const parsed = productsQuerySchema.safeParse(qp)
  if (!parsed.success) {
    return c.json({ error: { code: 'invalid_query', message: parsed.error.message } }, 400)
  }
  const q = parsed.data

  const shallow = q.shallow === 'true' || q.list === 'true'
  const limit = q.limit ? Math.max(0, parseInt(q.limit, 10) || 0) : null
  const offset = q.offset ? Math.max(0, parseInt(q.offset, 10) || 0) : 0
  const wantCount = q.count === 'true'

  const publicReq = isPublicRequest(req, env)
  const cacheable = shallow && publicReq && !wantCount && !q.id && !q.slug

  if (cacheable) {
    const cached = await caches.default.match(req)
    if (cached) return cached
  }

  const supabase = getSupabaseAdmin(env)

  const baseSelect = `*, images:product_images(*), affiliateLinks:affiliate_links(*)`
  const shallowSelect = `id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)`

  let query = supabase.from('products').select(baseSelect)
  if (q.id) query = supabase.from('products').select(baseSelect).eq('id', q.id)
  else if (q.slug) query = supabase.from('products').select(baseSelect).eq('slug', q.slug)
  else if (q.tag) query = supabase.from('products').select(baseSelect).contains('tags', [q.tag])
  else if (q.published === 'true') query = supabase.from('products').select(baseSelect).eq('published', true)

  // owner scope for public list queries
  if (publicReq && !q.id && !q.slug) {
    try {
      const ownerId = await getOwnerUserId(env)
      if (ownerId) query = query.eq('user_id', ownerId)
    } catch {}
  }

  let data: any[] | null = null
  let error: any = null
  let count: number | null = null

  const selectStr = shallow ? shallowSelect : baseSelect
  let effLimit = limit
  if (shallow && (effLimit === null || effLimit === 0)) effLimit = 24

  if (effLimit && effLimit > 0) {
    if (wantCount) {
      const res = await query.range(offset, offset + Math.max(0, effLimit - 1)).select(selectStr, { count: 'exact' }) as any
      data = res.data || null
      error = res.error || null
      count = typeof res.count === 'number' ? res.count : null
    } else {
      const res = await query.range(offset, offset + Math.max(0, effLimit - 1)).select(selectStr) as any
      data = res.data || null
      error = res.error || null
    }
  } else {
    const res = await query.select(selectStr) as any
    data = res.data || null
    error = res.error || null
  }

  if (error) {
    return c.json({ error: { code: 'db_error', message: String(error?.message || error) } }, 500)
  }

  const transformed = (data || []).map((p: any) => {
    if (shallow) {
      const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
      const imgCanonical = firstImg ? getPublicImageUrl(firstImg.url, env) : null
      const listingUrl = getTransformedListingUrl(imgCanonical, env)
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
        image: listingUrl
          ? { url: listingUrl, width: firstImg?.width || null, height: firstImg?.height || null, role: firstImg?.role || null }
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
            url: getPublicImageUrl(img.url, env),
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

  const payload: any = { data: transformed }
  if (typeof count === 'number') payload.meta = { total: count, limit: effLimit || null, offset }

  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  if (cacheable) headers['Cache-Control'] = 'public, max-age=10'
  // Optional ETag support for better client-side caching: based on a stable hash of response
  try {
    const etag = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
    const hex = Array.from(new Uint8Array(etag)).map(b => b.toString(16).padStart(2, '0')).join('')
    headers['ETag'] = `W/"${hex}"`
    const inm = req.headers.get('if-none-match')
    if (inm && inm === headers['ETag']) {
      return new Response(null, { status: 304 })
    }
  } catch {}

  const resp = new Response(JSON.stringify(payload), { headers })
  if (cacheable) await caches.default.put(req, resp.clone())
  return resp
}
