import { fetchPublicCollections } from '../../services/public/collections'

export async function collectionsHandler(c: any) {
  try {
    const out = await fetchPublicCollections(c.env)
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
