import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { normalizePin } from '../../../../shared/normalize/normalizePin'
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
    // Fetch pins separately to avoid relying on PostgREST join alias behavior
    const recipeIds = data.map((d: any) => d?.id).filter(Boolean)
    let pinsMap: Record<string, any[]> = {}
    if (recipeIds.length > 0) {
      try {
        const pinsRes = await supabase.from('recipe_pins').select('*').in('recipe_id', recipeIds)
        const pinsData: any[] = pinsRes.data || []
        pinsMap = pinsData.reduce((acc: Record<string, any[]>, p: any) => {
          const rid = p.recipe_id || p.recipeId || null
          if (!rid) return acc
          if (!acc[rid]) acc[rid] = []
          acc[rid].push(p)
          return acc
        }, {})
      } catch {
        pinsMap = {}
      }
    }

    // Normalize images and enforce recipe_image_keys constraints (max 1)
    const out: any[] = []
    for (const r of data) {
      try {
        const rec: any = Object.assign({}, r)
        // Build `images` from legacy `recipe_image_keys` (treat as canonical basePath)
        try {
          let keys: any[] = []
          if (Array.isArray(rec.recipe_image_keys)) keys = rec.recipe_image_keys
          else if (typeof rec.recipe_image_keys === 'string') {
            try { keys = JSON.parse(rec.recipe_image_keys) } catch { keys = [] }
          }
          rec.images = keys.map((k: any) => {
            const keyStr = k ? String(k) : null
            const basePath = normalizeRecipeBasePath(keyStr, env) || keyStr
            const resp = responsiveImageForUsage(basePath || null, 'recipe', env.IMAGES_DOMAIN)
            const publicUrl = resp.src || getPublicImageUrl(basePath || keyStr || null, env.IMAGES_DOMAIN)
            const w = typeof rec.image_width !== 'undefined' && rec.image_width !== null ? rec.image_width : null
            const h = typeof rec.image_height !== 'undefined' && rec.image_height !== null ? rec.image_height : null
            return { key: keyStr, url: publicUrl || null, width: w, height: h }
          })
        } catch {
          rec.images = []
        }

        // Attach pins from the separate fetch (fallback to joined value if present)
        try {
          const fromJoin = Array.isArray(r.pins) && r.pins.length > 0 ? r.pins : (Array.isArray(pinsMap[rec.id]) ? pinsMap[rec.id] : [])
          // Transform raw DB pin rows into public-facing DTO with camelCase keys
          const transformPin = (p: any) => {
            try {
              const id = p.id != null ? String(p.id) : ''
              const productId = p.product_id ?? p.productId ?? null
              const toNumber = (v: any, fallback: number | null = null) => {
                if (v === null || typeof v === 'undefined' || v === '') return fallback
                const n = Number(v)
                return Number.isFinite(n) ? n : fallback
              }
              const dotX = toNumber(p.dot_x_percent ?? p.dot_x ?? p.dotX ?? null, 0)
              const dotY = toNumber(p.dot_y_percent ?? p.dot_y ?? p.dotY ?? null, 0)
              const tagX = toNumber(p.tag_x_percent ?? p.tag_x ?? p.tagX ?? null, null)
              const tagY = toNumber(p.tag_y_percent ?? p.tag_y ?? p.tagY ?? null, null)
              const dotSizePercent = toNumber(p.dot_size_percent ?? p.dot_size ?? p.dotSizePercent ?? 1, 1)
              return {
                id,
                productId: productId || null,
                dotX,
                dotY,
                dotSizePercent,
                tagX: tagX === null ? undefined : tagX,
                tagY: tagY === null ? undefined : tagY,
                tagText: p.tag_display_text ?? p.tag_text ?? null,
                dotColor: p.dot_color ?? null,
                tagBackgroundColor: p.tag_background_color ?? null,
              }
            } catch (e) {
              return null
            }
          }

          rec.pins = Array.isArray(fromJoin) ? fromJoin.map((p: any) => transformPin(p)).filter(Boolean) : []
        } catch {
          rec.pins = []
        }

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