import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import { responsiveImageForUsage, getPublicImageUrl } from '../../../shared/lib/image-usecases'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerCollections(app: Hono<any>) {
  app.get('/api/public/collections', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      const selectCols = '*'
      const ownerId = await resolvePublicOwnerUser(c)
      // mirror admin collection logic but scoped to public owner or visibility
      let query: any = supabase.from('collections').select(selectCols, { count: 'exact' }).order('order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
      if (ownerId) query = query.or(`user_id.eq.${ownerId},visibility.eq.public`)
      else query = query.eq('visibility', 'public')
      const { data, error, count } = await query.range(offset, offset + per_page - 1)
      if (error) throw error
      const total = typeof count === 'number' ? count : (data ? data.length : 0)

      if (!data || data.length === 0) {
        const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
        const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
        return new Response(JSON.stringify({ data: [], meta: total != null ? { total, limit: per_page, offset } : undefined }), { headers: merged })
      }

      const collectionIds = (data || []).map((c2: any) => c2.id)
      // collection_items
      const { data: items = [] } = await supabase.from('collection_items').select('*').in('collection_id', collectionIds)
      const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id)))

      // products join (shallow)
      let products: any[] = []
      if (productIds.length > 0) {
        const shallowSelect = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
        let prodQuery = supabase.from('products').select(shallowSelect).in('id', productIds)
        if (ownerId) prodQuery = prodQuery.or(`user_id.eq.${ownerId},visibility.eq.public`)
        else prodQuery = prodQuery.eq('visibility', 'public')
        const { data: prods = [] } = await prodQuery
        products = prods || []
      }

      const productMap = new Map<string, any>()
      for (const p of products) productMap.set(p.id, p)

      const transformed = (data || []).map((col: any) => {
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
            images: Array.isArray(p.images) ? p.images.map((img: any) => ({ id: img.id, productId: img.product_id, url: getPublicImageUrl(img.key, c.env.IMAGES_DOMAIN) || img.url || null, key: img.key ?? null, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
          })),
        }
      })

      const base = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' }
      const merged = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), base)
      return new Response(JSON.stringify({ data: transformed, meta: { total, page, per_page } }), { headers: merged })
    } catch (e: any) {
      try { console.error('public/collections list error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      return new Response(JSON.stringify({ code: 'server_error', message: 'コレクション一覧取得に失敗しました', details }), { status: 500, headers })
    }
  })

  app.get('/api/public/collections/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const supabase = getSupabase(c.env)
      const ownerId = await resolvePublicOwnerUser(c)
      let colQuery = supabase.from('collections').select('id,slug,title,description,product_ids').or(`id.eq.${id},slug.eq.${id}`)
      if (ownerId) colQuery = colQuery.eq('user_id', ownerId)
      else colQuery = colQuery.eq('visibility', 'public')
      const { data, error } = await colQuery.limit(1).maybeSingle()
      if (error) throw error
      if (!data) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ code: 'not_found', message: 'コレクションが見つかりません' }), { status: 404, headers })
      }
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      // Collections do not have a direct `image` column; expose product_ids and leave image resolution to client
      const out = Object.assign({}, data, { image_public: null })
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: out }), { status: 200, headers })
    } catch (e: any) {
      try { console.error('public/collections get error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      return new Response(JSON.stringify({ code: 'server_error', message: 'コレクション取得に失敗しました', details }), { status: 500, headers })
    }
  })
}

export default registerCollections
