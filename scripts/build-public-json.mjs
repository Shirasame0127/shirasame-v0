#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {})
}

function getEnv(name, fallback = '') {
  return (process.env[name] || fallback).toString()
}

function getPublicImageUrl(raw) {
  if (!raw) return null
  if (typeof raw === 'string' && raw.startsWith('data:')) return raw
  const pubRoot = (getEnv('NEXT_PUBLIC_R2_PUBLIC_URL') || getEnv('R2_PUBLIC_URL')).replace(/\/$/, '')
  if (!pubRoot) return raw
  if (typeof raw === 'string' && raw.startsWith('http')) {
    try {
      const u = new URL(raw)
      let key = u.pathname.replace(/^\/+/, '')
      const bucket = (getEnv('R2_BUCKET') || '').replace(/^\/+|\/+$/g, '')
      if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
      if (key.startsWith('images/')) key = key.slice('images/'.length)
      key = key.replace(/^\/+/, '')
      return key ? `${pubRoot}/${key}` : raw
    } catch {
      return raw
    }
  }
  return `${pubRoot}/${String(raw).replace(/^\/+/, '')}`
}

async function run() {
  const SUPABASE_URL = getEnv('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[build-public-json] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const OWNER_EMAIL = getEnv('PUBLIC_PROFILE_EMAIL')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  let ownerUserId = null
  if (OWNER_EMAIL) {
    const u = await supabase.from('users').select('id').eq('email', OWNER_EMAIL).limit(1)
    ownerUserId = Array.isArray(u.data) && u.data.length > 0 ? u.data[0].id : null
  }

  // products (published, shallow)
  let products = []
  {
    let q = supabase.from('products').select('id,user_id,title,slug,tags,price,published,created_at,updated_at, images:product_images(id,product_id,url,width,height,role)').eq('published', true)
    if (ownerUserId) q = q.eq('user_id', ownerUserId)
    const { data, error } = await q
    if (error) throw error
    const list = data || []
    products = list.map(p => {
      const first = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
      return {
        id: p.id,
        userId: p.user_id,
        title: p.title,
        slug: p.slug,
        tags: p.tags,
        price: p.price,
        published: p.published,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        image: first ? { url: getPublicImageUrl(first.url) || first.url, width: first.width || null, height: first.height || null, role: first.role || null } : null,
      }
    })
  }

  // collections (public) with products embedded (published only)
  let collections = []
  {
    const { data: cols, error: colErr } = await supabase.from('collections').select('*').eq('visibility', 'public').order('created_at', { ascending: false })
    if (colErr) throw colErr
    const collectionList = cols || []
    const ids = collectionList.map(c => c.id)
    const { data: items, error: itemsErr } = await supabase.from('collection_items').select('*').in('collection_id', ids)
    if (itemsErr) throw itemsErr
    const itemList = items || []
    const productIds = Array.from(new Set(itemList.map(it => it.product_id)))

    let fullProducts = []
    if (productIds.length > 0) {
      let pq = supabase.from('products').select('*, images:product_images(*), affiliateLinks:affiliate_links(*)').in('id', productIds).eq('published', true)
      if (ownerUserId) pq = pq.eq('user_id', ownerUserId)
      const { data: prods, error: prodErr } = await pq
      if (prodErr) throw prodErr
      fullProducts = prods || []
    }
    const pmap = new Map(fullProducts.map(p => [p.id, p]))
    collections = collectionList.map(c => {
      const citems = itemList.filter(it => it.collection_id === c.id)
      const cprods = citems.map(it => pmap.get(it.product_id)).filter(Boolean)
      return {
        id: c.id,
        userId: c.user_id,
        title: c.title,
        description: c.description,
        visibility: c.visibility,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        products: cprods.map(p => ({
          id: p.id,
          userId: p.user_id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          body: p.body,
          tags: p.tags,
          price: p.price,
          published: p.published,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          showPrice: p.show_price,
          notes: p.notes,
          relatedLinks: p.related_links,
          images: Array.isArray(p.images) ? p.images.map(img => ({ id: img.id, productId: img.product_id, url: getPublicImageUrl(img.url) || img.url, width: img.width, height: img.height, aspect: img.aspect, role: img.role })) : [],
          affiliateLinks: Array.isArray(p.affiliateLinks) ? p.affiliateLinks.map(l => ({ provider: l.provider, url: l.url, label: l.label })) : [],
        })),
      }
    })
  }

  // tag groups + tags -> mapping
  let tagGroupsMap = {}
  {
    const { data: groups, error: gErr } = await supabase.from('tag_groups').select('name, label, sort_order, created_at' + (ownerUserId ? ', user_id' : ''))
    if (gErr) {
      // tolerate when table/schema missing
    }
    const { data: tags, error: tErr } = await supabase.from('tags').select('name, group, sort_order, created_at')
    if (tErr) {
      // tolerate
    }
    const g = Array.isArray(groups) ? groups : []
    const t = Array.isArray(tags) ? tags : []
    tagGroupsMap = {}
    for (const gr of g) { if (!gr || !gr.name) continue; tagGroupsMap[gr.name] = [] }
    for (const tg of t) {
      const name = tg.name
      const groupName = tg.group || '未分類'
      if (!tagGroupsMap[groupName]) tagGroupsMap[groupName] = []
      if (!tagGroupsMap[groupName].includes(name)) tagGroupsMap[groupName].push(name)
    }
  }

  // user profile (owner)
  let user = null
  if (OWNER_EMAIL) {
    const { data, error } = await supabase.from('users').select('*').eq('email', OWNER_EMAIL).limit(1)
    if (!error) {
      const u = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (u) {
        user = {
          id: u.id,
          name: u.name || null,
          displayName: u.display_name || u.displayName || u.name || null,
          email: u.email || null,
          avatarUrl: getPublicImageUrl(u.avatar_url || u.avatarUrl || u.profile_image || null),
          profileImage: getPublicImageUrl(u.profile_image || u.profile_image_key || u.profileImageKey || null),
          profileImageKey: u.profile_image_key || null,
          headerImage: getPublicImageUrl(u.header_image || (Array.isArray(u.header_image_keys) ? u.header_image_keys[0] : null) || null),
          headerImageKeys: u.header_image_keys || null,
          bio: u.bio || null,
          socialLinks: u.social_links || u.socialLinks || null,
        }
      }
    }
  }

  const outDir = path.join(__dirname, '..', 'public', 'data')
  await ensureDir(outDir)
  await fs.writeFile(path.join(outDir, 'products.json'), JSON.stringify({ data: products }, null, 2), 'utf8')
  await fs.writeFile(path.join(outDir, 'collections.json'), JSON.stringify({ data: collections }, null, 2), 'utf8')
  await fs.writeFile(path.join(outDir, 'tag-groups.json'), JSON.stringify({ data: tagGroupsMap }, null, 2), 'utf8')
  await fs.writeFile(path.join(outDir, 'user.json'), JSON.stringify({ data: user }, null, 2), 'utf8')

  console.log('[build-public-json] wrote public/data/*.json')
}

run().catch(err => {
  console.error('[build-public-json] failed', err)
  process.exit(1)
})
