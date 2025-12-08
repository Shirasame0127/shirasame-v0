import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { makeWeakEtag } from './utils/etag'
import { getSupabase } from './supabase'

function getPublicImageUrl(raw?: string | null, opts: { width?: number } = {}): string | null {
  if (!raw) return null
  if (typeof raw === 'string' && raw.startsWith('data:')) return raw
  const domain = (process.env.IMAGES_DOMAIN || process.env.NEXT_PUBLIC_IMAGES_DOMAIN || '').replace(/\/$/, '')
  if (!domain) return raw
  let key: any = raw
  try {
    if (typeof raw === 'string' && raw.startsWith('http')) {
      const u = new URL(raw)
      key = u.pathname.replace(/^\/+/, '')
      const cdnIndex = key.indexOf('cdn-cgi/image/')
      if (cdnIndex !== -1) {
        key = key.slice(cdnIndex + 'cdn-cgi/image/'.length)
        const firstSlash = key.indexOf('/')
        if (firstSlash !== -1) key = key.slice(firstSlash + 1)
      }
    }
  } catch (_) {}
  const width = typeof opts.width === 'number' ? opts.width : 400
  return `${domain}/cdn-cgi/image/width=${width},format=auto,quality=75/${String(key).replace(/^\/+/, '')}`
}

export type Env = {
  PUBLIC_ALLOWED_ORIGINS: string
  INTERNAL_API_BASE: string
  INTERNAL_API_KEY?: string
}

const app = new Hono<{ Bindings: Env }>()

// Debug and global error middleware: キャッチされなかった例外を詳細に返す（DEBUG_WORKER=true の場合は stack を含める）
app.use('*', async (c, next) => {
  try {
    return await next()
  } catch (e: any) {
    const body: any = { error: e?.message || String(e) }
    try {
      if ((c.env as any).DEBUG_WORKER === 'true') body.stack = e?.stack || null
    } catch {}
    return new Response(JSON.stringify(body), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  }
})

// CORS: すべてのエンドポイントで広く許可（CASE A準拠）
app.use('*', (c, next) => {
  return cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'If-None-Match', 'Authorization', 'X-Internal-Key'],
    allowMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    exposeHeaders: ['ETag'],
    maxAge: 600,
  })(c, next)
})

// Debug endpoint: 簡易的に環境やバインディングの存在を返す（本番では無効化してください）
app.get('/_debug', async (c) => {
  try {
    const bindings = {
      DEBUG_WORKER: (c.env as any).DEBUG_WORKER ?? null,
      SUPABASE_URL: !!(c.env as any).SUPABASE_URL,
      SUPABASE_ANON_KEY: !!(c.env as any).SUPABASE_ANON_KEY,
      R2_BUCKET: (c.env as any).R2_BUCKET ?? null,
      R2_PUBLIC_URL: (c.env as any).R2_PUBLIC_URL ?? null,
      hasIMAGESBinding: typeof (c.env as any).IMAGES !== 'undefined',
    }
    return new Response(JSON.stringify({ ok: true, bindings }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
  }
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

// ヘルパ: JWT のペイロードをデコードして返す（署名検証は行いません。存在確認と sub/user_id 抽出用）
function parseJwtPayload(token: string | null | undefined): any | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    // base64url -> base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // pad
    const pad = payload.length % 4
    const padded = payload + (pad === 2 ? '==' : pad === 3 ? '=' : pad === 0 ? '' : '')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch (e) {
    return null
  }
}

// トークン検証キャッシュ
const tokenUserCache = new Map<string, { id: string | null, ts: number }>()

// Supabase の auth エンドポイントを使ってトークンを検証しユーザーIDを取得する（キャッシュ付き）
async function verifyTokenWithSupabase(token: string, c: any): Promise<string | null> {
  try {
    if (!token) return null
    const now = Date.now()
    const cached = tokenUserCache.get(token)
    if (cached && (now - cached.ts) < 60_000) return cached.id

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    if (!supabaseUrl) {
      tokenUserCache.set(token, { id: null, ts: now })
      return null
    }

    const url = `${supabaseUrl}/auth/v1/user`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
    if (!res.ok) {
      tokenUserCache.set(token, { id: null, ts: now })
      return null
    }
    const json = await res.json()
    // レスポンスは { id, email, ... } 形式のはず
    const id = json?.id || json?.user?.id || json?.sub || json?.user_id || null
    tokenUserCache.set(token, { id: id || null, ts: now })
    return id || null
  } catch (e) {
    return null
  }
}

// リクエストから userId を推定する（署名検証を優先）。非同期化したため呼び出し側で await が必要。
async function getRequestUserId(c: any): Promise<string | null> {
  try {
    const auth = c.req.header('authorization') || c.req.header('Authorization') || ''
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const token = auth.slice(7).trim()
      // まず Supabase のユーザー情報エンドポイントを使って検証を試みる
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      if (viaSupabase) return viaSupabase
      // 検証できない場合はペイロードをデコードしてフォールバック
      const payload = parseJwtPayload(token)
      if (payload) return payload.sub || payload.user_id || payload.userId || null
    }

    // Supabase の cookie 名である sb-access-token をチェック
    const cookieHeader = c.req.header('cookie') || ''
    const m = cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
    if (m && m[1]) {
      const token = decodeURIComponent(m[1])
      const viaSupabase = await verifyTokenWithSupabase(token, c)
      if (viaSupabase) return viaSupabase
      const payload = parseJwtPayload(token)
      if (payload) return payload.sub || payload.user_id || payload.userId || null
    }

    return null
  } catch (e) {
    return null
  }
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
      // If authenticated, return that user's collections (all visibility). Otherwise fall back to PUBLIC_OWNER_USER_ID or only public collections.
      let collections: any[] = []
      let total: number | null = null
      const reqUserId = await getRequestUserId(c)
      // 管理ページ用途: 認証がない場合はアクセス拒否
      if (!reqUserId) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      if (limit && limit > 0) {
        if (wantCount) {
          let query = supabase.from('collections').select('*', { count: 'exact' }).order('created_at', { ascending: false })
          if (reqUserId) query = query.eq('user_id', reqUserId)
          else {
            const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
            if (ownerId) query = query.eq('user_id', ownerId)
            else query = query.eq('visibility', 'public')
          }
          const res = await query.range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
          // @ts-ignore
          total = typeof res.count === 'number' ? res.count : null
        } else {
          let query = supabase.from('collections').select('*').order('created_at', { ascending: false })
          if (reqUserId) query = query.eq('user_id', reqUserId)
          else {
            const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
            if (ownerId) query = query.eq('user_id', ownerId)
            else query = query.eq('visibility', 'public')
          }
          const res = await query.range(offset, offset + Math.max(0, limit - 1))
          collections = res.data || []
        }
      } else {
        let query = supabase.from('collections').select('*').order('created_at', { ascending: false })
        if (reqUserId) query = query.eq('user_id', reqUserId)
        else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) query = query.eq('user_id', ownerId)
          else query = query.eq('visibility', 'public')
        }
        const res = await query
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
        const shallowSelect = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
        const baseSelect = '*, images:product_images(*), affiliateLinks:affiliate_links(*)'
        // 認証情報から userId を取得して優先的に絞り込む
        const reqUserId = await getRequestUserId(c)
        let prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds).eq('published', true)
        if (reqUserId) {
          prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds).eq('user_id', reqUserId)
        } else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) prodQuery = prodQuery.eq('user_id', ownerId)
        }
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
            images: Array.isArray(p.images) ? p.images.map((img: any) => ({ id: img.id, productId: img.product_id, url: getPublicImageUrl(img.key) || img.url || null, key: img.key ?? null, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
            affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label })) : [],
          })),
        }
      })

      const meta = total != null ? { total, limit, offset } : undefined
      return new Response(JSON.stringify({ data: transformed, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } })
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
      // 管理用途: 認証必須（ログイン画面からの呼び出しを除く）
      const reqUserId = await getRequestUserId(c)
      if (!reqUserId) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      let recipesQuery = supabase.from('recipes').select('*').order('created_at', { ascending: false }).eq('user_id', reqUserId)
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
        const mappedImages = imgsRaw.map((img: any) => ({ id: img.id, recipeId: r.id, key: img.key ?? null, url: (img.key ? getPublicImageUrl(img.key) : (img.url || null)), width: img.width, height: img.height }))
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
      // If request is authenticated, return that user's tag groups. Otherwise fall back to configured PUBLIC_OWNER_USER_ID or global list.
        const reqUserId = await getRequestUserId(c)
        // 管理用途のタグ群は認証必須
        if (!reqUserId) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
        const res = await supabase.from('tag_groups').select('name, label, sort_order, created_at').eq('user_id', reqUserId).order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
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
      // If authenticated, return only that user's tags. Otherwise return global tags or PUBLIC_OWNER_USER_ID-scoped tags.
      const reqUserId = await getRequestUserId(c)
      // 管理用途のタグは認証必須
      if (!reqUserId) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      let query = supabase.from('tags').select('id, name, group, link_url, link_label, user_id, sort_order, created_at').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      query = query.eq('user_id', reqUserId)
      const res = await query
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
      // Scope schedules to authenticated user if present, otherwise PUBLIC_OWNER_USER_ID if configured
      const reqUserId = await getRequestUserId(c)
      // 管理用途のスケジュールは認証必須
      if (!reqUserId) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
      let query = supabase.from('amazon_sale_schedules').select('*').order('start_date', { ascending: true }).eq('user_id', reqUserId)
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
      const supabase = getSupabase(c.env)
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

// Admin settings endpoint (fallback when INTERNAL_API_BASE is not configured)
app.get('/api/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    if (internal) {
      const res = await fetch(internal, { method: 'GET' })
      const json = await res.json().catch(() => ({ data: {} }))
      return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    // Fallback: read from Supabase site_settings table and return as key/value map
    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const url = `${supabaseUrl}/rest/v1/site_settings?select=key,value`
    const resp = await fetch(url, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } })
    if (!resp.ok) return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    const rows = await resp.json().catch(() => [])
    const out: Record<string, any> = {}
    for (const r of Array.isArray(rows) ? rows : []) {
      try { out[r.key] = r.value } catch {}
    }
    return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

app.put('/api/admin/settings', async (c) => {
  try {
    const internal = upstream(c, '/api/admin/settings')
    const bodyText = await c.req.text()
    if (internal) {
      const res = await fetch(internal, { method: 'PUT', body: bodyText, headers: { 'Content-Type': c.req.header('content-type') || 'application/json' } })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const payload = JSON.parse(bodyText || '{}')
    // Upsert each key into site_settings via Supabase REST upsert
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(payload || {})) {
      try {
        const upUrl = `${supabaseUrl}/rest/v1/site_settings?on_conflict=key`
        const res = await fetch(upUrl, {
          method: 'POST',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) })
        })
        const j = await res.json().catch(() => null)
        if (j && Array.isArray(j) && j.length > 0) out[k] = j[0].value || null
      } catch (e) {
        // continue
      }
    }
    return new Response(JSON.stringify({ data: out }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
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
  const shallowSelect = 'id,user_id,title,slug,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'

  const key = `products${c.req.url.includes('?') ? c.req.url.substring(c.req.url.indexOf('?')) : ''}`
  return cacheJson(c, key, async () => {
    try {
      let query = supabase.from('products').select(shallow ? shallowSelect : baseSelect)
      if (id) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('id', id)
      else if (slug) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('slug', slug)
      else if (tag) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).contains('tags', [tag])
      else if (published) query = supabase.from('products').select(shallow ? shallowSelect : baseSelect).eq('published', true)

      // 単一オーナーの公開サイト前提の場合の追加絞り込み
      // Prefer authenticated user scope when available; otherwise fall back to PUBLIC_OWNER_USER_ID for single-owner sites
      const reqUserId = await getRequestUserId(c)
      if (!id && !slug) {
        if (reqUserId) {
          query = query.eq('user_id', reqUserId)
        } else {
          const ownerId = (c.env.PUBLIC_OWNER_USER_ID || '').trim()
          if (ownerId) query = query.eq('user_id', ownerId)
        }
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
          const imgUrl = firstImg && (firstImg.key || firstImg.url) ? (getPublicImageUrl(firstImg.key) || firstImg.url) : null
          const basePath = deriveBasePath(c, firstImg?.key || firstImg?.url || null)
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
                  key: img.key ?? null,
                  url: getPublicImageUrl(img.key) || img.url || null,
                  width: img.width,
                  height: img.height,
                  aspect: img.aspect,
                  role: img.role,
                  basePath: deriveBasePath(c, img.key || img.url),
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

// Admin proxy: `/admin/*` を INTERNAL_API_BASE に転送する。内部キーでの簡易認可を行う。
// 追加: Authorization: Bearer <jwt> がある場合は簡易 JWT/RBAC チェック（ダミー実装）
app.all('/admin/*', async (c) => {
  try {
    const internalBase = (c.env.INTERNAL_API_BASE || '').replace(/\/$/, '')
    if (!internalBase) return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502 })
    // シンプルなキー認証
    const provided = c.req.header('x-internal-key') || c.req.header('X-Internal-Key') || ''
    const expected = (c.env.INTERNAL_API_KEY || '').toString()
    // Validate user identity: prefer JWT/session verification, fallback to internal key.
    // Use getRequestUserId to verify token via Supabase auth endpoint or cookie. This ensures
    // a real authenticated user is present rather than only checking header existence.
    const reqUserId = await getRequestUserId(c)
    const hasValidInternalKey = !!(expected && provided && provided === expected)
    if (!reqUserId && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })

    const rest = c.req.path.replace(/^\/admin/, '') || '/'
    // クエリは upstream() で追加されるので path 部分のみを組み立て
    const upstreamUrl = internalBase + rest + (Object.keys(c.req.query() || {}).length > 0 ? ('?' + new URLSearchParams(c.req.query() as any as Record<string,string>).toString()) : '')

    const method = c.req.method
    const headers: Record<string,string> = {}
    const contentType = c.req.header('content-type')
    if (contentType) headers['content-type'] = contentType
    // Pass-through of internal key for upstream if desired
    headers['x-internal-key'] = provided
    // Forward authorization and cookie headers so upstream can perform user-scoped checks
    const authHeader = c.req.header('authorization') || c.req.header('Authorization')
    if (authHeader) headers['authorization'] = authHeader
    const cookieHeader = c.req.header('cookie')
    if (cookieHeader) headers['cookie'] = cookieHeader

    const body = (method === 'GET' || method === 'HEAD') ? undefined : await c.req.text()
    const resp = await fetch(upstreamUrl, { method, headers, body })
    const respBuf = await resp.arrayBuffer()
    const out = new Response(respBuf, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/octet-stream' } })
    return out
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
  }
})

// Also proxy `/api/admin/*` for clients that call /api/admin/... (App routes)
app.all('/api/admin/*', async (c) => {
  try {
    const internalBase = (c.env.INTERNAL_API_BASE || '').replace(/\/$/, '')
    if (!internalBase) return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502 })
    const provided = c.req.header('x-internal-key') || c.req.header('X-Internal-Key') || ''
    const expected = (c.env.INTERNAL_API_KEY || '').toString()
    const reqUserId = await getRequestUserId(c)
    const hasValidInternalKey = !!(expected && provided && provided === expected)
    if (!reqUserId && !hasValidInternalKey) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })

    const rest = c.req.path.replace(/^\/api\/admin/, '') || '/'
    const upstreamUrl = internalBase + rest + (Object.keys(c.req.query() || {}).length > 0 ? ('?' + new URLSearchParams(c.req.query() as any as Record<string,string>).toString()) : '')

    const method = c.req.method
    const headers: Record<string,string> = {}
    const contentType = c.req.header('content-type')
    if (contentType) headers['content-type'] = contentType
    headers['x-internal-key'] = provided
    const authHeader = c.req.header('authorization') || c.req.header('Authorization')
    if (authHeader) headers['authorization'] = authHeader
    const cookieHeader = c.req.header('cookie')
    if (cookieHeader) headers['cookie'] = cookieHeader

    const body = (method === 'GET' || method === 'HEAD') ? undefined : await c.req.text()
    const resp = await fetch(upstreamUrl, { method, headers, body })
    const respBuf = await resp.arrayBuffer()
    const out = new Response(respBuf, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/octet-stream' } })
    return out
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
  }
})

// Fallback: update user profile via Supabase REST when INTERNAL_API_BASE not configured
app.put('/api/admin/users/:id', async (c) => {
  try {
    const internal = upstream(c, `/api/admin/users/${c.req.param('id')}`)
    const bodyText = await c.req.text()
    if (internal) {
      const res = await fetch(internal, { method: 'PUT', body: bodyText, headers: { 'Content-Type': c.req.header('content-type') || 'application/json' } })
      const buf = await res.arrayBuffer()
      return new Response(buf, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8' } })
    }

    const supabaseUrl = (c.env.SUPABASE_URL || '').replace(/\/$/, '')
    const serviceKey = (c.env.SUPABASE_SERVICE_ROLE_KEY || '').toString()
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'internal api not configured' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

    const id = c.req.param('id')
    const payload = JSON.parse(bodyText || '{}')
    // Update profiles table by id (assuming profiles table exists with id column)
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
    const j = await res.json().catch(() => null)
    return new Response(JSON.stringify({ data: j }), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})

// CASE A: R2へ画像保存するWorkerエンドポイント
// フォーマット: images/YYYY/MM/DD/<random>-<filename>
// 返却: { ok: true, result: { key, publicUrl, size, contentType } }
async function handleUploadImage(c: any) {
  try {
    const ct = c.req.header('content-type') || ''
    if (!ct.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'multipart/form-data required' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    }
    const form = await c.req.formData()
    const file = form.get('file') as File | null
    if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })

    const buf = await file.arrayBuffer()
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rand = Math.random().toString(36).slice(2, 10)
    const safeName = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')
    const bucket = (c.env.R2_BUCKET || 'images').replace(/^\/+|\/+$/g, '')
    const key = `${bucket}/images/${yyyy}/${mm}/${dd}/${rand}-${safeName}`

    // Save to R2
    // @ts-ignore IMAGES binding from wrangler.toml
    const putRes = await c.env.IMAGES.put(key, buf, { httpMetadata: { contentType: file.type || 'application/octet-stream', cacheControl: 'public, max-age=2592000' } })
    if (!putRes) {
      return new Response(JSON.stringify({ error: 'failed to put object' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } })
    }

    // Prefer a configured custom images domain (proxied Cloudflare domain) if present.
    // Fall back to R2 public host if not provided.
    const imagesDomain = ((c.env.IMAGES_DOMAIN as string) || (c.env.R2_PUBLIC_URL as string) || '').replace(/\/$/, '')
    let publicUrl = imagesDomain ? `${imagesDomain}/${key.replace(new RegExp(`^${bucket}/`), '')}` : null
    // Normalize: strip query string and fragment to avoid accidental unique transforms
    if (publicUrl) {
      try {
        const u = new URL(publicUrl)
        u.search = ''
        u.hash = ''
        publicUrl = u.toString().replace(/\/$/, '')
      } catch (e) {
        // Fallback for non-absolute or malformed URLs: remove after ? or #
        publicUrl = publicUrl.split(/[?#]/)[0].replace(/\/$/, '')
      }
      // Ensure the publicUrl uses HTTPS when the configured domain lacks a scheme
      if (!/^https?:\/\//i.test(publicUrl)) {
        publicUrl = `https://${publicUrl}`
      }
    }

    // Provide a worker-served fallback URL so clients can use it when the
    // configured `IMAGES_DOMAIN` is not publicly accessible.
    const workerHost = ((c.env.WORKER_PUBLIC_HOST as string) || 'https://public-worker.shirasame-official.workers.dev').replace(/\/$/, '')
    const workerUrl = `${workerHost}/images/${key.replace(new RegExp(`^${bucket}/`), '')}`

    return new Response(JSON.stringify({ ok: true, result: { key, publicUrl, workerUrl, size: buf.byteLength, contentType: file.type || null } }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' }
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } })
  }
}

// Register upload handler under multiple paths for compatibility with
// different proxying conventions (`/upload-image`, `/images/upload`, `/api/images/upload`).
app.post('/upload-image', handleUploadImage)
app.post('/images/upload', handleUploadImage)
app.post('/api/images/upload', handleUploadImage)

// Cloudflare Images direct-upload presigner for admin UI
app.post('/api/images/direct-upload', async (c) => {
  try {
    const account = (c.env.CLOUDFLARE_ACCOUNT_ID || '').toString()
    const token = (c.env.CLOUDFLARE_IMAGES_API_TOKEN || '').toString()
    if (!account || !token) {
      return new Response(JSON.stringify({ ok: false, error: 'Cloudflare Images credentials not configured' }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v2/direct_upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json().catch(() => ({ ok: false }))
    return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
})
    
    // Serve images directly from R2 through this Worker as a fallback
    // This avoids depending on a custom proxied domain being configured for R2.
    app.get('/images/*', async (c) => {
      try {
        const rawPath = c.req.path.replace(/^\/+/, '') // e.g. "images/images/2025/..."
        const bucket = (c.env.R2_BUCKET || 'images').replace(/^\/+|\/+$/g, '')
  
        // Try several candidate keys depending on how the object was stored.
        const candidates = [
          rawPath,
          // If the stored key included the bucket prefix (some code does), try with and without it
          rawPath.replace(new RegExp(`^${bucket}\/`), ''),
          `${bucket}/${rawPath}`
        ]
  
        let obj: any = null
        let usedKey: string | null = null
        for (const k of candidates) {
          try {
            obj = await c.env.IMAGES.get(k, { allowIncomplete: false })
            if (obj) { usedKey = k; break }
          } catch (e) {
            // ignore and try next
          }
        }
  
        if (!obj) {
          return new Response('Not found', { status: 404 })
        }
  
        const buf = await obj.arrayBuffer()
        const contentType = (obj && obj.httpMetadata && obj.httpMetadata.contentType) ? obj.httpMetadata.contentType : 'application/octet-stream'
        const headers = new Headers({ 'Content-Type': contentType, 'Cache-Control': 'public, max-age=2592000' })
        return new Response(buf, { status: 200, headers })
      } catch (e: any) {
        return new Response(String(e?.message || e), { status: 500 })
      }
    })
