import { fetchPublicTags } from '../../services/public/tags'
import { computePublicCorsHeaders } from '../../middleware/public-cors'

export async function tagsHandler(c: any) {
  try {
    const out = await fetchPublicTags(c.env)
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify(out), { headers })
  } catch (e) {
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: [] }), { headers })
  }
}
