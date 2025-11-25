import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function toSnake(s: string) {
  return s.replace(/([A-Z])/g, (_m, p1) => `_${p1.toLowerCase()}`)
}

// Allowed columns on `users` table — use DB column names here to whitelist updates.
const ALLOWED_USER_COLUMNS = new Set([
  'instance_id','id','name','display_name','aud','email','role','avatar_url','encrypted_password',
  'profile_image','header_image','email_confirmed_at','header_images','invited_at','bio','confirmation_token',
  'social_links','confirmation_sent_at','created_at','recovery_token','updated_at','recovery_sent_at','profile_image_key',
  'email_change_token_new','background_type','email_change','background_value','email_change_sent_at','last_sign_in_at',
  'background_image_key','header_image_keys','raw_app_meta_data','raw_user_meta_data','amazon_access_key','is_super_admin',
  'amazon_secret_key','amazon_associate_id','phone','phone_confirmed_at','phone_change','phone_change_token','phone_change_sent_at',
  'confirmed_at','email_change_token_current','email_change_confirm_status','banned_until','reauthentication_token','reauthentication_sent_at',
  'is_sso_user','deleted_at','is_anonymous'
])

function normalizeAliasKey(k: string) {
  if (!k) return k
  if (k === 'header_images_keys') return 'header_image_keys'
  if (k === 'headerImageKeys') return 'header_image_keys'
  if (k === 'headerImagesKeys') return 'header_image_keys'
  if (k === 'backgroundImageValue') return 'background_value'
  if (k === 'backgroundValue') return 'background_value'
  if (k === 'background_image_value') return 'background_value'
  return k
}

function sanitizeToAllowed(updates: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(updates || {})) {
    const norm = normalizeAliasKey(k)
    const snake = norm.includes('_') ? norm : toSnake(norm)
    if (ALLOWED_USER_COLUMNS.has(snake)) out[snake] = v
  }
  return out
}

function mapClientToRow(body: any) {
  if (!body || typeof body !== 'object') return body
  const out: any = {}
  for (const k of Object.keys(body)) {
    const v = body[k]
    // explicit mappings
    switch (k) {
      case 'userId':
        out['id'] = v
        continue
      case 'displayName':
        out['display_name'] = v
        continue
      case 'avatarUrl':
        out['avatar_url'] = v
        continue
      case 'headerImageUrl':
        out['header_image'] = v
        continue
      case 'profileImage':
        out['profile_image'] = v
        continue
      case 'profileImageKey':
        out['profile_image_key'] = v
        continue
      case 'backgroundImageUrl':
        out['background_image_url'] = v
        continue
      case 'backgroundValue':
        out['background_value'] = v
        continue
      case 'backgroundImageValue':
        out['background_value'] = v
        continue
      case 'background_image_value':
        out['background_value'] = v
        continue
      case 'favoriteFonts':
        out['favorite_fonts'] = v
        continue
      case 'createdAt':
        out['created_at'] = v
        continue
      case 'updatedAt':
        out['updated_at'] = v
        continue
    }

    // generic fallback to snake_case
    const snake = toSnake(k)
    out[snake] = v
  }
  return out
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const row = mapClientToRow(body)
    row.created_at = row.created_at || new Date().toISOString()
    row.updated_at = row.updated_at || new Date().toISOString()
    const safeRow = sanitizeToAllowed(row)

    const { data, error } = await supabaseAdmin.from('users').insert([safeRow]).select().maybeSingle()
    if (error) {
      console.error('[admin/users POST] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/users POST] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
