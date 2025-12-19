import { Hono } from 'hono'
import { getSupabase } from '../supabase'
import { computeCorsHeaders } from '../middleware'
import { responsiveImageForUsage, getPublicImageUrl } from '../../../shared/lib/image-usecases'
import resolvePublicOwnerUser from '../helpers/getPublicOwnerUser'

export function registerRecipes(app: Hono<any>) {
  app.get('/api/public/recipes', async (c) => {
    try {
      const url = new URL(c.req.url)
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
      const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '20')))
      const offset = (page - 1) * per_page

      const supabase = getSupabase(c.env)
      // Mirror admin shallow select for recipes to avoid missing-column issues
      const selectShallow = 'id,user_id,title,slug,published,recipe_image_keys,created_at,updated_at'
      const ownerId = await resolvePublicOwnerUser(c)
      let query = supabase.from('recipes').select(selectShallow, { count: 'exact' }).eq('published', true)
      if (ownerId) query = query.eq('user_id', ownerId)
      const { data, error, count } = await query.range(offset, offset + per_page - 1)
      if (error) throw error
      const total = typeof count === 'number' ? count : (data ? data.length : 0)
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      // No images joined in shallow select; clients can request detail per-recipe.
      const mapped = (data || []).map((it: any) => ({
        id: it.id,
        userId: it.user_id,
        title: it.title,
        slug: it.slug,
        published: !!it.published,
        recipeImageKeys: Array.isArray(it.recipe_image_keys) ? it.recipe_image_keys : [],
        createdAt: it.created_at || null,
        updatedAt: it.updated_at || null,
      }))
      const key = `public_recipes:${page}:${per_page}`
      return await cacheJson(c, key, async () => ({ data: mapped, meta: { page, per_page, total } }))
    } catch (e: any) {
      try { console.error('public/recipes list error', e) } catch {}
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_recipes_error:${page}:${per_page}`
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'server_error', message: 'レシピ一覧取得に失敗しました', details }), { status: 500, headers }))
    }
  })

  app.get('/api/public/recipes/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const supabase = getSupabase(c.env)
      const ownerId = await resolvePublicOwnerUser(c)
      const selectFull = '*, images:recipe_images(id,recipe_id,key,width,height,role,caption)'
      let recQuery = supabase.from('recipes').select(selectFull).or(`id.eq.${id},slug.eq.${id}`).eq('published', true)
      if (ownerId) recQuery = recQuery.eq('user_id', ownerId)
      const { data, error } = await recQuery.limit(1).maybeSingle()
      if (error) throw error
      if (!data) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        const key = `public_recipe_not_found:${id}`
        return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'not_found', message: 'レシピが見つかりません' }), { status: 404, headers }))
      }
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const imgs = Array.isArray((data as any).images) ? (data as any).images : []
      const images_public = imgs.map((img: any) => ({ id: img.id || null, recipeId: img.recipe_id || null, url: getPublicImageUrl(img.key || img, domainOverride), key: img.key ?? null, width: img.width ?? null, height: img.height ?? null, role: img.role ?? null, caption: img.caption || null }))
      const out = Object.assign({}, data, { images_public })
      const key = `public_recipe:${id}`
      return await cacheJson(c, key, async () => ({ data: out }))
    } catch (e: any) {
      try { console.error('public/recipes get error', e) } catch {}
      const details = e && e.message ? e.message : JSON.stringify(e)
      const key = `public_recipe_error:${id}`
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return await cacheJson(c, key, async () => new Response(JSON.stringify({ code: 'server_error', message: 'レシピ取得に失敗しました', details }), { status: 500, headers }))
    }
  })
}

export default registerRecipes
