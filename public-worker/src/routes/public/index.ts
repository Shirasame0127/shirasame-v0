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
  app.get('/api/public/owner-products', async (c: any) => {
    try {
      const { fetchPublicOwnerProducts } = await import('../../services/public/products')
      const res = await fetchPublicOwnerProducts(c.env)
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: res.data || [] }), { headers })
    } catch (e: any) {
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: [] }), { status: 500, headers })
    }
  })

  app.get('/api/public/owner-products/*', async (c: any) => {
    try {
      const path = (new URL(c.req.url)).pathname || ''
      const slug = path.replace('/api/public/owner-products/', '').replace(/\/+$/, '')
      const { fetchPublicOwnerProductBySlug } = await import('../../services/public/products')
      const res = await fetchPublicOwnerProductBySlug(c.env, slug)
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: res.data || null }), { headers })
    } catch (e: any) {
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: null }), { status: 500, headers })
    }
  })
  app.get('/api/public/collections', collectionsHandler)
  app.get('/api/public/recipes', recipesHandler)
  app.get('/api/public/tag-groups', tagGroupsHandler)
  app.get('/api/public/tags', tagsHandler)

  // Gallery endpoint: returns flattened image items across products
  app.get('/api/public/gallery', async (c: any) => {
    try {
      const url = new URL(c.req.url)
      const qp = Object.fromEntries(url.searchParams.entries())
      const limit = qp.limit ? Math.max(0, parseInt(String(qp.limit), 10) || 0) : 50
      const offset = qp.offset ? Math.max(0, parseInt(String(qp.offset), 10) || 0) : 0
      const q = qp.q ? String(qp.q).trim().toLowerCase() : null
      const tagsParam = qp.tags ? String(qp.tags).trim() : null
      const tags = tagsParam ? tagsParam.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : []
      const shuffle = qp.shuffle === 'true' || qp.shuffle === '1'

      const { fetchPublicProducts } = await import('../../services/public/products')
      // When shuffle or filtering is requested we need the full product set to flatten and filter client-side
      const fetchLimit = (shuffle || q || (tags && tags.length > 0)) ? null : null
      const res = await fetchPublicProducts(c.env, { limit: fetchLimit, offset: 0, shallow: false })
      const products = Array.isArray(res.data) ? res.data : []

      // Filter by q (search) and tags if provided
      const filtered = products.filter((p: any) => {
        try {
          if (q) {
            const hay = ((p.title || '') + ' ' + (p.short_description || '')).toLowerCase()
            if (!hay.includes(q)) return false
          }
          if (tags && tags.length > 0) {
            const ptags = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase()) : (typeof p.tags === 'string' ? String(p.tags).toLowerCase().split(/[,\s]+/) : [])
            // require that product contains all requested tags
            for (const t of tags) {
              if (!ptags.includes(t)) return false
            }
          }
          return true
        } catch (e) { return false }
      })

      // Flatten images
      const items: any[] = []
      for (const p of filtered) {
        try {
          const imgs = Array.isArray(p.images) ? p.images : []
          let idx = 0
          for (const img of imgs) {
            try {
              const src = img?.src || (img?.main_image?.src) || null
              if (!src) continue
              items.push({
                id: `${p.id}__${idx}`,
                productId: p.id || null,
                title: p.title || null,
                slug: p.slug || null,
                image: src,
                srcSet: img?.srcSet || null,
                aspect: img?.aspect || null,
                role: img?.role || null,
                href: p.slug ? `/products/${p.slug}` : null,
              })
              idx += 1
            } catch (e) { continue }
          }
        } catch (e) { continue }
      }

      // Optional shuffle
      if (shuffle) {
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = items[i]
          items[i] = items[j]
          items[j] = tmp
        }
      }

      const total = items.length
      const sliced = typeof limit === 'number' && limit > 0 ? items.slice(offset, offset + limit) : items.slice(offset)

      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: sliced, meta: { total, limit, offset } }), { headers })
    } catch (e: any) {
      const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ data: [], meta: null }), { status: 500, headers })
    }
  })

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
