import { Hono } from 'hono'
import { computeCorsHeaders } from '../middleware'
import { getPublicImageUrl, buildResizedImageUrl } from '../../../shared/lib/image-usecases'

// Images handler: generate public image URLs using shared utilities and
// redirect to a Cloudflare-style URL when resize params are present.
export function registerImages(app: Hono<any>) {
  app.get('/images/:key+', async (c) => {
    try {
      const rawKey = c.req.param('key')
      const url = new URL(c.req.url)
      const w = url.searchParams.get('w')
      const h = url.searchParams.get('h')
      const fit = url.searchParams.get('fit')
      const format = url.searchParams.get('format')

      // Use shared helper to build canonical public URL for the key
      const domainOverride = (c.env as any).R2_PUBLIC_URL || (c.env as any).IMAGES_DOMAIN || null
      const base = getPublicImageUrl(rawKey, domainOverride)
      if (!base) {
        const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
        return new Response(JSON.stringify({ code: 'not_configured', message: '画像配信が設定されていません' }), { status: 404, headers })
      }

      // If width parameter present, produce a resized URL using helper
      let target: string | null = null
      if (w || h || fit || format) {
        const width = w ? parseInt(w) : undefined
        const fmt = format === 'webp' ? 'webp' : (format === 'jpeg' || format === 'jpg' ? 'jpeg' : 'auto')
        target = buildResizedImageUrl(base, { width, format: fmt as any }, domainOverride)
      } else {
        target = base
      }

      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env))
      headers['Cache-Control'] = 'public, max-age=86400, immutable'
      headers['Location'] = target || base
      return new Response(null, { status: 302, headers })
    } catch (e: any) {
      const headers = Object.assign({}, computeCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
      return new Response(JSON.stringify({ code: 'server_error', message: '画像配信中にエラーが発生しました', details: String(e) }), { status: 500, headers })
    }
  })
}

export default registerImages
