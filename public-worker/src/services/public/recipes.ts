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
          const ridRaw = p.recipe_id ?? p.recipeId ?? null
          if (!ridRaw) return acc
          const rid = String(ridRaw)
          if (!acc[rid]) acc[rid] = []
          acc[rid].push(p)
          return acc
        }, {})
      } catch {
        pinsMap = {}
      }
    }

    // Collect productIds referenced by pins or embedded recipe items so we can fetch them in bulk
    const allProductIdsSet = new Set<string>()
    try {
      // from pins data
      if (Object.keys(pinsMap).length > 0) {
        for (const arr of Object.values(pinsMap)) {
          for (const p of arr) {
            const pid = p?.product_id ?? p?.productId ?? null
            if (pid) allProductIdsSet.add(String(pid))
          }
        }
      }
      // from recipes data (embedded items or legacy fields)
      for (const r of data) {
        if (!r) continue
        // possible shapes: r.items = [{ product_id | id | productId }]
        if (Array.isArray(r.items)) {
          for (const it of r.items) {
            const pid = it?.product_id ?? it?.id ?? it?.productId ?? null
            if (pid) allProductIdsSet.add(String(pid))
          }
        }
        // legacy: recipes may include pins in join (we already processed pinsMap) or recipe_items elsewhere
      }
    } catch (e) {
      // ignore collection errors
    }

    // Bulk fetch products referenced by any recipe (limit to owner and published)
    let productsMap: Record<string, any> = {}
    if (allProductIdsSet.size > 0) {
      try {
        const ids = Array.from(allProductIdsSet)
        const prodRes = await supabase.from('products').select('*').in('id', ids).eq('user_id', ownerId)
        const prodData: any[] = prodRes.data || []
        productsMap = prodData.reduce((acc: Record<string, any>, p: any) => {
          if (!p) return acc
          acc[String(p.id)] = p
          return acc
        }, {})
      } catch (e) {
        productsMap = {}
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
              const userId = p.user_id ?? p.userId ?? null
              const toNumber = (v: any, fallback: number | null = null) => {
                if (v === null || typeof v === 'undefined' || v === '') return fallback
                const n = Number(v)
                return Number.isFinite(n) ? n : fallback
              }

              // required numeric coords (default 0)
              const dotX = toNumber(p.dot_x_percent ?? p.dot_x ?? p.dotX ?? null, 0) as number
              const dotY = toNumber(p.dot_y_percent ?? p.dot_y ?? p.dotY ?? null, 0) as number

              // optional numeric fields
              const tagXn = toNumber(p.tag_x_percent ?? p.tag_x ?? p.tagX ?? null, null)
              const tagYn = toNumber(p.tag_y_percent ?? p.tag_y ?? p.tagY ?? null, null)
              const dotSizeN = toNumber(p.dot_size_percent ?? p.dot_size ?? p.dotSizePercent ?? null, null)
              const tagFontSizeN = toNumber(p.tag_font_size_percent ?? p.tag_font_size ?? null, null)
              const lineWidthN = toNumber(p.line_width_percent ?? p.line_width ?? p.lineWidthPercent ?? null, null)
              const tagPadXN = toNumber(p.tag_padding_x_percent ?? p.tag_padding_x ?? null, null)
              const tagPadYN = toNumber(p.tag_padding_y_percent ?? p.tag_padding_y ?? null, null)
              const tagBorderRadiusN = toNumber(p.tag_border_radius_percent ?? p.tag_border_radius_percent ?? null, null)
              const tagBorderWidthN = toNumber(p.tag_border_width_percent ?? p.tag_border_width_percent ?? null, null)
              const tagBgOpacityN = toNumber(p.tag_background_opacity ?? p.tag_background_opacity ?? null, null)

              // string fields
              const tagDisplayTextRaw = p.tag_display_text ?? p.tag_display_text ?? undefined
              const tagTextRaw = p.tag_text ?? undefined
              const dotColorRaw = p.dot_color ?? undefined
              const dotShapeRaw = p.dot_shape ?? undefined
              const tagFontFamilyRaw = p.tag_font_family ?? undefined
              const tagFontWeightRaw = p.tag_font_weight ?? undefined
              const tagTextColorRaw = p.tag_text_color ?? undefined
              const tagTextShadowRaw = p.tag_text_shadow ?? undefined
              const tagBgRaw = p.tag_background_color ?? undefined
              const tagBorderColorRaw = p.tag_border_color ?? undefined
              const tagShadowRaw = p.tag_shadow ?? undefined
              const lineTypeRaw = p.line_type ?? undefined

              const out: any = {
                id,
                productId: productId || null,
                userId: userId || null,
                dotX,
                dotY,
              }

              if (dotSizeN !== null) out.dotSizePercent = dotSizeN
              if (tagXn !== null) out.tagX = tagXn
              if (tagYn !== null) out.tagY = tagYn
              if (tagFontSizeN !== null) out.tagFontSizePercent = tagFontSizeN
              if (lineWidthN !== null) out.lineWidthPercent = lineWidthN
              if (tagPadXN !== null) out.tagPaddingXPercent = tagPadXN
              if (tagPadYN !== null) out.tagPaddingYPercent = tagPadYN
              if (tagBorderRadiusN !== null) out.tagBorderRadiusPercent = tagBorderRadiusN
              if (tagBorderWidthN !== null) out.tagBorderWidthPercent = tagBorderWidthN
              if (tagBgOpacityN !== null) out.tagBackgroundOpacity = tagBgOpacityN

              if (typeof tagDisplayTextRaw === 'string' && tagDisplayTextRaw !== '') out.tagDisplayText = tagDisplayTextRaw
              if (typeof tagTextRaw === 'string' && tagTextRaw !== '') out.tagText = tagTextRaw
              if (typeof dotColorRaw === 'string' && dotColorRaw !== '') out.dotColor = dotColorRaw
              if (typeof dotShapeRaw === 'string' && dotShapeRaw !== '') out.dotShape = dotShapeRaw
              if (typeof tagFontFamilyRaw === 'string' && tagFontFamilyRaw !== '') out.tagFontFamily = tagFontFamilyRaw
              if (typeof tagFontWeightRaw === 'string' && tagFontWeightRaw !== '') out.tagFontWeight = tagFontWeightRaw
              if (typeof tagTextColorRaw === 'string' && tagTextColorRaw !== '') out.tagTextColor = tagTextColorRaw
              if (typeof tagTextShadowRaw === 'string' && tagTextShadowRaw !== '') out.tagTextShadow = tagTextShadowRaw
              if (typeof tagBgRaw === 'string' && tagBgRaw !== '') out.tagBackgroundColor = tagBgRaw
              if (typeof tagBorderColorRaw === 'string' && tagBorderColorRaw !== '') out.tagBorderColor = tagBorderColorRaw
              if (typeof tagShadowRaw === 'string' && tagShadowRaw !== '') out.tagShadow = tagShadowRaw
              if (typeof lineTypeRaw === 'string' && lineTypeRaw !== '') out.lineType = lineTypeRaw

              return out
            } catch (e) {
              try { console.warn('[DBG] transformPin error', String(e)) } catch {}
              return null
            }
          }

          rec.pins = Array.isArray(fromJoin) ? fromJoin.map((p: any) => transformPin(p)).filter(Boolean) : []
        } catch {
          rec.pins = []
        }

        // Build `items` for this recipe by resolving productIds found in pins or recipe.items
        try {
          const recipeProductIds = new Set<string>()
          // from pins
          if (Array.isArray(rec.pins)) {
            for (const pin of rec.pins) {
              if (!pin) continue
              const pid = pin.productId ?? null
              if (pid) recipeProductIds.add(String(pid))
            }
          }
          // from embedded recipe items (if any)
          if (Array.isArray(r.items)) {
            for (const it of r.items) {
              const pid = it?.product_id ?? it?.id ?? it?.productId ?? null
              if (pid) recipeProductIds.add(String(pid))
            }
          }

          const itemsOut: any[] = []
          // Normalize products to match public products DTO (images, main_image, attachment_images)
          for (const pid of Array.from(recipeProductIds)) {
            const rawProd = productsMap[String(pid)] || null
            if (!rawProd) continue
            try {
              const p = { ...rawProd }
              // Normalize images array if present
              if (Array.isArray(p.images) && p.images.length > 0) {
                p.images = p.images.map((img: any) => {
                  try {
                    const rawKey = img.key || img.url || null
                    const normKey = normalizeRecipeBasePath(String(rawKey || ''), env) || rawKey || null
                    const resp = responsiveImageForUsage(normKey || (img.url || null), 'list', env.IMAGES_DOMAIN)
                    return {
                      id: img.id || null,
                      productId: img.product_id || img.productId || null,
                      src: resp?.src || null,
                      srcSet: resp?.srcSet || null,
                      width: typeof img.width !== 'undefined' ? img.width : null,
                      height: typeof img.height !== 'undefined' ? img.height : null,
                      aspect: img.aspect || null,
                      role: img.role || null,
                    }
                  } catch { return { id: img.id || null, productId: img.product_id || img.productId || null, src: null, srcSet: null, width: null, height: null, aspect: null, role: img.role || null } }
                })
              } else {
                const imgs: any[] = []
                const mainKeyRaw = p.main_image_key || p.mainImageKey || null
                const mainKey = typeof mainKeyRaw !== 'undefined' && mainKeyRaw !== null ? normalizeRecipeBasePath(String(mainKeyRaw), env) : null
                if (mainKey) {
                  const mainResp = responsiveImageForUsage(mainKey, 'list', env.IMAGES_DOMAIN)
                  imgs.push({ id: null, productId: p.id || null, src: mainResp?.src || null, srcSet: mainResp?.srcSet || null, width: null, height: null, aspect: null, role: 'main' })
                }
                const attachmentKeysRaw = p.attachment_image_keys || p.attachmentImageKeys || null
                const parseKeys = (val: any) => {
                  try {
                    if (!val) return []
                    if (Array.isArray(val)) return val.filter(Boolean).map(String)
                    if (typeof val === 'string') {
                      const s = val.trim()
                      if (s.startsWith('[')) return JSON.parse(s)
                      return [s]
                    }
                    return []
                  } catch { return [] }
                }
                const attachmentKeys = parseKeys(attachmentKeysRaw)
                for (const rawK of attachmentKeys) {
                  try {
                    const k = normalizeRecipeBasePath(String(rawK), env)
                    const aResp = responsiveImageForUsage(k, 'list', env.IMAGES_DOMAIN)
                    imgs.push({ id: null, productId: p.id || null, src: aResp?.src || null, srcSet: aResp?.srcSet || null, width: null, height: null, aspect: null, role: 'attachment' })
                  } catch {}
                }
                p.images = imgs
              }

              try { p.main_image = Array.isArray(p.images) && p.images.length > 0 ? (p.images.find((i: any) => i.role === 'main')?.src || p.images[0]?.src || null) : null } catch { p.main_image = null }
              try { p.attachment_images = Array.isArray(p.images) ? p.images.filter((i: any) => i.role === 'attachment').map((i: any) => i.src).filter(Boolean) : [] } catch { p.attachment_images = [] }
              // Remove raw storage key fields
              try { delete p.main_image_key; delete p.mainImageKey; delete p.attachment_image_keys; delete p.attachmentImageKeys } catch {}
              itemsOut.push(p)
            } catch {}
          }
          rec.items = itemsOut
        } catch {
          try { rec.items = [] } catch {}
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