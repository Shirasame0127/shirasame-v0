import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'

export function registerProducts(app: Hono<any>) {
  app.get('/api/public/products', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      const selectCols = 'id,handle,title,description,price,currency,slug,published,images,tags'
      const { data, error, count } = await supabase.from('products').select(selectCols, { count: 'exact' }).eq('published', true).range(offset, offset + per_page - 1)
      if (error) throw error
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      const total = typeof count === 'number' ? count : (data ? data.length : 0)
      return new Response(JSON.stringify({ data: data || [], meta: { page, per_page, total } }), { status: 200, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: '商品一覧取得に失敗しました', details: String(e) }), { status: 500, headers })
    }
  })

  app.get('/api/public/products/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const supabase = getSupabase(c.env)
      const selectCols = 'id,handle,title,description,price,currency,slug,published,images,tags'
      const { data, error } = await supabase.from('products').select(selectCols).or(`id.eq.${id},handle.eq.${id}`).eq('published', true).limit(1).maybeSingle()
      if (error) throw error
      if (!data) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ code: 'not_found', message: '商品が見つかりません' }), { status: 404, headers })
      }
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data }), { status: 200, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: '商品取得に失敗しました', details: String(e) }), { status: 500, headers })
    }
  })
}

export default registerProducts
