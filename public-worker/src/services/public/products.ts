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

function parseAffiliateField(val: any): Array<{ label: string | null; url: string | null }> {
  try {
    if (!val) return []
    if (Array.isArray(val)) return val.map((v: any) => ({ label: v.label || v.text || null, url: v.url || null })).filter((a: any) => a && a.url)
    if (typeof val === 'string') {
      const s = val.trim()
      if (s.startsWith('[')) {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed)) return parsed.map((v: any) => ({ label: v.label || v.text || null, url: v.url || null })).filter((a: any) => a && a.url)
        return []
      }
      // single URL string
      return [{ label: null, url: s }]
    }
    if (typeof val === 'object') return [{ label: val.label || val.text || null, url: val.url || null }].filter((a: any) => a && a.url)
    return []
  } catch {
    return []
  }
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
            const resp = responsiveImageForUsage(normKey || img.url || null, 'list', env.IMAGES_DOMAIN)
            return {
              id: img.id || null,
              productId: img.product_id || null,
              src: resp.src || null,
              srcSet: resp.srcSet || null,
              width: typeof img.width !== 'undefined' ? img.width : null,
              height: typeof img.height !== 'undefined' ? img.height : null,
              aspect: img.aspect || null,
              role: img.role || null,
            }
          })
        } else {
          // Fallback: products table stores main_image_key and attachment_image_keys
          const imgs: any[] = []
          const mainKeyRaw = p.main_image_key || p.mainImageKey || null
          const mainKey = normalizeRawKey(mainKeyRaw, env)
          if (mainKey) {
            const mainResp = responsiveImageForUsage(mainKey, 'list', env.IMAGES_DOMAIN)
            imgs.push({
              id: null,
              productId: p.id || null,
              src: mainResp.src || null,
              srcSet: mainResp.srcSet || null,
              width: null,
              height: null,
              aspect: null,
              role: 'main',
            })
          }
          const attachmentKeysRaw = p.attachment_image_keys || p.attachmentImageKeys || null
          const attachmentKeys = parseKeysField(attachmentKeysRaw)
          for (const rawK of attachmentKeys) {
            try {
              const k = normalizeRawKey(rawK, env)
              const aResp = responsiveImageForUsage(k, 'list', env.IMAGES_DOMAIN)
              imgs.push({
                id: null,
                productId: p.id || null,
                src: aResp.src || null,
                srcSet: aResp.srcSet || null,
                width: null,
                height: null,
                aspect: null,
                role: 'attachment',
              })
            } catch {}
          }
          p.images = imgs
        }
        // Provide URL-only main_image and attachment_images fields and remove raw key fields
        try {
          if (p.images && p.images.length > 0) {
            const mainImg = p.images.find((i: any) => i.role === 'main') || p.images[0]
            p.main_image = { src: mainImg?.src || null, srcSet: mainImg?.srcSet || null }
          } else {
            p.main_image = null
          }
        } catch { p.main_image = null }
        try {
          p.attachment_images = Array.isArray(p.images) ? p.images.filter((i: any) => i.role === 'attachment').map((i: any) => ({ src: i.src, srcSet: i.srcSet })) : []
        } catch { p.attachment_images = [] }
        // normalize affiliate links and provide camelCase aliases expected by public frontend
        try {
          const rawAff = (p.affiliate_links || p.affiliateLinks || null)
          p.affiliateLinks = parseAffiliateField(rawAff)
        } catch { p.affiliateLinks = [] }
        try { p.shortDescription = p.short_description ?? null } catch {}
        try { p.relatedLinks = p.related_links ?? null } catch {}
        try { p.showPrice = typeof p.show_price !== 'undefined' ? p.show_price : null } catch {}
        // Remove any raw key fields to avoid exposing storage keys and strip internal timestamps
        delete p.main_image_key; delete p.mainImageKey; delete p.attachment_image_keys; delete p.attachmentImageKeys
        try { delete p.created_at; delete p.updated_at } catch {}
      } catch {}
    }
    return { data, meta: undefined }
  } catch (e) {
    return { data: [], meta: undefined }
  }
}

export async function fetchPublicOwnerProducts(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const select = 'id,slug,title,short_description,tags,price,show_price,main_image_key,attachment_image_keys,created_at,updated_at'
    const res = await supabase.from('products').select(select).eq('user_id', ownerId).eq('published', true).order('updated_at', { ascending: false })
    const rows = res.data || []
    const out = (rows || []).map((p: any) => {
      try {
        const mainKey = normalizeRawKey(p.main_image_key || p.mainImageKey || null, env)
        const mainResp = mainKey ? responsiveImageForUsage(mainKey, 'list', env.IMAGES_DOMAIN) : null
        const attachmentKeys = parseKeysField(p.attachment_image_keys || p.attachmentImageKeys || null)
        const attachment_images = attachmentKeys.map((kraw: any) => {
          const k = normalizeRawKey(kraw, env)
          const r = responsiveImageForUsage(k, 'list', env.IMAGES_DOMAIN)
          return { src: r?.src || null, srcSet: r?.srcSet || null }
        }).filter((a: any) => a && a.src)
        return {
          id: p.id || null,
          slug: p.slug || null,
          title: p.title || null,
          short_description: p.short_description || null,
          shortDescription: p.short_description || null,
          tags: p.tags || null,
          price: typeof p.price !== 'undefined' ? p.price : null,
          show_price: typeof p.show_price !== 'undefined' ? p.show_price : null,
          showPrice: typeof p.show_price !== 'undefined' ? p.show_price : null,
          main_image: mainResp ? { src: mainResp.src || null, srcSet: mainResp.srcSet || null } : null,
          attachment_images,
        }
      } catch (e) {
        return { id: p.id || null }
      }
    })
    return { data: out }
  } catch (e) {
    return { data: [] }
  }
}

export async function fetchPublicOwnerProductBySlug(env: any, slug?: string | null) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: null }
  if (!slug) return { data: null }
  const supabase = getSupabase(env)
  try {
    const select = 'id,slug,title,short_description,body,tags,price,show_price,related_links,notes,main_image_key,attachment_image_keys,created_at,updated_at'
    const res = await supabase.from('products').select(select).eq('user_id', ownerId).eq('published', true).eq('slug', String(slug)).limit(1).single()
    const p = res.data || null
    if (!p) return { data: null }

    const mainKey = normalizeRawKey(p.main_image_key || p.mainImageKey || null, env)
    const mainResp = mainKey ? responsiveImageForUsage(mainKey, 'detail', env.IMAGES_DOMAIN) : null

    const attachmentKeys = parseKeysField(p.attachment_image_keys || p.attachmentImageKeys || null)
    const attachment_images = (attachmentKeys || []).map((kraw: any) => {
      const k = normalizeRawKey(kraw, env)
      const r = responsiveImageForUsage(k, 'detail', env.IMAGES_DOMAIN)
      return r ? { src: r.src || null, srcSet: r.srcSet || null } : null
    }).filter(Boolean)

    const out = {
      id: p.id || null,
      slug: p.slug || null,
      title: p.title || null,
      short_description: p.short_description || null,
      shortDescription: p.short_description || null,
      body: p.body || null,
      tags: p.tags || null,
      price: (typeof p.price === 'string' && /^\d+$/.test(p.price)) ? Number(p.price) : (typeof p.price !== 'undefined' ? p.price : null),
      show_price: typeof p.show_price !== 'undefined' ? p.show_price : null,
      showPrice: typeof p.show_price !== 'undefined' ? p.show_price : null,
      related_links: p.related_links || null,
      relatedLinks: p.related_links || null,
      notes: p.notes || null,
      affiliateLinks: parseAffiliateField(p.affiliate_links || p.affiliateLinks || null),
      main_image: mainResp ? { src: mainResp.src || null, srcSet: mainResp.srcSet || null } : null,
      attachment_images,
      // Note: do not include legacy `images` array here — detail API must return only
      // `main_image` and `attachment_images` per API contract.
    }
    return { data: out }
  } catch (e) {
    return { data: null }
  }
}
