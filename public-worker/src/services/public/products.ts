import { getSupabase } from '../../supabase'
import { getPublicImageUrl, responsiveImageForUsage } from '../../../../shared/lib/image-usecases'
import { getPublicOwnerUserId } from '../../utils/public-owner'

function parseKeysField(val: any): string[] {
  try {
    if (!val) return []
    if (Array.isArray(val)) return val.filter(Boolean).map(String)
    if (typeof val === 'string') {
      const s = val.trim()
      if (s.startsWith('[')) return JSON.parse(s)
      return [s]
    }
    return []
  } catch (e) { return [] }
}

function normalizeRawKey(raw?: string | null, env?: any): string | null {
  try {
    if (!raw) return null
    let k = String(raw).trim()
    // Remove leading bucket path or leading `images/` prefix
    k = k.replace(/^\/+/, '')
    if (k.startsWith('images/')) k = k.slice('images/'.length)
    const bucket = (env && env.R2_BUCKET) ? String(env.R2_BUCKET) : ''
    if (bucket && k.startsWith(`${bucket}/`)) k = k.slice(bucket.length + 1)
    // collapse multiple slashes
    k = k.replace(/\/+/g, '/')
    return k || null
  } catch {
    return null
  }
}

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

export async function fetchPublicProducts(env: any, params: { limit?: number | null; offset?: number; shallow?: boolean; count?: boolean }) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [], meta: undefined }
  const supabase = getSupabase(env)
  try {
    const { limit = null, offset = 0, shallow = false, count = false } = params || {}
    const selectShallow = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,main_image_key,attachment_image_keys,images:product_images(id,product_id,key,width,height,role)'
    const selectFull = '*,main_image_key,attachment_image_keys,images:product_images(id,product_id,key,width,height,role),related_links,notes,show_price'

    if (count) {
      if (!limit || limit === 0) {
        const res = await supabase.from('products').select('id', { count: 'exact' }).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false }).range(0, 0)
        const total = typeof (res as any).count === 'number' ? (res as any).count : null
        return { data: [], meta: total != null ? { total, limit: 0, offset } : undefined }
      } else {
        const res = await supabase.from('products').select(shallow ? selectShallow : selectFull, { count: 'exact' }).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false }).range(offset, offset + Math.max(0, (limit || 0) - 1))
        const data = res.data || []
        const total = typeof (res as any).count === 'number' ? (res as any).count : null
        return { data, meta: total != null ? { total, limit, offset } : undefined }
      }
    }

    let query: any
    if (limit && limit > 0) {
      query = supabase.from('products').select(shallow ? selectShallow : selectFull).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false }).range(offset, offset + Math.max(0, (limit || 0) - 1))
    } else {
      query = supabase.from('products').select(shallow ? selectShallow : selectFull).eq('user_id', ownerId).eq('published', true).order('created_at', { ascending: false })
    }

    const res = await query
    const data = res.data || []
    // Normalize image URLs and match admin DTO shape (include productId, aspect, basePath)
    for (const p of data) {
      try {
        // If product_images relation exists and returned as p.images, normalize those first
        if (Array.isArray(p.images) && p.images.length > 0) {
          p.images = p.images.map((img: any) => {
            const rawKey = img.key || img.url || null
            const normKey = normalizeRawKey(rawKey, env)
            const url = normKey ? getPublicImageUrl(normKey, env.IMAGES_DOMAIN) : (img.url || null)
            return {
              id: img.id || null,
              productId: img.product_id || null,
              url: url || null,
              width: typeof img.width !== 'undefined' ? img.width : null,
              height: typeof img.height !== 'undefined' ? img.height : null,
              aspect: img.aspect || null,
              role: img.role || null,
              basePath: deriveBasePathFromUrl(normKey || img.url || null, env),
              responsive: responsiveImageForUsage(normKey || img.url || null, 'list', env.IMAGES_DOMAIN),
            }
          })
        } else {
          // Fallback: products table stores main_image_key and attachment_image_keys
          const imgs: any[] = []
          const mainKeyRaw = p.main_image_key || p.mainImageKey || null
          const mainKey = normalizeRawKey(mainKeyRaw, env)
          if (mainKey) {
            imgs.push({
              id: null,
              productId: p.id || null,
              url: getPublicImageUrl(mainKey, env.IMAGES_DOMAIN) || null,
              width: null,
              height: null,
              aspect: null,
              role: 'main',
              basePath: deriveBasePathFromUrl(mainKey, env),
              responsive: responsiveImageForUsage(mainKey, 'list', env.IMAGES_DOMAIN),
            })
          }
          const attachmentKeysRaw = p.attachment_image_keys || p.attachmentImageKeys || null
          const attachmentKeys = parseKeysField(attachmentKeysRaw)
          for (const rawK of attachmentKeys) {
            try {
              const k = normalizeRawKey(rawK, env)
              imgs.push({
                id: null,
                productId: p.id || null,
                url: getPublicImageUrl(k, env.IMAGES_DOMAIN) || null,
                width: null,
                height: null,
                aspect: null,
                role: 'attachment',
                basePath: deriveBasePathFromUrl(k, env),
                responsive: responsiveImageForUsage(k, 'list', env.IMAGES_DOMAIN),
              })
            } catch {}
          }
          p.images = imgs
        }
        // Provide URL-only main_image and attachment_images fields and remove raw key fields
        try {
          p.main_image = p.images && p.images.length > 0 ? (p.images.find((i: any) => i.role === 'main')?.url || p.images[0]?.url || null) : null
        } catch { p.main_image = null }
        try {
          p.attachment_images = Array.isArray(p.images) ? p.images.filter((i: any) => i.role === 'attachment').map((i: any) => i.url).filter(Boolean) : []
        } catch { p.attachment_images = [] }
        // Remove any raw key fields to avoid exposing storage keys
        delete p.main_image_key; delete p.mainImageKey; delete p.attachment_image_keys; delete p.attachmentImageKeys
      } catch {}
    }
    return { data, meta: undefined }
  } catch (e) {
    return { data: [], meta: undefined }
  }
}
