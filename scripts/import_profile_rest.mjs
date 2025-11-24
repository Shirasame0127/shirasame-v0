import fs from 'fs'
import path from 'path'

function loadEnvFile(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim()
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch (e) {
    // ignore
  }
}

// Try load .env.local in project root (use current working directory for Windows)
const root = process.cwd()
const envPath = path.join(root, '.env.local')
loadEnvFile(envPath)

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment or .env.local')
  process.exit(1)
}

async function upsertTable(table, rows, onConflict) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(rows),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch (e) { json = text }
  return { status: res.status, ok: res.ok, data: json }
}

async function fetchTable(table, filter) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/${table}?${filter}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Accept': 'application/json',
    }
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch (e) { return text }
}

async function patchTable(table, filter, body) {
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/${table}?${filter}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch (e) { json = text }
  return { status: res.status, ok: res.ok, data: json }
}

async function run() {
  // Payload to import
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

  const userRow = {
    id: payload.id,
    name: payload.name,
    display_name: payload.displayName,
    email: payload.email,
    avatar_url: payload.avatarUrl,
    profile_image: payload.profileImage,
    profile_image_key: payload.profileImageKey,
    header_image_keys: payload.headerImageKeys,
    bio: payload.bio,
    social_links: payload.socialLinks,
    updated_at: new Date().toISOString(),
  }

  console.log('Checking existing user by id...')
  let userId = null
  let existing = null
  if (userRow.id) {
    const found = await fetchTable('users', `id=eq.${encodeURIComponent(userRow.id)}`)
    if (Array.isArray(found) && found.length > 0) {
      existing = found[0]
      userId = existing.id
      console.log('Found existing user by id:', userId)
    }
  }

  if (!existing) {
    console.log('Checking existing user by email...')
    const foundByEmail = await fetchTable('users', `email=eq.${encodeURIComponent(userRow.email)}`)
    if (Array.isArray(foundByEmail) && foundByEmail.length > 0) {
      existing = foundByEmail[0]
      userId = existing.id
      console.log('Found existing user by email:', userId)
    }
  }

  // Prepare a minimal payload matching likely users table columns to avoid unknown-column errors
  const userPayload = {
    display_name: userRow.display_name || null,
    bio: userRow.bio || null,
    email: userRow.email || null,
    profile_image_key: userRow.profile_image_key || null,
    avatar_url: userRow.avatar_url || null,
    header_image_keys: userRow.header_image_keys || null,
    updated_at: userRow.updated_at || new Date().toISOString(),
  }

  let usersRes = null
  if (existing && userId) {
    // Update existing row
    console.log('Patching existing user', userId)
    usersRes = await patchTable('users', `id=eq.${encodeURIComponent(userId)}`, userPayload)
  } else {
    // Create new row; include id if provided
    const createPayload = Object.assign({}, userPayload)
    if (userRow.id) createPayload.id = userRow.id
    console.log('Inserting new user')
    usersRes = await upsertTable('users', [createPayload], 'email')
  }

  console.log('usersRes', usersRes.status, usersRes.ok)
  console.log(usersRes.data)

  if (userId) {
    // Persist profile-like fields on users table instead of a separate profiles table
    const updatePayload = {
      display_name: payload.displayName || null,
      bio: payload.bio || null,
      email: payload.email || null,
      profile_image_key: payload.profileImageKey || null,
      avatar_url: payload.avatarUrl || null,
      header_image_keys: payload.headerImageKeys || null,
      updated_at: new Date().toISOString(),
    }

    console.log('Patching user with profile fields', userId)
    const profilesRes = await patchTable('users', `id=eq.${encodeURIComponent(userId)}`, updatePayload)
    console.log('users patch', profilesRes.status, profilesRes.ok)
    console.log(profilesRes.data)
  } else {
    console.warn('Could not determine user id to persist profile-like fields')
  }

  console.log('Done')
}

run().catch(e => { console.error(e); process.exit(1) })
