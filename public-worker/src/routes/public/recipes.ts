import { fetchPublicRecipes } from '../../services/public/recipes'

export async function recipesHandler(c: any) {
  try {
    const url = new URL(c.req.url)
    const limit = url.searchParams.get('limit') ? Math.max(0, parseInt(url.searchParams.get('limit') || '0')) : null
    const offset = url.searchParams.get('offset') ? Math.max(0, parseInt(url.searchParams.get('offset') || '0')) : 0
    const shallow = url.searchParams.get('shallow') === 'true'
    const out = await fetchPublicRecipes(c.env, { limit, offset, shallow })
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
import { fetchPublicRecipes } from '../../services/public/recipes'

export async function recipesHandler(c: any) {
  try {
    const url = new URL(c.req.url)
    const limit = url.searchParams.get('limit') ? Math.max(0, parseInt(url.searchParams.get('limit') || '0')) : null
    const offset = url.searchParams.get('offset') ? Math.max(0, parseInt(url.searchParams.get('offset') || '0')) : 0
    const shallow = url.searchParams.get('shallow') === 'true'
    const out = await fetchPublicRecipes(c.env, { limit, offset, shallow })
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
