import { fetchPublicProfile } from '../../services/public/profile'
import { computePublicCorsHeaders } from '../../middleware/public-cors'

export async function profileHandler(c: any) {
  try {
    const out = await fetchPublicProfile(c.env)
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    let body: string
    if (typeof out === 'undefined' || out === null) {
      console.error('profileHandler: fetchPublicProfile returned undefined or null', { ownerId: c.env && c.env.PUBLIC_OWNER_USER_ID })
      body = JSON.stringify({ data: null })
    } else {
      try {
        body = JSON.stringify(out)
      } catch (e) {
        console.error('profileHandler: JSON.stringify error', { error: e })
        body = JSON.stringify({ data: null })
      }
    }
    return new Response(body, { headers })
  } catch (e) {
    const headers = Object.assign({}, computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: null }), { headers })
  }
}