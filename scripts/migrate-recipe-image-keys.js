#!/usr/bin/env node
/*
Migration script: migrate recipes.recipe_image_keys -> recipe_images
Usage:
  Set env vars SUPABASE_URL and SERVICE_ROLE_KEY, then run:
    node scripts/migrate-recipe-image-keys.js
Options:
  --clear-legacy   : after inserting, PATCH recipes to set recipe_image_keys = NULL

This script uses Supabase REST API (service role) to read recipes and insert missing recipe_images rows.
*/

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variable. Aborting.')
  process.exit(1)
}

const CLEAR_LEGACY = process.argv.includes('--clear-legacy')

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} - ${url}`)
  return res.json()
}

function deriveBasePathFromUrl(urlOrKey) {
  if (!urlOrKey) return null
  try {
    let key = String(urlOrKey)
    // If a full URL, get pathname
    if (/^https?:\/\//i.test(key)) {
      try {
        const u = new URL(key)
        key = u.pathname.replace(/^\/+/, '')
      } catch {}
    }
    // Remove leading bucket if present (common mistake)
    // We consider keys that already start with images/ to be OK
    key = key.replace(/^\/+/, '')
    // Collapse multiple slashes
    key = key.replace(/\/+/g, '/')
    // Ensure it begins with images/ (normalize to images/...) only if it doesn't look like yyyy/.. (assume R2 basePath is like yyyy/... or uploads/...)
    // For safety, if key already starts with 'images/', keep it. Otherwise return key as-is.
    return key || null
  } catch (e) {
    return null
  }
}

async function getRecipesWithKeys() {
  // Fetch recipes that have non-empty recipe_image_keys
  // Supabase REST syntax: recipe_image_keys=not.is.null
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/recipes?select=id,recipe_image_keys&recipe_image_keys=not.is.null&limit=1000`
  return fetchJson(url)
}

async function getRecipeImagesForRecipe(recipeId) {
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/recipe_images?select=key,recipe_id&recipe_id=eq.${encodeURIComponent(recipeId)}`
  return fetchJson(url)
}

async function insertRecipeImages(items) {
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/recipe_images`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(items)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Insert failed: ${res.status} ${res.statusText} ${text}`)
  }
  return res.json()
}

async function clearRecipeImageKeys(recipeId) {
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/recipes?id=eq.${encodeURIComponent(recipeId)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ recipe_image_keys: null })
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`Failed to clear recipe_image_keys for ${recipeId}: ${res.status} ${res.statusText} ${t}`)
  }
  return res.json()
}

async function main() {
  console.log('Fetching recipes with legacy recipe_image_keys...')
  const recipes = await getRecipesWithKeys()
  console.log(`Found ${recipes.length} recipes with recipe_image_keys.`)
  let totalInserted = 0
  for (const r of recipes) {
    const recipeId = r.id
    let keys = r.recipe_image_keys
    if (!keys) continue
    if (typeof keys === 'string') {
      try { keys = JSON.parse(keys) } catch { keys = [keys] }
    }
    if (!Array.isArray(keys) || keys.length === 0) continue
    // fetch existing recipe_images to avoid duplicates
    const existing = await getRecipeImagesForRecipe(recipeId)
    const existingKeys = new Set((existing || []).map(e => String(e.key)))
    const toInsert = []
    for (const rawKey of keys) {
      if (!rawKey) continue
      const basePath = deriveBasePathFromUrl(rawKey)
      // ensure key is basePath string and not duplicate
      if (!basePath) continue
      if (existingKeys.has(basePath)) continue
      // Insert with role='main'
      toInsert.push({ recipe_id: recipeId, key: basePath, role: 'main' })
    }
    if (toInsert.length > 0) {
      console.log(`Inserting ${toInsert.length} recipe_images for recipe ${recipeId}`)
      const ins = await insertRecipeImages(toInsert)
      totalInserted += Array.isArray(ins) ? ins.length : 0
    } else {
      console.log(`No new images to insert for recipe ${recipeId}`)
    }
    if (CLEAR_LEGACY) {
      console.log(`Clearing legacy recipe_image_keys for ${recipeId}`)
      await clearRecipeImageKeys(recipeId)
    }
  }
  console.log(`Done. Total inserted: ${totalInserted}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
