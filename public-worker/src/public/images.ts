import { Hono } from 'hono'
import { computeCorsHeaders } from '../middleware'

// Simple images handler: if R2_PUBLIC_URL is configured, redirect to it.
// Otherwise respond 404. Advanced resizing/ETag handling can be added later.
export function registerImages(app: Hono<any>) {
  app.get('/images/:key+', async (c) => {
    try {
      const key = c.req.param('key')
      const env = c.env as any
      const publicUrl = env.R2_PUBLIC_URL || env.IMAGES_DOMAIN || null
      if (!publicUrl) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ code: 'not_configured', message: '画像配信が設定されていません' }), { status: 404, headers })
      }
      // Ensure no leading slashes duplication
      const trimmed = key.replace(/^\/+/, '')
      const target = publicUrl.replace(/\/$/, '') + '/' + trimmed
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env))
      headers['Cache-Control'] = 'public, max-age=86400, immutable'
      return new Response(null, { status: 302, headers: Object.assign({}, headers, { Location: target }) })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: '画像配信中にエラーが発生しました', details: String(e) }), { status: 500, headers })
    }
  })
}

export default registerImages
