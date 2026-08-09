import { fetchPublicSaleSchedules } from '../../services/public/sale-schedules'
import { computePublicCorsHeaders } from '../../middleware/public-cors'

export async function saleSchedulesHandler(c: any) {
  const headers = Object.assign(
    {},
    computePublicCorsHeaders(c.req.header('Origin') || null, c.env),
    { 'Content-Type': 'application/json; charset=utf-8' },
  )
  try {
    const out = await fetchPublicSaleSchedules(c.env)
    return new Response(JSON.stringify(out), { headers })
  } catch {
    return new Response(JSON.stringify({ data: [] }), { headers })
  }
}
