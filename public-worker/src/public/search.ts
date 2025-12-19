import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerSearch(app: Hono<any>) {
  app.get('/api/public/search', async (c) => {
    try {
      const url = new URL(c.req.url)
      const q = (url.searchParams.get('q') || '').trim()
      const type = (url.searchParams.get('type') || '').trim()
      if (!q) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        const key = `public_search_empty`
        return await cacheJson(c, key, async () => new Response(JSON.stringify({ data: [] }), { status: 200, headers }))
      }
      const supabase = getSupabase(c.env)
      // Simple implementation: search title/description by ilike for each resource type
      const results: any = {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })

      const ownerId = await resolvePublicOwnerUser(c)
      if (!type || type === 'product') {
        const productSelect = 'id,user_id,title,slug,short_description,price,tags,created_at,updated_at,images:product_images(id,product_id,key,width,height,role,caption)'
        let qprod = supabase.from('products').select(productSelect).ilike('title', `%${q}%`).or(`short_description.ilike.%${q}%`).limit(10)
        if (ownerId) qprod = qprod.eq('user_id', ownerId)
        else qprod = qprod.eq('visibility', 'public')
        const { data } = await qprod
        results.products = data || []
      }
      if (!type || type === 'collection') {
        const collectionSelect = 'id,user_id,slug,title,short_description,visibility,created_at,updated_at'
        let qcol = supabase.from('collections').select(collectionSelect).ilike('title', `%${q}%`).or(`short_description.ilike.%${q}%`).limit(10)
        if (ownerId) qcol = qcol.eq('user_id', ownerId)
        else qcol = qcol.eq('visibility', 'public')
        const { data } = await qcol
        results.collections = data || []
      }
      if (!type || type === 'recipe') {
        const recipeSelect = 'id,user_id,title,slug,excerpt,recipe_image_keys,created_at,updated_at'
        let qrec = supabase.from('recipes').select(recipeSelect).ilike('title', `%${q}%`).or(`excerpt.ilike.%${q}%`).limit(10)
        if (ownerId) qrec = qrec.eq('user_id', ownerId)
        else qrec = qrec.eq('published', true)
        const { data } = await qrec
        results.recipes = data || []
      }

      const key = `public_search:${encodeURIComponent(q)}:${encodeURIComponent(type)}`
      return await cacheJson(c, key, async () => ({ body: { data: results }, headers }))
    } catch (e: any) {
      try { console.error('public/search error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_search:error:${encodeURIComponent(q)}:${encodeURIComponent(type)}`
      return await cacheJson(c, key, async () => ({ status: 500, body: { code: 'server_error', message: '検索に失敗しました', details }, headers }))
    }
  })
}

export default registerSearch
