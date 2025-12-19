import { fetchPublicRecipes } from '../../services/public/recipes'
import { computePublicCorsHeaders } from '../../middleware/public-cors'

export async function recipesHandler(c: any) {
  try {
    const url = new URL(c.req.url)
    const limit = url.searchParams.get('limit') ? Math.max(0, parseInt(url.searchParams.get('limit') || '0')) : null
    const offset = url.searchParams.get('offset') ? Math.max(0, parseInt(url.searchParams.get('offset') || '0')) : 0
    const shallow = url.searchParams.get('shallow') === 'true'
    const out = await fetchPublicRecipes(c.env, { limit, offset, shallow })
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify(out), { headers })
  } catch (e) {
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: [] }), { headers })
  }
}