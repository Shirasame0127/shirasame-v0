import { fetchSiteSettings } from '../../services/public/site-settings'

export async function siteSettingsHandler(c: any) {
  try {
    const out = await fetchSiteSettings(c.env)
    const headers = Object.assign({}, require('../../middleware/public-cors').computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify(out), { headers })
  } catch (e) {
    const headers = Object.assign({}, require('../../middleware/public-cors').computePublicCorsHeaders(c.req.header('Origin') || null, c.env), { 'Content-Type': 'application/json; charset=utf-8' })
    return new Response(JSON.stringify({ data: {} }), { headers })
  }
}
