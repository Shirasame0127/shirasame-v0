import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders, cacheJson } from '../middleware'
import { responsiveImageForUsage, getPublicImageUrl } from '../../../shared/lib/image-usecases'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerProducts(app: Hono<any>) {
  app.get('/api/public/products', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      const selectCols = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
      const ownerId = await resolvePublicOwnerUser(c)
      let query = supabase.from('products').select(selectCols, { count: 'exact' })
      if (ownerId) query = query.eq('user_id', ownerId)
      else query = query.eq('published', true)
      const { data, error, count } = await query.range(offset, offset + per_page - 1)
      if (error) throw error
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const total = typeof count === 'number' ? count : (data ? data.length : 0)
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      // Map images to public URLs / srcset using shared helpers
      const mapped = (data || []).map((it: any) => {
        const imgs = Array.isArray(it.images) ? it.images : []
        const images_public = imgs.map((img: any) => getPublicImageUrl(img.key || img, domainOverride))
        return Object.assign({}, it, { images_public })
      })
      const key = `public_products_list:${page}:${per_page}:${ownerId||'public'}`
      return await cacheJson(c, key, async () => ({ data: mapped, meta: { page, per_page, total } }))
    } catch (e: any) {
      try { console.error('public/products list error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_products_list_error`
      return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'server_error', message: '商品一覧取得に失敗しました', details }), { status: 500, headers }))
    }
  })

  app.get('/api/public/products/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const supabase = getSupabase(c.env)
      const selectCols = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
      const ownerId = await resolvePublicOwnerUser(c)
      let prodQuery = supabase.from('products').select(selectCols).or(`id.eq.${id},slug.eq.${id}`)
      if (ownerId) prodQuery = prodQuery.eq('user_id', ownerId)
      else prodQuery = prodQuery.eq('published', true)
      const { data, error } = await prodQuery.limit(1).maybeSingle()
      if (error) throw error
      if (!data) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        const key = `public_product_not_found:${id}`
        return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'not_found', message: '商品が見つかりません' }), { status: 404, headers }))
      }
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const imgs = Array.isArray((data as any).images) ? (data as any).images : []
      const images_public = imgs.map((img: any) => ({ id: img.id || null, productId: img.product_id || null, url: getPublicImageUrl(img.key || img, domainOverride), key: img.key ?? null, width: img.width ?? null, height: img.height ?? null, role: img.role ?? null }))
      const out = Object.assign({}, data, { images_public, short_description: (data as any).short_description || null })
      const key = `public_product:${out.id || out.slug}`
      return await cacheJson(c, key, async () => ({ data: out }))
    } catch (e: any) {
      try { console.error('public/products get error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_product_error:${id}`
      return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'server_error', message: '商品取得に失敗しました', details }), { status: 500, headers }))
    }
  })
}

export default registerProducts
