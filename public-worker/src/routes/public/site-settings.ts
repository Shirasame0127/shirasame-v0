import { fetchSiteSettings } from '../../services/public/site-settings'

export async function siteSettingsHandler(c: any) {
  try {
    const out = await fetchSiteSettings(c.env)
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  } catch (e) {
    return new Response(JSON.stringify({ data: {} }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
