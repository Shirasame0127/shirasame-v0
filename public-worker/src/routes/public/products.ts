import { fetchPublicProducts } from '../../services/public/products'
import { computePublicCorsHeaders } from '../../middleware/public-cors'

export async function productsHandler(c: any) {
  try {
    const url = new URL(c.req.url)
    const limit = url.searchParams.get('limit') ? Math.max(0, parseInt(url.searchParams.get('limit') || '0')) : null
    const offset = url.searchParams.get('offset') ? Math.max(0, parseInt(url.searchParams.get('offset') || '0')) : 0
    const shallow = url.searchParams.get('shallow') === 'true' || url.searchParams.get('list') === 'true'
    const wantCount = url.searchParams.get('count') === 'true'
    const out = await fetchPublicProducts(c.env, { limit, offset, shallow, count: wantCount })
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify(out), { headers })
  } catch (e) {
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: [] }), { headers })
  }
}