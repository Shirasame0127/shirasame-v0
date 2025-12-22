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
    // Join recipe_images and recipe_pins. Do NOT rely on recipe_image_keys.
    const selectFull = '*,images:recipe_images(id,recipe_id,key,width,height,role,caption),pins:recipe_pins(*)'

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
        // Build `images` from joined recipe_images table and normalize URLs via responsiveImageForUsage
        if (Array.isArray(rec.images)) {
          rec.images = rec.images.map((img: any) => {
            const keyRaw = img?.key || null
            // Normalize stored key/basePath to canonical basePath
            const basePath = normalizeRecipeBasePath(keyRaw, env) || null
            const resp = responsiveImageForUsage(basePath || keyRaw || null, 'recipe', env.IMAGES_DOMAIN)
            const width = typeof img.width !== 'undefined' ? img.width : null
            const height = typeof img.height !== 'undefined' ? img.height : null
            const aspect = (width && height) ? (width / height) : (img.aspect || null)
            return {
              id: img.id || null,
              recipeId: img.recipe_id || null,
              role: img.role || null,
              src: resp.src || null,
              srcSet: resp.srcSet || null,
              width: width,
              height: height,
              aspect: aspect,
              caption: img.caption || null,
            }
          })
        } else {
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