import type { Hono } from 'hono'
import { computePublicCorsHeaders } from '../../middleware/public-cors'
import { siteSettingsHandler } from './site-settings'
import { profileHandler } from './profile'
import { productsHandler } from './products'
import { collectionsHandler } from './collections'
import { recipesHandler } from './recipes'
import { tagGroupsHandler } from './tag-groups'
import { tagsHandler } from './tags'
import { getSupabase } from '../../supabase'

export function registerPublicRoutes(app: any) {
  // All routes under /api/public/* per spec
  app.get('/api/public/site-settings', siteSettingsHandler)
  app.get('/api/public/profile', profileHandler)
  app.get('/api/public/products', productsHandler)
  app.get('/api/public/collections', collectionsHandler)
  app.get('/api/public/recipes', recipesHandler)
  app.get('/api/public/tag-groups', tagGroupsHandler)
  app.get('/api/public/tags', tagsHandler)

  // Single-resource detail routes (by id)
  app.get('/api/public/products/*', async (c: any) => {
    // delegate to products service by id via existing handler logic
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/products/', '').replace(/\/+$/, '')
    // reuse productsHandler with filter by id: call service directly
    const { fetchPublicProducts } = await import('../../services/public/products')
    const res = await fetchPublicProducts(c.env, { limit: null, offset: 0, shallow: false })
    const item = Array.isArray(res.data) ? res.data.find((p: any) => String(p.id) === String(id)) : null
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: item }), { headers })
  })

  app.get('/api/public/collections/*', async (c: any) => {
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/collections/', '').replace(/\/+$/, '')
    const { fetchPublicCollections } = await import('../../services/public/collections')
    const res = await fetchPublicCollections(c.env)
    const item = Array.isArray(res.data) ? res.data.find((col: any) => String(col.id) === String(id)) : null
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: item }), { headers })
  })

  app.get('/api/public/recipes/*', async (c: any) => {
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/recipes/', '').replace(/\/+$/, '')
    const { fetchPublicRecipes } = await import('../../services/public/recipes')
    const res = await fetchPublicRecipes(c.env, { limit: null, offset: 0, shallow: false })
    const item = Array.isArray(res.data) ? res.data.find((r: any) => String(r.id) === String(id)) : null
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: item }), { headers })
  })

  // Simple CORS test endpoint to validate middleware behavior
  app.get('/api/public/_cors-test', async (c: any) => {
    const info = {
      ok: true,
      timestamp: new Date().toISOString(),
      env: {
        PUBLIC_ALLOWED_ORIGINS: (c.env && (c.env as any).PUBLIC_ALLOWED_ORIGINS) || null,
        WORKER_PUBLIC_HOST: (c.env && (c.env as any).WORKER_PUBLIC_HOST) || null
      }
    }
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify(info), { headers })
  })

  // Debug: expose collections + items counts to help diagnose empty responses
  app.get('/api/public/_collections-debug', async (c: any) => {
    try {
      const supabase = getSupabase(c.env)
      const ownerId = (c.env && c.env.PUBLIC_OWNER_USER_ID) ? String(c.env.PUBLIC_OWNER_USER_ID).trim() : null
      let collections: any[] = []
      if (ownerId) {
        const { data } = await supabase.from('collections').select('*').eq('user_id', ownerId).order('sort_order', { ascending: true })
        collections = Array.isArray(data) ? data : []
      } else {
        const { data } = await supabase.from('collections').select('*').eq('visibility', 'public').order('sort_order', { ascending: true })
        collections = Array.isArray(data) ? data : []
      }
      const ids = collections.map((r: any) => r.id).filter(Boolean)
      let items: any[] = []
      if (ids.length > 0) {
        const res = await supabase.from('collection_items').select('*').in('collection_id', ids)
        items = Array.isArray(res.data) ? res.data : []
      }
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ ownerId, collectionsCount: collections.length, itemsCount: items.length, collections, items }), { headers })
    } catch (e: any) {
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers })
    }
  })
}
