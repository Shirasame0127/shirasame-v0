import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getOwnerUserId } from '@/lib/owner'

function toSnake(s: string) {
  return s.replace(/([A-Z])/g, (_m, p1) => `_${p1.toLowerCase()}`)
}

// Allow-list of actual `users` table columns (from DB schema).
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
  // normalize common alias typos/variants to canonical snake_case
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
    // if key is camelCase, convert to snake_case
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
    // common explicit mappings for backwards compatibility
    switch (k) {
      case 'displayName':
        out['display_name'] = v
        continue
      case 'avatarUrl':
        out['avatar_url'] = v
        continue
      case 'headerImageUrl':
        out['header_image'] = v
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

    // generic fallback: transform camelCase -> snake_case
    const snake = toSnake(k)
    out[snake] = v
  }
  return out
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'missing body' }, { status: 400 })

    const updates = { ...mapClientToRow(body), updated_at: new Date().toISOString() }
    const safeUpdates = sanitizeToAllowed(updates)

    // If owner resolution available, prefer restricting update to owner user row
    try {
      const ownerId = await getOwnerUserId()
      if (ownerId) {
        const { data, error } = await supabaseAdmin.from('users').update(safeUpdates).eq('id', id).eq('id', ownerId).select().maybeSingle()
        if (error) {
          console.error('[admin/users:id PUT] update error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        if (!data) return NextResponse.json({ error: 'not found or owner mismatch' }, { status: 404 })
        return NextResponse.json({ data })
      }
    } catch (e) {
      // fall back to non-owner-restricted update
    }

    const { data, error } = await supabaseAdmin.from('users').update(safeUpdates).eq('id', id).select().maybeSingle()
    if (error) {
      console.error('[admin/users:id PUT] update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/users:id PUT] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).maybeSingle()
    if (error) {
      console.error('[admin/users:id GET] select error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (e: any) {
    console.error('[admin/users:id GET] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const maybeParams = params && typeof (params as any).then === 'function' ? await params : params
    const id = maybeParams?.id || (params && (params as any).id)
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
    if (error) {
      console.error('[admin/users:id DELETE] delete error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/users:id DELETE] exception', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
