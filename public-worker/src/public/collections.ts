import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import { responsiveImageForUsage } from '../../../shared/lib/image-usecases'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerCollections(app: Hono<any>) {
  app.get('/api/public/collections', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      const selectCols = 'id,slug,title,description,product_ids'
      const ownerId = await resolvePublicOwnerUser(c)
      let query = supabase.from('collections').select(selectCols, { count: 'exact' }).eq('published', true)
      if (ownerId) query = query.eq('user_id', ownerId)
      const { data, error, count } = await query.range(offset, offset + per_page - 1)
      if (error) throw error
      const total = typeof count === 'number' ? count : (data ? data.length : 0)
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const mapped = (data || []).map((it: any) => {
        const img = it.image || null
        const image_public = img ? responsiveImageForUsage(img, 'list', domainOverride) : null
        return Object.assign({}, it, { image_public })
      })
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: mapped, meta: { page, per_page, total } }), { status: 200, headers })
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
      let colQuery = supabase.from('collections').select('id,slug,title,description,product_ids').or(`id.eq.${id},slug.eq.${id}`).eq('published', true)
      if (ownerId) colQuery = colQuery.eq('user_id', ownerId)
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
