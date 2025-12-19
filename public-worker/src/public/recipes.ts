import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import { responsiveImageForUsage } from '../../shared/lib/image-usecases'

export function registerRecipes(app: Hono<any>) {
  app.get('/api/public/recipes', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      const selectCols = 'id,handle,title,excerpt,images,tags,created_at'
      const { data, error, count } = await supabase.from('recipes').select(selectCols, { count: 'exact' }).eq('published', true).range(offset, offset + per_page - 1)
      if (error) throw error
      const total = typeof count === 'number' ? count : (data ? data.length : 0)
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const mapped = (data || []).map((it: any) => {
        const imgs = Array.isArray(it.images) ? it.images : []
        const images_public = imgs.map((k: any) => responsiveImageForUsage(k, 'recipe', domainOverride))
        return Object.assign({}, it, { images_public })
      })
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: mapped, meta: { page, per_page, total } }), { status: 200, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: 'レシピ一覧取得に失敗しました', details: String(e) }), { status: 500, headers })
    }
  })

  app.get('/api/public/recipes/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const supabase = getSupabase(c.env)
      const { data, error } = await supabase.from('recipes').select('id,handle,title,excerpt,content,images,tags,created_at').or(`id.eq.${id},handle.eq.${id}`).eq('published', true).limit(1).maybeSingle()
      if (error) throw error
      if (!data) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ code: 'not_found', message: 'レシピが見つかりません' }), { status: 404, headers })
      }
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const imgs = Array.isArray((data as any).images) ? (data as any).images : []
      const images_public = imgs.map((k: any) => responsiveImageForUsage(k, 'recipe', domainOverride))
      const out = Object.assign({}, data, { images_public })
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: out }), { status: 200, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: 'レシピ取得に失敗しました', details: String(e) }), { status: 500, headers })
    }
  })
}

export default registerRecipes
