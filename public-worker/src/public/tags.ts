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
      return new Response(JSON.stringify({ data: data || [] }), { status: 200, headers })
    } catch (e: any) {
      try { console.error('public/tags error', e) } catch {}
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const details = e && e.message ? e.message : JSON.stringify(e)
      return new Response(JSON.stringify({ code: 'server_error', message: 'タグ一覧取得に失敗しました', details }), { status: 500, headers })
    }
  })
}

export default registerTags
