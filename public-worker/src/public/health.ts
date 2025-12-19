import { Hono } from 'hono'
import { computeCorsHeaders } from '../middleware'

export function registerHealth(app: Hono<any>) {
  app.get('/api/public/health', async (c) => {
    const key = `public_health`
    return await cacheJson(c, key, async () => ({ ok: true, status: 'healthy', ts: new Date().toISOString() }))
  })
}

export default registerHealth
