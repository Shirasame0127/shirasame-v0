#!/usr/bin/env node
import fs from 'fs/promises'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

function env(name, fallback = '') { return (process.env[name] || fallback).toString() }

function getPublicImageUrl(raw) {
  if (!raw) return null
  if (raw.startsWith('data:')) return raw
  const pubRoot = (env('NEXT_PUBLIC_R2_PUBLIC_URL') || env('R2_PUBLIC_URL')).replace(/\/$/, '')
  if (!pubRoot) return raw
  if (raw.startsWith('http')) {
    try {
      const u = new URL(raw)
      let key = u.pathname.replace(/^\/+/, '')
      const bucket = env('R2_BUCKET').replace(/^\/+|\/+$/g, '')
      if (bucket && key.startsWith(bucket + '/')) key = key.slice(bucket.length + 1)
      if (key.startsWith('images/')) key = key.slice('images/'.length)
      key = key.replace(/^\/+/, '')
      return key ? `${pubRoot}/${key}` : raw
    } catch { return raw }
  }
  return `${pubRoot}/${raw.replace(/^\/+/, '')}`
}

function hashKey(src, w, h) {
  return crypto.createHash('sha256').update(`${src}|w=${w}|h=${h}`).digest('hex')
}

async function ensureThumb(s3, bucket, srcUrl, w, h) {
  const keyHash = hashKey(srcUrl, w, h)
  const thumbKey = `thumbnails/${keyHash}-${w}x${h}.jpg`
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: thumbKey }))
    return { existed: true, key: thumbKey }
  } catch {}

  const res = await fetch(srcUrl)
  if (!res.ok) throw new Error(`fetch source failed: ${srcUrl}`)
  const arr = await res.arrayBuffer()
  const sharpModule = await import('sharp')
  const sharp = sharpModule.default || sharpModule
  let pipeline = sharp(Buffer.from(arr)).rotate()
  if (w > 0 && h > 0) pipeline = pipeline.resize(w, h, { fit: 'cover' })
  else if (w > 0) pipeline = pipeline.resize({ width: w, withoutEnlargement: true })
  const out = await pipeline.jpeg({ quality: 75 }).toBuffer()
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: thumbKey, Body: out, ContentType: 'image/jpeg' }))
  return { existed: false, key: thumbKey }
}

async function run() {
  const SUPABASE_URL = env('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY')
  const ACCOUNT_ID = env('CLOUDFLARE_ACCOUNT_ID') || env('R2_ACCOUNT')
  const R2_ACCESS = env('R2_ACCESS_KEY_ID') || env('R2_ACCESS_KEY')
  const R2_SECRET = env('R2_SECRET_ACCESS_KEY') || env('R2_SECRET')
  const BUCKET = env('R2_BUCKET') || 'images'

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Supabase env')
  if (!ACCOUNT_ID || !R2_ACCESS || !R2_SECRET) throw new Error('Missing R2 credentials')

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS, secretAccessKey: R2_SECRET },
  })
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const OWNER_EMAIL = env('PUBLIC_PROFILE_EMAIL')
  let ownerUserId = null
  if (OWNER_EMAIL) {
    const u = await supabase.from('users').select('id').eq('email', OWNER_EMAIL).limit(1)
    ownerUserId = Array.isArray(u.data) && u.data.length > 0 ? u.data[0].id : null
  }

  // Fetch published products with first image
  let q = supabase.from('products').select('id,user_id, images:product_images(url,width,height,role)').eq('published', true)
  if (ownerUserId) q = q.eq('user_id', ownerUserId)
  const { data, error } = await q
  if (error) throw error

  const sizes = [160, 400]
  let created = 0, skipped = 0

  for (const p of data || []) {
    const first = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
    const src = first?.url ? getPublicImageUrl(first.url) || first.url : null
    if (!src) continue
    for (const w of sizes) {
      const r = await ensureThumb(s3, BUCKET, src, w, 0)
      if (r.existed) skipped++
      else created++
    }
  }

  console.log(`[generate-thumbnails] created: ${created}, skipped(existing): ${skipped}`)
}

run().catch(e => { console.error('[generate-thumbnails] failed', e); process.exit(1) })
