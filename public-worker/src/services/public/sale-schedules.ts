import { getSupabase } from '../../supabase'
import { getPublicOwnerUserId } from '../../utils/public-owner'

/**
 * Sale schedules for the public site's "on sale" badges.
 *
 * The existing `/amazon-sale-schedules` route is admin-only — it rejects
 * unauthenticated callers — and the public site forces every request under
 * `/api/public/*`, so the badge lookup has always 404'd and no badge has ever
 * rendered. This is the read-only public counterpart, scoped to the site owner
 * exactly like every other public service.
 */
export async function fetchPublicSaleSchedules(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { data } = await supabase
      .from('amazon_sale_schedules')
      .select('id, user_id, sale_name, start_date, end_date, collection_id, created_at, updated_at')
      .eq('user_id', ownerId)
      .order('start_date', { ascending: true })

    return {
      data: (data || []).map((row: any) => ({
        id: row.id,
        saleName: row.sale_name,
        startDate: row.start_date,
        endDate: row.end_date,
        collectionId: row.collection_id,
      })),
    }
  } catch {
    return { data: [] }
  }
}
