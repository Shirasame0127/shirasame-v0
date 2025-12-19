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
        return new Response(JSON.stringify({ data: [] }), { status: 200, headers })
      }
      const supabase = getSupabase(c.env)
      // Simple implementation: search title/description by ilike for each resource type
      const results: any = {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })

      const ownerId = await resolvePublicOwnerUser(c)
      if (!type || type === 'product') {
        let qprod = supabase.from('products').select('id,handle,title,description').ilike('title', `%${q}%`).or(`description.ilike.%${q}%`).eq('published', true).limit(10)
        if (ownerId) qprod = qprod.eq('user_id', ownerId)
        const { data } = await qprod
        results.products = data || []
      }
      if (!type || type === 'collection') {
        let qcol = supabase.from('collections').select('id,handle,title,description').ilike('title', `%${q}%`).or(`description.ilike.%${q}%`).eq('published', true).limit(10)
        if (ownerId) qcol = qcol.eq('user_id', ownerId)
        const { data } = await qcol
        results.collections = data || []
      }
      if (!type || type === 'recipe') {
        let qrec = supabase.from('recipes').select('id,handle,title,excerpt').ilike('title', `%${q}%`).or(`excerpt.ilike.%${q}%`).eq('published', true).limit(10)
        if (ownerId) qrec = qrec.eq('user_id', ownerId)
        const { data } = await qrec
        results.recipes = data || []
      }

      return new Response(JSON.stringify({ data: results }), { status: 200, headers })
    } catch (e: any) {
      try { console.error('public/search error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      return new Response(JSON.stringify({ code: 'server_error', message: '検索に失敗しました', details }), { status: 500, headers })
    }
  })
}

export default registerSearch
