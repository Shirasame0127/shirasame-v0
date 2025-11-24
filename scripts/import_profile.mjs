import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  try {
    // Payload to import (replace or edit as needed)
    const payload = {
      id: '7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4',
      name: null,
      displayName: 'shirasame.official@gmail.com',
      email: 'shirasame.official@gmail.com',
      avatarUrl: null,
      profileImage: null,
      profileImageKey: null,
      headerImageKeys: null,
      bio: null,
      socialLinks: null,
    }

    // Upsert users table
    const onConflict = payload.id ? 'id' : 'email'
    const userRow = {
      id: payload.id || undefined,
      name: payload.name || null,
      display_name: payload.displayName || null,
      email: payload.email,
      avatar_url: payload.avatarUrl || null,
      profile_image: payload.profileImage || null,
      profile_image_key: payload.profileImageKey || null,
      header_image_keys: payload.headerImageKeys || null,
      bio: payload.bio || null,
      social_links: payload.socialLinks || null,
      updated_at: new Date().toISOString(),
    }

    console.log('Upserting users...', userRow.email)
    const { data: udata, error: uerr } = await supabase.from('users').upsert([userRow], { onConflict }).select().maybeSingle()
    if (uerr) {
      console.error('users upsert error', uerr)
      process.exit(1)
    }

    console.log('users upserted:', udata)

    const userId = (udata && udata.id) || payload.id || null
    if (userId) {
      // Persist profile-like fields on users table instead of a separate profiles table
      const updatePayload = {}
      if (payload.displayName) updatePayload.display_name = payload.displayName
      if (payload.name) updatePayload.name = payload.name
      if (payload.avatarUrl !== undefined) updatePayload.avatar_url = payload.avatarUrl
      if (payload.profileImage !== undefined) updatePayload.profile_image = payload.profileImage
      if (payload.profileImageKey !== undefined) updatePayload.profile_image_key = payload.profileImageKey
      if (payload.headerImageKeys !== undefined) updatePayload.header_image_keys = payload.headerImageKeys
      if (payload.bio !== undefined) updatePayload.bio = payload.bio
      if (payload.socialLinks !== undefined) updatePayload.social_links = payload.socialLinks
      if (Object.keys(updatePayload).length > 0) {
        try {
          const { data: updated, error: updErr } = await supabase.from('users').update(updatePayload).eq('id', userId).select().maybeSingle()
          if (updErr) console.warn('users update warning', updErr)
          else console.log('users updated with profile fields:', updated)
        } catch (e) {
          console.warn('users update exception', e)
        }
      }
    }

    console.log('Import finished successfully.')
    process.exit(0)
  } catch (e) {
    console.error('Exception during import:', e)
    process.exit(1)
  }
}

run()
