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

export async function fetchPublicProducts(env: any, params: { limit?: number | null; offset?: number; shallow?: boolean; count?: boolean }) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [], meta: undefined }
  const supabase = getSupabase(env)
  try {
    const { limit = null, offset = 0, shallow = false, count = false } = params || {}
    const selectShallow = 'id,user_id,title,slug,short_description,tags,price,published,created_at,updated_at,images:product_images(id,product_id,key,width,height,role)'
    const selectFull = '*,images:product_images(id,product_id,key,width,height,role),related_links,notes,show_price'

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
        if (Array.isArray(p.images)) {
          p.images = p.images.map((img: any) => ({
            id: img.id || null,
            productId: img.product_id || null,
            key: img.key || null,
            url: img.key ? getPublicImageUrl(img.key, env.IMAGES_DOMAIN) : (img.url || null),
            width: typeof img.width !== 'undefined' ? img.width : null,
            height: typeof img.height !== 'undefined' ? img.height : null,
            aspect: img.aspect || null,
            role: img.role || null,
            basePath: deriveBasePathFromUrl(img.key || img.url || null, env),
            responsive: responsiveImageForUsage(img.key || img.url || null, 'list', env.IMAGES_DOMAIN),
          }))
        }
      } catch {}
    }
    return { data, meta: undefined }
  } catch (e) {
    return { data: [], meta: undefined }
  }
}
