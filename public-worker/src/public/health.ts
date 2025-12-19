import { Hono } from 'hono'
import { computeCorsHeaders } from '../middleware'

export function registerHealth(app: Hono<any>) {
  app.get('/api/public/health', async (c) => {
    const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ ok: true, status: 'healthy', ts: new Date().toISOString() }), { status: 200, headers })
  })
}

export default registerHealth
