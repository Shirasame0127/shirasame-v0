import { fetchPublicProfile } from '../../services/public/profile'

export async function profileHandler(c: any) {
  try {
    const out = await fetchPublicProfile(c.env)
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
import { fetchPublicProfile } from '../../services/public/profile'

export async function profileHandler(c: any) {
  try {
    const out = await fetchPublicProfile(c.env)
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: null }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
