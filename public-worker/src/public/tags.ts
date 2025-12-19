import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'

export function registerTags(app: Hono<any>) {
  app.get('/api/public/tags', async (c) => {
    try {
      const supabase = getSupabase(c.env)
      const { data, error } = await supabase.from('tags').select('id,name,product_count').order('name', { ascending: true })
      if (error) throw error
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: data || [] }), { status: 200, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: 'タグ一覧取得に失敗しました', details: String(e) }), { status: 500, headers })
    }
  })
}

export default registerTags
