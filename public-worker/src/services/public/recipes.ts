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

export async function fetchPublicRecipes(env: any, params: { limit?: number | null; offset?: number; shallow?: boolean; }) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { limit = null, offset = 0, shallow = false } = params || {}
    const selectShallow = 'id,user_id,title,slug,published,created_at,updated_at'
    const selectFull = '*,images:recipe_images(id,recipe_id,key,width,height),pins'

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
        if (Array.isArray(rec.images)) {
          rec.images = rec.images.map((img: any) => ({
            id: img.id || null,
            recipeId: img.recipe_id || null,
            key: img.key || null,
            url: img.key ? getPublicImageUrl(img.key, env.IMAGES_DOMAIN) : (img.url || null),
            width: typeof img.width !== 'undefined' ? img.width : null,
            height: typeof img.height !== 'undefined' ? img.height : null,
            responsive: responsiveImageForUsage(img.key || img.url || null, 'recipe', env.IMAGES_DOMAIN),
            basePath: deriveBasePathFromUrl(img.key || img.url || null, env),
          }))
        } else {
          rec.images = []
        }

        // Derive recipe_image_keys similarly to admin but limit to at most 1
        const keysFromJoin = Array.isArray(rec.images) ? rec.images.map((i: any) => i.key).filter(Boolean) : []
        let recipeKeys: string[] = Array.isArray(rec.recipe_image_keys) ? rec.recipe_image_keys.slice(0, 1) : (keysFromJoin.length > 0 ? [keysFromJoin[0]] : [])
        rec.recipe_image_keys = recipeKeys
        rec.recipeImageKeys = recipeKeys

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
    key = key.replace(/\/+/g, '/')
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
    const selectFull = '*,images:recipe_images(id,recipe_id,key,width,height),pins'

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
        if (Array.isArray(rec.images)) {
          rec.images = rec.images.map((img: any) => ({
            id: img.id || null,
            recipeId: img.recipe_id || null,
            key: img.key || null,
            url: img.key ? getPublicImageUrl(img.key, env.IMAGES_DOMAIN) : (img.url || null),
            width: typeof img.width !== 'undefined' ? img.width : null,
            height: typeof img.height !== 'undefined' ? img.height : null,
            responsive: responsiveImageForUsage(img.key || img.url || null, 'recipe', env.IMAGES_DOMAIN),
            basePath: deriveBasePathFromUrl(img.key || img.url || null, env),
          }))
        } else {
          rec.images = []
        }

        // Derive recipe_image_keys similarly to admin but limit to at most 1
        const keysFromJoin = Array.isArray(rec.images) ? rec.images.map((i: any) => i.key).filter(Boolean) : []
        let recipeKeys: string[] = Array.isArray(rec.recipe_image_keys) ? rec.recipe_image_keys.slice(0, 1) : (keysFromJoin.length > 0 ? [keysFromJoin[0]] : [])
        rec.recipe_image_keys = recipeKeys
        rec.recipeImageKeys = recipeKeys

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
