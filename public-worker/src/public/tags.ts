import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerTags(app: Hono<any>) {
  app.get('/api/public/tags', async (c) => {
    try {
      const supabase = getSupabase(c.env)
      const ownerId = await resolvePublicOwnerUser(c)
      let query = supabase.from('tags').select('id,name').order('name', { ascending: true })
      if (ownerId) query = query.eq('user_id', ownerId)
      const { data, error } = await query
      if (error) throw error
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const key = `public_tags`
      return await cacheJson(c, key, async () => ({ body: { data: data || [] }, headers }))
    } catch (e: any) {
      try { console.error('public/tags error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_tags_error`
      return await cacheJson(c, key, async () => ({ status: 500, body: { code: 'server_error', message: 'タグ一覧取得に失敗しました', details }, headers }))
    }
  })
}

export default registerTags
