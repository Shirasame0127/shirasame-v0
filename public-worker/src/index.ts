import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { makeWeakEtag } from './utils/etag'
import { getSupabase } from './supabase'

export type Env = {
  PUBLIC_ALLOWED_ORIGINS: string
  INTERNAL_API_BASE: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS: 管理/公開の障害分離を前提に公開オリジンのみ許可
app.use('*', (c, next) => {
  const cfg = (c.env.PUBLIC_ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean)
  return cors({
    origin: (origin) => cfg.includes('*') ? '*' : (cfg.includes(origin || '') ? origin : ''),
    allowHeaders: ['Content-Type', 'If-None-Match'],
    allowMethods: ['GET', 'HEAD', 'OPTIONS'],
    exposeHeaders: ['ETag'],
    maxAge: 600,
  })(c, next)
})

// Cache/ETag ヘルパ（GET専用）
async function cacheJson(c: any, key: string, getPayload: () => Promise<Response>) {
  const cache = caches.default
  const req = new Request(new URL(key, 'http://dummy').toString())
  const ifNoneMatch = c.req.header('If-None-Match')

  const matched = await cache.match(req)
  if (matched) {
    const etag = matched.headers.get('ETag')
    if (etag && ifNoneMatch && etag === ifNoneMatch) {
      return new Response(null, { status: 304, headers: { 'ETag': etag } })
    }
    return matched
  }

  const res = await getPayload()
  // 200系のみキャッシュ対象
  if (res.ok) {
    const buf = await res.clone().arrayBuffer()
    const etag = await makeWeakEtag(buf)
    const withHeaders = new Response(buf, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'ETag': etag,
      }
    })
    await cache.
    put(req, withHeaders.clone())
    if (ifNoneMatch && etag === ifNoneMatch) {
      return new Response(null, { status: 304, headers: { 'ETag': etag } })
    }
    return withHeaders
  }
  return res
}

// zod スキーマ（共通）
const listQuery = z.object({
  shallow: z.union([z.literal('true'), z.literal('false')]).optional(),
  published: z.union([z.literal('true'), z.literal('false')]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  count: z.union([z.literal('true'), z.literal('false')]).optional(),
  tag: z.string().optional(),
  id: z.string().optional(),
  slug: z.string().optional(),
})

function upstream(c: any, path: string) {
  const base = (c.env.INTERNAL_API_BASE || '').replace(/\/$/, '')
  if (!base) return null
  const url = new URL(base + path)
  const qs = c.req.query()
  for (const [k, v] of Object.entries(qs)) {
    if (typeof v === 'string') url.searchParams.set(k, v)
  }
  return url.toString()
}

// Direct implementations for collections/profile/recipes/tag-groups/tags
// All of these use Supabase anon client (RLS assumed) and share cache/ETag behavior.

// /collections
app.get('/collections', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const q = c.req.query()
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0
  const wantCount = q.count === 'true'
  const key = `collections${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      // 1) collections
      let collections: any[] = []
      let total: number | null = null
      if (limit && limit > 0) {
        if (wantCount) {
          const res = await supabase.from('collections').select('*', { count: 'exact' }).eq('visibility', 'public').order('created_at', { ascending: false }).range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
          // @ts-ignore
          total = typeof res.count === 'number' ? res.count : null
        } else {
          const res = await supabase.from('collections').select('*').eq('visibility', 'public').order('created_at', { ascending: false }).range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
        }
      } else {
        const res = await supabase.from('collections').select('*').eq('visibility', 'public').order('created_at', { ascending: false })
        collections = res.data || []
      }

      if (!collections || collections.length === 0) return new Response(JSON.stringify({ data: [], meta: total != null ? { total, limit, offset } : undefined }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })

      const collectionIds = collections.map((c2: any) => c2.id)

      // 2) collection_items
      const { data: items = [] } = await supabase.from('collection_items').select('*').in('collection_id', collectionIds)
      const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id)))

      // 3) products
      let products: any[] = []
      if (productIds.length > 0) {
        const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
        const shallowSelect = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)'
        const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
        let prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds).eq('published', true)
        if (ownerId) prodQuery = prodQuery.eq('user_id', ownerId)
        const { data: prods = [] } = await prodQuery
        products = prods
      }

      const productMap = new Map<string, any>()
      for (const p of products) productMap.set(p.id, p)

      const transformed = collections.map((col: any) => {
        const thisItems = (items || []).filter((it: any) => it.collection_id === col.id)
        const thisProducts = thisItems.map((it: any) => productMap.get(it.product_id)).filter(Boolean)
        return {
          id: col.id,
          userId: col.user_id,
          title: col.title,
          description: col.description,
          visibility: col.visibility,
          createdAt: col.created_at,
          updatedAt: col.updated_at,
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
            images: Array.isArray(p.images) ? p.images.map((img: any) => ({ id: img.id, productId: img.product_id, url: img.url, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
            affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label })) : [],
          })),
        }
      })

      const meta = total != null ? { total, limit, offset } : undefined
      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

// /profile
app.get('/profile', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `profile`
  return cacheJson(c, key, async () => {
    try {
      const ownerEmail = (c.env.PUBLIC_PROFILE_EMAIL || '').toString() || ''
      if (!ownerEmail) return new Response(JSON.stringify({ data: null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const { data, error } = await supabase.from('users').select('*').eq('email', ownerEmail).limit(1)
      if (error) return new Response(JSON.stringify({ data: null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const user = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!user) return new Response(JSON.stringify({ data: null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const transformed = {
        id: user.id,
        name: user.name || null,
        displayName: user.display_name || user.displayName || user.name || null,
        email: user.email || null,
        avatarUrl: user.avatar_url || user.profile_image || null,
        profileImage: user.profile_image || null,
        profileImageKey: user.profile_image_key || null,
        headerImage: user.header_image || null,
        headerImages: user.header_image_keys || null,
        headerImageKey: user.header_image_key || null,
        headerImageKeys: user.header_image_keys || null,
        bio: user.bio || null,
        socialLinks: user.social_links || null,
      }
      return new Response(JSON.stringify({ data: transformed }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

// /recipes
app.get('/recipes', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `recipes${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
      let recipesQuery = supabase.from('recipes').select('*').order('created_at', { ascending: false })
      if (ownerId) recipesQuery = recipesQuery.eq('user_id', ownerId)
      else recipesQuery = recipesQuery.eq('published', true)
      const { data: recipes = [], error: recipesErr } = await recipesQuery
      if (recipesErr) return new Response(JSON.stringify({ error: recipesErr.message }), { status: 500 })
      const recipeIds = recipes.map((r: any) => r.id)
      const { data: pins = [] } = await supabase.from('recipe_pins').select('*').in('recipe_id', recipeIds)
      const pinsByRecipe = new Map<string, any[]>()
      for (const p of (pins || [])) {
        const mapped = {
          id: p.id,
          recipeId: p.recipe_id,
          productId: p.product_id,
          userId: p.user_id,
          tagDisplayText: p.tag_display_text ?? p.tag_text ?? null,
          dotXPercent: Number(p.dot_x_percent ?? p.dot_x ?? 0),
          dotYPercent: Number(p.dot_y_percent ?? p.dot_y ?? 0),
          tagXPercent: Number(p.tag_x_percent ?? p.tag_x ?? 0),
          tagYPercent: Number(p.tag_y_percent ?? p.tag_y ?? 0),
          dotSizePercent: Number(p.dot_size_percent ?? p.dot_size ?? 0),
          tagFontSizePercent: Number(p.tag_font_size_percent ?? p.tag_font_size ?? 0),
          lineWidthPercent: Number(p.line_width_percent ?? p.line_width ?? 0),
          tagPaddingXPercent: Number(p.tag_padding_x_percent ?? p.tag_padding_x ?? 0),
          tagPaddingYPercent: Number(p.tag_padding_y_percent ?? p.tag_padding_y ?? 0),
          tagBorderRadiusPercent: Number(p.tag_border_radius_percent ?? p.tag_border_radius ?? 0),
          tagBorderWidthPercent: Number(p.tag_border_width_percent ?? p.tag_border_width ?? 0),
          dotColor: p.dot_color ?? null,
          dotShape: p.dot_shape ?? null,
          tagText: p.tag_text ?? null,
          tagFontFamily: p.tag_font_family ?? null,
          tagFontWeight: p.tag_font_weight ?? null,
          tagTextColor: p.tag_text_color ?? null,
          tagTextShadow: p.tag_text_shadow ?? null,
          tagBackgroundColor: p.tag_background_color ?? null,
          tagBackgroundOpacity: Number(p.tag_background_opacity ?? 0),
          tagBorderColor: p.tag_border_color ?? null,
          tagShadow: p.tag_shadow ?? null,
          lineType: p.line_type ?? null,
          lineColor: p.line_color ?? null,
          createdAt: p.created_at || null,
          updatedAt: p.updated_at || null,
        }
        const arr = pinsByRecipe.get(mapped.recipeId) || []
        arr.push(mapped)
        pinsByRecipe.set(mapped.recipeId, arr)
      }

      const transformed = (recipes || []).map((r: any) => {
        const imgsRaw = Array.isArray(r.images) ? r.images : []
        const mappedImages = imgsRaw.map((img: any) => ({ id: img.id, recipeId: r.id, url: img.url, width: img.width, height: img.height }))
        if (r.base_image_id && mappedImages.length > 1) {
          const idx = mappedImages.findIndex((mi: any) => mi.id === r.base_image_id)
          if (idx > 0) {
            const [base] = mappedImages.splice(idx, 1)
            mappedImages.unshift(base)
          }
        }
        const mappedPins = pinsByRecipe.get(r.id) || []
        return {
          id: r.id,
          userId: r.user_id,
          title: r.title,
          published: !!r.published,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          images: mappedImages,
          imageDataUrl: r.image_data_url || (mappedImages.length > 0 ? mappedImages[0].url : null) || null,
          pins: mappedPins,
        }
      })

      return new Response(JSON.stringify({ data: transformed }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

// /tag-groups
app.get('/tag-groups', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `tag-groups`
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
      if (ownerId) {
        const res = await supabase.from('tag_groups').select('name, label, sort_order, created_at').eq('user_id', ownerId).order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
        if (res.error) {
          // fallback to global
          const fallback = await supabase.from('tag_groups').select('name, label, sort_order, created_at').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
          if (fallback.error) return new Response(JSON.stringify({ data: [] }))
          return new Response(JSON.stringify({ data: fallback.data || [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
        }
        return new Response(JSON.stringify({ data: res.data || [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      }
      const res = await supabase.from('tag_groups').select('name, label, sort_order, created_at').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
      if (res.error) return new Response(JSON.stringify({ data: [] }))
      return new Response(JSON.stringify({ data: res.data || [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }))
    }
  })
})

// /tags
app.get('/tags', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const key = `tags`
  return cacheJson(c, key, async () => {
    try {
      const res = await supabase.from('tags').select('id, name, group, link_url, link_label, user_id, sort_order, created_at').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      if (res.error) return new Response(JSON.stringify({ data: [] }))
      const mapped = (res.data || []).map((row: any) => ({ id: row.id, name: row.name, group: row.group ?? undefined, linkUrl: row.link_url ?? undefined, linkLabel: row.link_label ?? undefined, userId: row.user_id ?? undefined, sortOrder: row.sort_order ?? 0, createdAt: row.created_at }))
      return new Response(JSON.stringify({ data: mapped }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }))
    }
  })
})

// /amazon-sale-schedules
app.get('/amazon-sale-schedules', async (c) => {
  const supabase = getSupabase(c.env)
  const key = `amazon-sale-schedules`
  return cacheJson(c, key, async () => {
    try {
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
      let query = supabase.from('amazon_sale_schedules').select('*').order('start_date', { ascending: true })
      if (ownerId) query = query.eq('user_id', ownerId)
      const { data = [], error } = await query
      if (error) return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        saleName: row.sale_name,
        startDate: row.start_date,
        endDate: row.end_date,
        collectionId: row.collection_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
      return new Response(JSON.stringify({ data: mapped }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }
  })
})

// /site-settings
app.get('/site-settings', async (c) => {
  const supabase = getSupabase(c.env)
  const upstreamUrl = upstream(c, '/api/site-settings')
  const key = `site-settings`
  return cacheJson(c, key, async () => {
    try {
      // If an INTERNAL_API_BASE is configured, proxy to it (admin API)
      if (upstreamUrl) {
        const res = await fetch(upstreamUrl, { method: 'GET' })
        if (!res.ok) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
        const json = await res.json().catch(() => ({ data: {} }))
        return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      }

      // Otherwise, try to read from Supabase (anon). Return key/value map like admin API.
      const { data, error } = await supabase.from('site_settings').select('key, value').limit(100)
      if (error) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      const rows = Array.isArray(data) ? data : []
      const out: Record<string, any> = {}
      for (const r of rows) {
        try {
          if (r && typeof r.key === 'string') out[r.key] = r.value
        } catch {}
      }
      return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }
  })
})

// basePath導出（R2前提のURLやキーからディレクトリ部分を抽出）
function deriveBasePathFromUrl(urlOrKey?: string | null, env?: Env): string | null {
  if (!urlOrKey) return null
  try {
    const pub = (env?.R2_PUBLIC_URL || '').replace(/\/$/, '')
    const bucket = (env?.R2_BUCKET || '').replace(/^\/+|\/+$/g, '')
    let key = urlOrKey
    if (/^https?:\/\//i.test(urlOrKey)) {
      const u = new URL(urlOrKey)
      key = u.pathname.replace(/^\/+/, '')
    }
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
    key = key.replace(/^images\//, '')
    // remove filename
    const parts = key.split('/')
    parts.pop()
    return parts.join('/') || null
  } catch {
    return null
  }
}

// /products はSupabase anon直取得
app.get('/products', zValidator('query', listQuery.partial()), async (c) => {
  const supabase = getSupabase(c.env)
  const q = c.req.query()
  const shallow = q.shallow === 'true'
  const published = q.published === 'true'
  const limit = q.limit ? Math.max(0, parseInt(q.limit)) : null
  const offset = q.offset ? Math.max(0, parseInt(q.offset)) : 0
  const wantCount = q.count === 'true'
  const id = q.id
  const slug = q.slug
  const tag = q.tag

  const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
  const shallowSelect = 'id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,url,width,height,role)'

  const key = `products${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      let query = supabase.from('products').select(shallow ? shallowSelect : baseSelect)
      if (id) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('id', id)
      else if (slug) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('slug', slug)
      else if (tag) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).contains('tags', [tag])
      else if (published) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('published', true)

      // 単一オーナーの公開サイト前提の場合の追加絞り込み
      const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
      if (!id && !slug && ownerId) {
        query = query.eq('user_id', ownerId)
      }

      let data: any = null
      let error: any = null
      let count: number | null = null

      if (limit && limit > 0) {
        if (wantCount) {
          const res = await query.range(offset, offset + Math.max(0, limit - 1)).select(shallow ? shallowSelect : baseSelect, { count: 'exact' })
          data = res.data || null
          error = res.error || null
          // @ts-ignore
          count = typeof res.count === 'number' ? res.count : null
        } else {
          const res = await query.range(offset, offset + Math.max(0, limit - 1)).select(shallow ? shallowSelect : baseSelect)
          data = res.data || null
          error = res.error || null
        }
      } else {
        const res = await query.select(shallow ? shallowSelect : baseSelect)
        data = res.data || null
        error = res.error || null
      }

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

      const transformed = (data || []).map((p: any) => {
        if (shallow) {
          const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
          const imgUrl = firstImg && typeof firstImg.url === 'string' && !firstImg.url.startsWith('data:') ? firstImg.url : null
          const basePath = deriveBasePath(c, firstImg?.url || null)
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
            image: imgUrl ? { url: imgUrl, width: firstImg?.width || null, height: firstImg?.height || null, role: firstImg?.role || null, basePath } : null,
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
                url: img.url,
                width: img.width,
                height: img.height,
                aspect: img.aspect,
                role: img.role,
                basePath: deriveBasePath(c, img.url),
              }))
            : [],
          affiliateLinks: Array.isArray(p.affiliateLinks)
            ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label }))
            : [],
        }
      })

      const meta: Record<string, unknown> = {}
      if (typeof count === 'number') {
        meta.total = count
        meta.limit = limit || null
        meta.offset = offset || 0
      }

      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
    }
  })
})

function deriveBasePath(c: any, url?: string | null) {
  return deriveBasePathFromUrl(url || null, c.env)
}

export default app
