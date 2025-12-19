import type { Hono } from 'hono'
import { siteSettingsHandler } from './site-settings'
import { profileHandler } from './profile'
import { productsHandler } from './products'
import { collectionsHandler } from './collections'
import { recipesHandler } from './recipes'

export function registerPublicRoutes(app: any) {
  // All routes under /api/public/* per spec
  app.get('/api/public/site-settings', siteSettingsHandler)
  app.get('/api/public/profile', profileHandler)
  app.get('/api/public/products', productsHandler)
  app.get('/api/public/collections', collectionsHandler)
  app.get('/api/public/recipes', recipesHandler)

  // Single-resource detail routes (by id)
  app.get('/api/public/products/*', async (c: any) => {
    // delegate to products service by id via existing handler logic
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/products/', '').replace(/\/+$/, '')
    // reuse productsHandler with filter by id: call service directly
    const { fetchPublicProducts } = await import('../../services/public/products')
    const res = await fetchPublicProducts(c.env, { limit: null, offset: 0, shallow: false })
    const item = Array.isArray(res.data) ? res.data.find((p: any) => String(p.id) === String(id)) : null
    return new Response(JSON.stringify({ data: item }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  })

  app.get('/api/public/collections/*', async (c: any) => {
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/collections/', '').replace(/\/+$/, '')
    const { fetchPublicCollections } = await import('../../services/public/collections')
    const res = await fetchPublicCollections(c.env)
    const item = Array.isArray(res.data) ? res.data.find((col: any) => String(col.id) === String(id)) : null
    return new Response(JSON.stringify({ data: item }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  })

  app.get('/api/public/recipes/*', async (c: any) => {
    const path = (new URL(c.req.url)).pathname || ''
    const id = path.replace('/api/public/recipes/', '').replace(/\/+$/, '')
    const { fetchPublicRecipes } = await import('../../services/public/recipes')
    const res = await fetchPublicRecipes(c.env, { limit: null, offset: 0, shallow: false })
    const item = Array.isArray(res.data) ? res.data.find((r: any) => String(r.id) === String(id)) : null
    return new Response(JSON.stringify({ data: item }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
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
    return new Response(JSON.stringify(info), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  })
}
