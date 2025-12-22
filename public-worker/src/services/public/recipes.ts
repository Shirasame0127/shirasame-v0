import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

function deriveBasePathFromUrl(urlOrKey?: string | null, env?: any): string | null {
  if (!urlOrKey) return null
  try {
    const pub = (env?.R2_PUBLIC_URL || '').replace(/\/$/, '')
    const bucket = (env?.R2_BUCKET || '').replace(/^\/+|\/+$/g, '')
    let key = urlOrKey
    if (/^https?:\/\//i.test(urlOrKey)) {
      const u = new URL(urlOrKey)
      key = u.pathname.replace(/^\/+/, '')
    }
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
    key = key.replace(/^\/+/, '')
    key = key.replace(/\/+/, '/')
    return key || null
  } catch {
    return null
  }
}

function normalizeRecipeBasePath(raw?: string | null, env?: any): string | null {
  if (!raw) return null
  try {
    let key = deriveBasePathFromUrl(raw, env)
    if (!key) return null
    if (key.startsWith('images/')) key = key.slice('images/'.length)
    const bucket = (env?.R2_BUCKET || '').replace(/^\/+|\/+$/g, '')
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
    key = key.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
    return key || null
  } catch {
    return null
  }
}

export async function fetchPublicRecipes(env: any, params: { limit?: number | null; offset?: number; shallow?: boolean; }) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { limit = null, offset = 0, shallow = false } = params || {}
    const selectShallow = 'id,user_id,title,slug,published,created_at,updated_at'
    // Use legacy recipe_image_keys as the sole image source; still join recipe_pins for pins
    const selectFull = '*,pins:recipe_pins(*)'

    let query: any
    if (limit && limit > 0) {
      query = supabase.from('recipes').select(shallow ? selectShallow : selectFull).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false }).range(offset, offset + Math.max(0, (limit || 0) - 1))
    } else {
      query = supabase.from('recipes').select(shallow ? selectShallow : selectFull).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false })
    }

    const res = await query
    const data = res.data || []
    // Normalize images and enforce recipe_image_keys constraints (max 1)
    const out: any[] = []
    for (const r of data) {
      try {
        const rec: any = Object.assign({}, r)
        // Build `images` from legacy `recipe_image_keys` (treat as canonical basePath)
        try {
          const keys = Array.isArray(rec.recipe_image_keys) ? rec.recipe_image_keys : []
          rec.images = keys.map((k: any) => {
            const keyStr = k ? String(k) : null
            const basePath = normalizeRecipeBasePath(keyStr, env) || keyStr
            const resp = responsiveImageForUsage(basePath || null, 'recipe', env.IMAGES_DOMAIN)
            return { src: resp.src || null, srcSet: resp.srcSet || null }
          })
        } catch {
          rec.images = []
        }

        // Ensure pins are passed through as-is (joined via recipe_pins)
        if (!Array.isArray(rec.pins)) rec.pins = Array.isArray(r.pins) ? r.pins : []

        out.push(rec)
      } catch {
        // skip problematic record
      }
    }
    return { data: out }
  } catch (e) {
    return { data: [] }
  }
}