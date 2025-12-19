import { getSupabase } from '../../supabase'
import { getPublicImageUrl, buildResizedImageUrl } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchSiteSettings(env: any) {
  // Return key/value map similar to admin implementation
  const supabase = getSupabase(env)
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value').limit(100)
    if (error || !Array.isArray(data)) return { data: {} }
    const out: Record<string, any> = {}
    for (const r of data) {
      try {
        if (r && typeof r.key === 'string') out[r.key] = r.value
      } catch {}
    }
    return { data: out }
  } catch (e) {
    return { data: {} }
  }
}
import { getSupabase } from '../../supabase'
import { getPublicImageUrl, buildResizedImageUrl } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchSiteSettings(env: any) {
  // Return key/value map similar to admin implementation
  const supabase = getSupabase(env)
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value').limit(100)
    if (error || !Array.isArray(data)) return { data: {} }
    const out: Record<string, any> = {}
    for (const r of data) {
      try {
        if (r && typeof r.key === 'string') out[r.key] = r.value
      } catch {}
    }
    return { data: out }
  } catch (e) {
    return { data: {} }
  }
}
