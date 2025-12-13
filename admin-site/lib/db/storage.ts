import type { Product, Recipe, Collection, User, CustomFont } from "@/lib/db/schema"
import { getPublicImageUrl } from "@/lib/image-url"
import apiFetchBase, { apiPath } from '@/lib/api-client'

// Wrapper that uses shared api-client and attaches X-User-Id header when available
async function apiFetch(method: string, path: string, body?: any) {
  try {
    // Attempt to read local mirror of auth user
    let userId: string | null = null
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('auth_user')
        if (raw) {
          try { const parsed = JSON.parse(raw); userId = parsed?.id || null } catch {}
        }
        // Also support runtime __env__ override
        if (!userId && (window as any).__env__?.USER_ID) userId = (window as any).__env__.USER_ID
      }
    } catch (e) {}

    const headers: Record<string,string> = { 'Content-Type': 'application/json' }
    if (userId) headers['X-User-Id'] = userId

    const res = await apiFetchBase(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    const data = await res.json().catch(() => null)
    return data
  } catch (err: any) {
    console.error('[v0] apiFetch error', method, path, err?.message || err)
    return null
  }
}

function resolveUserId(fallback?: string | undefined) {
  try {
    if (fallback) return fallback
    // Prefer cached users (warmCache sets this). Fallback to localStorage mirror.
    const owner = (caches.users || [])[0]
    if (owner && owner.id) return owner.id
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        try { const p = JSON.parse(raw); if (p?.id) return p.id } catch {}
      }
      if ((window as any).__env__?.USER_ID) return (window as any).__env__?.USER_ID
    }
  } catch (e) {}
  return undefined
}

// In-memory caches. These are NOT persisted to localStorage—volatile only.
const caches: Record<string, any> = {
  products: [] as Product[],
  recipes: [] as Recipe[],
  recipeImages: [] as any[],
  recipeItems: [] as any[],
  collections: [] as Collection[],
  collectionItems: [] as any[],
  users: [] as User[],
  theme: null as any,
  tags: [] as any[],
  tagGroups: [] as any[],
  customFonts: [] as CustomFont[],
  imageUploads: {} as Record<string, string>,
  recipePins: [] as any[],
  amazonSaleSchedules: [] as any[],
}

// On-load: warm caches by fetching from server endpoints (best-effort).
async function warmCache(key: string, path: string) {
  try {
    const data = await apiFetch("GET", path)
    // Many server endpoints return a wrapper like { data: [...] }.
    // Unwrap common shapes so caches store the actual arrays/objects expected by callers.
      if (data != null) {
        let value: any = data
        // Unwrap common wrapper shapes like { data: [...] } or { data: {...} }
        if (typeof data === "object" && data !== null && ("data" in data)) {
          // @ts-ignore
          value = data.data
        }

        // Normalize `users` to always be an array (server may return single object or wrapped object)
        if (key === "users") {
          if (!Array.isArray(value) && value) {
            caches[key] = [value]
          } else {
            caches[key] = value || []
          }
        } else {
          caches[key] = value
        }
      }
  } catch (err) {
    // ignore — we'll serve empty/previous cache
  }
}

// Start warming common caches (disabled by default - module-load warm is no-op)
// To avoid unnecessary parallel initial fetches from the admin UI,
// disable automatic warm on module evaluation. Call individual
// `db.*.refresh()` from page-level code when needed.
const ENABLE_WARM_CACHE = false

if (typeof window !== "undefined" && ENABLE_WARM_CACHE) {
  ;(async () => {
    warmCache("products", "/api/products")
    warmCache("recipes", "/api/recipes")
    warmCache("collections", "/api/collections")
    warmCache("tags", "/api/tags")
    warmCache("tagGroups", "/api/tag-groups")
    warmCache("users", "/api/profile")
    warmCache("customFonts", "/api/custom-fonts")
    warmCache("recipePins", "/api/recipe-pins")
    warmCache("amazonSaleSchedules", "/api/amazon-sale-schedules")
    // site settings (loading animation etc.)
    // The login page is public and does not need site-settings. Avoid
    // warming site settings when the user is on the login page to prevent
    // unnecessary /api calls and auth churn during unauthenticated views.
    try {
      const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : ''
      if (!pathname.startsWith('/admin/login')) {
        warmCache("siteSettings", "/api/site-settings")
      }
    } catch (e) {
      // ignore and do not warm
    }
  })()
} else {
  // intentionally no-op on module load
}

function nowISO() {
  return new Date().toISOString()
}

export const db = {
  // products
  products: {
    getAll: (userId?: string) => {
      const items: Product[] = caches.products || []
      return userId ? items.filter((p: any) => p.userId === userId) : items
    },
    // Refresh products from server and update cache. Returns the fresh list.
    refresh: async (userId?: string) => {
      try {
        const data = await apiFetch("GET", "/api/products")
        let items: any = []
        if (data != null) {
          if (typeof data === "object" && data !== null && "data" in data) {
            items = data.data
          } else {
            items = data
          }
        }
        // Normalize to array
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.products = items
        return userId ? items.filter((p: any) => p.userId === userId) : items
      } catch (e) {
        console.error("[v0] products.refresh failed", e)
        return (caches.products || []).filter((p: any) => (userId ? p.userId === userId : true))
      }
    },
    // Admin-specific refresh: use admin API endpoints which rely on server-side
    // session cookies (HttpOnly) and admin routing. Prefer this in admin pages.
    refreshAdmin: async (userId?: string) => {
      try {
        const path = userId ? `/api/admin/products?user_id=${encodeURIComponent(userId)}` : '/api/admin/products'
        const res = await apiFetch("GET", path)
        let items: any = []
        if (res != null) {
          if (typeof res === "object" && res !== null && "data" in res) {
            items = res.data
          } else {
            items = res
          }
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.products = items
        return userId ? items.filter((p: any) => p.userId === userId) : items
      } catch (e) {
        console.error('[v0] products.refreshAdmin failed', e)
        return (caches.products || []).filter((p: any) => (userId ? p.userId === userId : true))
      }
    },
    // Admin count helper: return total count via admin API (uses count=true)
    countAdmin: async (userId?: string) => {
      try {
        const path = userId ? `/api/admin/products?count=true&limit=0&user_id=${encodeURIComponent(userId)}` : '/api/admin/products?count=true&limit=0'
        const res = await apiFetch('GET', path)
        if (!res) return null
        try {
          const json = await res.json().catch(() => null)
          return json?.meta?.total ?? null
        } catch (e) {
          return null
        }
      } catch (e) {
        return null
      }
    },
    getById: (id: string) => {
      return (caches.products || []).find((p: any) => p.id === id) || null
    },
    create: (product: Product) => {
      const resolvedUserId = resolveUserId((product as any)?.userId)
      const obj = { ...product, userId: resolvedUserId || (product as any)?.userId, createdAt: product.createdAt || nowISO(), updatedAt: product.updatedAt || nowISO() }
      caches.products = [...(caches.products || []), obj]
      // best-effort send to server (fire-and-log)
      apiFetch("POST", "/api/admin/products", obj)
        .then((r) => {
          if (!r) console.warn("[v0] Failed to persist product to server")
        })
        .finally(() => {
          try {
            ;(db.collections as any)?.refresh?.().catch(() => {})
            ;(db.recipePins as any)?.refresh?.().catch(() => {})
          } catch (e) {}
        })
      return obj
    },
    update: (id: string, updates: Partial<Product>) => {
      caches.products = (caches.products || []).map((p: any) => (p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p))
      apiFetch("PUT", `/api/admin/products/${encodeURIComponent(id)}`, updates)
        .then((r) => r)
        .catch((e) => console.error(e))
        .finally(() => {
          try {
            ;(db.collections as any)?.refresh?.().catch(() => {})
            ;(db.recipePins as any)?.refresh?.().catch(() => {})
          } catch (e) {
            // ignore
          }
        })
    },
    delete: (id: string) => {
      caches.products = (caches.products || []).filter((p: any) => p.id !== id)
      apiFetch("DELETE", `/api/admin/products/${encodeURIComponent(id)}`)
        .finally(() => {
          try {
            ;(db.collections as any)?.refresh?.().catch(() => {})
            ;(db.recipePins as any)?.refresh?.().catch(() => {})
          } catch (e) {}
        })
    },
  },

  // recipes
  recipes: {
    getAll: (userId?: string) => {
      const items = caches.recipes || []
      if (userId) return items.filter((r: any) => r.userId === userId)
      // If no userId provided, prefer to show only the configured public profile owner's recipes
      const owner = (caches.users || [])[0]
      if (owner && owner.id) return items.filter((r: any) => r.userId === owner.id)
      return items
    },
    // Refresh recipes from server and update cache. Returns the fresh list.
    refresh: async (userId?: string) => {
      try {
        // Include user_id in query when available so the public-worker
        // can trust and return only this user's recipes (avoids 401s).
        const path = userId ? `/api/recipes?user_id=${encodeURIComponent(userId)}` : '/api/recipes'
        try {
          console.log('[v0] recipes.refresh: fetching', path)
        } catch (e) {}
        const data = await apiFetch("GET", path)
        try { console.log('[v0] recipes.refresh: fetched', Array.isArray(data) ? data.length : (data && data.data ? (Array.isArray(data.data) ? data.data.length : 1) : 0)) } catch (e) {}
        let items: any = []
        if (data != null) {
          if (typeof data === "object" && data !== null && "data" in data) {
            items = data.data
          } else {
            items = data
          }
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.recipes = items
        if (userId) return items.filter((r: any) => r.userId === userId)
        const owner = (caches.users || [])[0]
        if (owner && owner.id) return items.filter((r: any) => r.userId === owner.id)
        return items
      } catch (e) {
        console.error('[v0] recipes.refresh failed', e)
        return (caches.recipes || [])
      }
    },
    getById: (id: string) => {
      const r = (caches.recipes || []).find((r: any) => r.id === id) || null
      if (!r) return null
      // Prefer pins embedded on the recipe row (server-provided), else fall back to cached recipePins
      const pinsFromRow = Array.isArray((r as any).pins) ? (r as any).pins : null
      const pins = pinsFromRow || (caches.recipePins || []).filter((p: any) => p.recipeId === id)
      return { ...r, pins }
    },
    create: (recipe: any) => {
      const owner = (caches.users || [])[0]
      const resolvedUserId = recipe.userId || recipe.userId || owner?.id || "user-shirasame"
      const full = { id: recipe.id || `recipe-${Date.now()}`, userId: resolvedUserId, pins: [], createdAt: nowISO(), updatedAt: nowISO(), ...recipe }
      caches.recipes = [...(caches.recipes || []), full]
      // best-effort persist (server endpoint may not exist); include userId so server can enforce owner
      apiFetch("POST", "/api/admin/recipes", full)
      return full
    },
    update: (id: string, updates: any) => {
      // Prevent clients from reassigning recipes to other users — force owner if available
      const owner = (caches.users || [])[0]
      const safeUpdates = { ...updates }
      if (owner && owner.id) safeUpdates.userId = owner.id
      caches.recipes = (caches.recipes || []).map((r: any) => (r.id === id ? { ...r, ...safeUpdates, updatedAt: nowISO() } : r))
      apiFetch("PUT", `/api/admin/recipes/${encodeURIComponent(id)}`, safeUpdates)
    },
    delete: (id: string) => {
      // Restrict delete to owner's recipes by default (client-side best-effort)
      const owner = (caches.users || [])[0]
      const existing = (caches.recipes || []).find((r: any) => r.id === id)
      if (existing && owner && owner.id && existing.userId !== owner.id) {
        console.warn('[v0] attempt to delete recipe not owned by PUBLIC_PROFILE_EMAIL — ignored')
        return
      }
      caches.recipes = (caches.recipes || []).filter((r: any) => r.id !== id)
      // remove pins
      caches.recipePins = (caches.recipePins || []).filter((p: any) => p.recipeId !== id)
      apiFetch("DELETE", `/api/admin/recipes/${encodeURIComponent(id)}`)
    },
    togglePublish: (id: string) => {
      caches.recipes = (caches.recipes || []).map((r: any) => (r.id === id ? { ...r, published: !r.published } : r))
      // push update
      const rec = (caches.recipes || []).find((r: any) => r.id === id)
      apiFetch("PUT", `/api/admin/recipes/${encodeURIComponent(id)}`, { published: rec?.published })
    },
  },

  // recipeImages (best-effort cache + server)
  recipeImages: {
    getByRecipeId: (recipeId: string) => (caches.recipeImages || []).find((img: any) => img.recipeId === recipeId) || null,
    upsert: (image: any) => {
      const existing = (caches.recipeImages || []).find((i: any) => i.recipeId === image.recipeId)
      if (existing) {
        caches.recipeImages = (caches.recipeImages || []).map((i: any) => (i.recipeId === image.recipeId ? image : i))
      } else {
        caches.recipeImages = [...(caches.recipeImages || []), image]
      }
      apiFetch("POST", "/api/admin/recipe-images/upsert", { ...(image || {}), userId: resolveUserId((image as any)?.userId) })
    },
  },

  // recipeItems
  recipeItems: {
    getByRecipeId: (recipeId: string) => (caches.recipeItems || []).filter((it: any) => it.recipeId === recipeId),
    create: (item: any) => {
      caches.recipeItems = [...(caches.recipeItems || []), item]
      apiFetch("POST", "/api/admin/recipe-items", { ...(item || {}), userId: resolveUserId((item as any)?.userId) })
      return item
    },
    update: (id: string, updates: any) => {
      caches.recipeItems = (caches.recipeItems || []).map((it: any) => (it.id === id ? { ...it, ...updates } : it))
      apiFetch("PUT", `/api/admin/recipe-items/${encodeURIComponent(id)}`, updates)
    },
    delete: (id: string) => {
      caches.recipeItems = (caches.recipeItems || []).filter((it: any) => it.id !== id)
      apiFetch("DELETE", `/api/admin/recipe-items/${encodeURIComponent(id)}`)
    },
    bulkUpdate: (items: any[]) => {
      caches.recipeItems = items
      apiFetch("POST", "/api/admin/recipe-items/bulk", { items: items.map((it: any) => ({ ...(it||{}), userId: resolveUserId((it as any)?.userId) })) })
    },
  },

  // collections
  collections: {
    getAll: (userId?: string) => {
      const items = caches.collections || []
      return userId ? items.filter((c: any) => c.userId === userId) : items
    },
    // Refresh collections from server and update cache. Returns the fresh list.
    refresh: async (userId?: string) => {
      try {
        const data = await apiFetch('GET', '/api/collections')
        let items: any = []
        if (data != null) {
          if (typeof data === 'object' && data !== null && 'data' in data) items = data.data
          else items = data
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.collections = items
        return userId ? items.filter((c: any) => c.userId === userId) : items
      } catch (e) {
        console.error('[v0] collections.refresh failed', e)
        return (caches.collections || []).filter((c: any) => (userId ? c.userId === userId : true))
      }
    },
    getById: (id: string) => (caches.collections || []).find((c: any) => c.id === id) || null,
    create: (collection: any) => {
      const full = { id: collection.id || `col-${Date.now()}`, createdAt: nowISO(), updatedAt: nowISO(), ...collection }
      caches.collections = [...(caches.collections || []), full]
      apiFetch("POST", "/api/admin/collections", { ...full, userId: resolveUserId((full as any)?.userId) })
      return full
    },
    update: (id: string, updates: any) => {
      caches.collections = (caches.collections || []).map((c: any) => (c.id === id ? { ...c, ...updates, updatedAt: nowISO() } : c))
      apiFetch("PUT", `/api/admin/collections/${encodeURIComponent(id)}`, updates)
    },
    delete: (id: string) => {
      caches.collections = (caches.collections || []).filter((c: any) => c.id !== id)
      apiFetch("DELETE", `/api/admin/collections/${encodeURIComponent(id)}`)
    },
  },

  // collectionItems
  collectionItems: {
    getByCollectionId: (collectionId: string) => (caches.collectionItems || []).filter((it: any) => it.collectionId === collectionId),
    addProduct: (collectionId: string, productId: string) => {
      const items = caches.collectionItems || []
      const maxOrder = Math.max(0, ...items.filter((i: any) => i.collectionId === collectionId).map((i: any) => i.order || 0))
      const newItem = { id: `col-item-${Date.now()}`, collectionId, productId, order: maxOrder + 1, addedAt: nowISO() }
      caches.collectionItems = [...items, newItem]
      apiFetch("POST", "/api/admin/collection-items", { ...newItem, userId: resolveUserId((newItem as any)?.userId) })
    },
    removeProduct: (collectionId: string, productId: string) => {
      caches.collectionItems = (caches.collectionItems || []).filter((it: any) => !(it.collectionId === collectionId && it.productId === productId))
      apiFetch("DELETE", "/api/admin/collection-items", { collectionId, productId, userId: resolveUserId() })
    },
  },

  // user
  user: {
    get: (userId?: string) => {
      const users = caches.users || []
      if (userId) return users.find((u: any) => u.id === userId) || null
      return users.length > 0 ? users[0] : null
    },
    create: (user: User) => {
      caches.users = [...(caches.users || []), user]
      apiFetch("POST", "/api/admin/users", { ...user, userId: resolveUserId((user as any)?.id) })
    },
    update: (userId: string, updates: Partial<User>) => {
      caches.users = (caches.users || []).map((u: any) => (u.id === userId ? { ...u, ...updates } : u))
      apiFetch("PUT", `/api/admin/users/${encodeURIComponent(userId)}`, updates)
    },
    addFavoriteFont: (userId: string, fontFamily: string) => {
      caches.users = (caches.users || []).map((u: any) => (u.id === userId ? { ...u, favoriteFonts: Array.from(new Set([...(u.favoriteFonts || []), fontFamily])) } : u))
      apiFetch("POST", `/api/admin/users/${encodeURIComponent(userId)}/favorite-fonts`, { fontFamily })
    },
    removeFavoriteFont: (userId: string, fontFamily: string) => {
      caches.users = (caches.users || []).map((u: any) => (u.id === userId ? { ...u, favoriteFonts: (u.favoriteFonts || []).filter((f: string) => f !== fontFamily) } : u))
      apiFetch("DELETE", `/api/admin/users/${encodeURIComponent(userId)}/favorite-fonts`, { fontFamily })
    },
    getFavoriteFonts: (userId: string) => {
      const usersRaw = caches.users
      const usersArr = Array.isArray(usersRaw) ? usersRaw : usersRaw ? [usersRaw] : []
      const user = usersArr.find((u: any) => u && u.id === userId)
      return (user && Array.isArray(user.favoriteFonts) ? user.favoriteFonts : [])
    },
  },

  // theme
  theme: {
    get: () => caches.theme,
    set: (theme: any) => {
      caches.theme = theme
      apiFetch("POST", "/api/admin/theme", { theme, userId: resolveUserId() })
    },
  },

  // siteSettings cache (key -> value)
  siteSettings: {
    get: () => caches.siteSettings || {},
    getValue: (key: string) => (caches.siteSettings || {})[key],
    refresh: async () => {
      try {
        const data = await apiFetch('GET', '/api/site-settings')
        if (data && typeof data === 'object' && 'data' in data) {
          caches.siteSettings = data.data || {}
        } else {
          caches.siteSettings = data || {}
        }
        return caches.siteSettings
      } catch (e) {
        console.error('[v0] siteSettings.refresh failed', e)
        return caches.siteSettings || {}
      }
    },
  },

  // images: no localStorage — use server to persist metadata. getUpload returns in-memory cache URL if present
  images: {
    // Save a local upload preview keyed by object key, and inform server.
    // If `url` is a data URL (base64), upload the binary to the server immediately
    // so R2 + DB are updated. If `url` is already a key or public URL, persist key-only.
    saveUpload: async (key: string, url?: string | null) => {
      caches.imageUploads = { ...(caches.imageUploads || {}), [key]: url }

      // If caller passed a data URL (client-side capture), convert to Blob and upload
      try {
          if (url && typeof url === 'string' && url.startsWith('data:')) {
            // Convert data URL to Blob using fetch
            try {
              const blob = await (await fetch(url)).blob()
              const fd = new FormData()
              // try to preserve original filename via key suffix
              const inferredName = (key || 'upload').toString().split('/').pop() || 'upload'
              fd.append('file', new File([blob], inferredName, { type: blob.type || 'application/octet-stream' }))
              // Include requested key so worker can store under the same identifier
              if (key) fd.append('key', String(key))
              // Upload to the public worker; it will persist metadata when possible
              const up = await apiFetchBase('/api/images/upload', { method: 'POST', body: fd })
              const upj = await up.json().catch(() => null)
              const returnedKey = upj?.result?.key || upj?.key || null
              if (returnedKey) {
                // Map returnedKey to the same preview data
                caches.imageUploads = { ...(caches.imageUploads || {}), [returnedKey]: caches.imageUploads[key] }
                // Persist metadata explicitly (compat); public-worker may already have persisted
                try {
                  // Persist metadata by calling the admin proxy `/api/images/save` so browser-origin calls go through admin
                  apiFetch('POST', '/api/images/save', { key: returnedKey })
                    .then((r) => {
                      if (!r) console.warn('[v0] images.saveUpload: server save failed')
                    })
                    .catch(() => {
                      console.warn('[v0] images.saveUpload: server save failed')
                    })
                } catch (e) {
                  // ignore
                }
                return returnedKey
              }
              // Fall through to key-only persist if upload didn't return a key
            } catch (e) {
              console.warn('[v0] images.saveUpload: failed to upload data URL', e)
            }
          }

        // If url is already a key or public URL, persist key-only
        const persistKey = (url && typeof url === 'string' && !url.startsWith('http') && !url.startsWith('/')) ? url : key
        // Best-effort: call the images/complete endpoint via apiPath so BUILD_API_BASE is respected
        try {
          apiFetch('POST', '/api/images/save', { key: persistKey })
            .then((r) => {
              if (!r) console.warn('[v0] images.saveUpload: server save failed')
            })
            .catch(() => {
              console.warn('[v0] images.saveUpload: server save failed')
            })
        } catch (e) {
          console.warn('[v0] images.saveUpload: call failed', e)
        }
        return persistKey
      } catch (err) {
        console.error('[v0] images.saveUpload error', err)
      }
      return null
    },
    getUpload: (key: string) => {
      const raw = (caches.imageUploads || {})[key]
      if (!raw) return raw
      try {
        // Normalize to the canonical public domain URL when possible. If `raw` is a key, getPublicImageUrl will map it.
        const normalized = getPublicImageUrl(raw)
        return normalized || raw
      } catch (e) {
        return raw
      }
    },
  },

  // tags
  tags: {
    getAll: () => caches.tags || [],
    getAllWithPlaceholders: () => caches.tags || [],
    saveAll: (tags: any[]) => {
      caches.tags = tags
      apiFetch("POST", "/api/admin/tags/save", { tags, userId: resolveUserId() })
    },
    getCustomTags: () => (caches.tags || []).filter((t: any) => t.category === "カスタム").map((t: any) => t.name),
    saveCustomTags: (tags: string[]) => {
      apiFetch("POST", "/api/admin/tags/custom", { tags, userId: resolveUserId() })
      // update cache best-effort
      const existing = caches.tags || []
      const customTags = tags.map((name) => ({ id: `tag-${Date.now()}-${Math.random()}`, name, category: "カスタム", userId: "user-shirasame", createdAt: nowISO() }))
      caches.tags = [...existing.filter((t: any) => t.category !== "カスタム"), ...customTags]
    },
    saveCategoryTags: (category: string, tags: string[]) => {
      apiFetch("POST", "/api/admin/tags/category", { category, tags, userId: resolveUserId() })
      // update cache
      const existing = caches.tags || []
      const categoryTags = tags.map((name) => ({ id: `tag-${Date.now()}-${Math.random()}`, name, category, userId: null, createdAt: nowISO() }))
      caches.tags = [...existing.filter((t: any) => t.category !== category), ...categoryTags]
    },
  },

  // recipePins
  recipePins: {
    getByRecipeId: (recipeId: string) => (caches.recipePins || []).filter((p: any) => p.recipeId === recipeId),
    // Refresh recipePins cache from server. If recipeId provided, fetch only that recipe's pins.
    refresh: async (recipeId?: string) => {
      try {
        const path = recipeId ? `/api/recipe-pins?recipeId=${encodeURIComponent(recipeId)}` : '/api/recipe-pins'
        const data = await apiFetch('GET', path)
        let items: any = []
        if (data != null) {
          if (typeof data === 'object' && data !== null && 'data' in data) items = data.data
          else items = data
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        // Merge: keep other recipePins for other recipes and update fetched ones
        if (recipeId) {
          const other = (caches.recipePins || []).filter((p: any) => p.recipeId !== recipeId)
          caches.recipePins = [...other, ...items]
        } else {
          caches.recipePins = items
        }
        return caches.recipePins
      } catch (e) {
        console.error('[v0] recipePins.refresh failed', e)
        return caches.recipePins || []
      }
    },
    create: (pin: any) => {
      caches.recipePins = [...(caches.recipePins || []), pin]
      apiFetch("POST", "/api/admin/recipe-pins", { ...(pin||{}), userId: resolveUserId((pin as any)?.userId) })
      return pin
    },
    updateAll: (recipeId: string, pins: any[]) => {
      caches.recipePins = [...(caches.recipePins || []).filter((p: any) => p.recipeId !== recipeId), ...pins]
      // Persist and then refresh cache for that recipe to pick up any DB-side transforms/ids
      // Return the promise so callers can await persistence if needed (e.g. on save flow)
      return apiFetch("POST", "/api/admin/recipe-pins/bulk", { recipeId, pins: (pins || []).map((p: any) => ({ ...(p||{}), userId: resolveUserId((p as any)?.userId) })) })
        .then(() => {
          return db.recipePins.refresh(recipeId).catch(() => null)
        })
        .catch((err) => {
          console.error('[v0] recipePins.updateAll api error', err)
          throw err
        })
    },
    deleteById: (id: string) => {
      caches.recipePins = (caches.recipePins || []).filter((p: any) => p.id !== id)
      apiFetch("DELETE", `/api/admin/recipe-pins/${encodeURIComponent(id)}`)
    },
    deleteByRecipeId: (recipeId: string) => {
      caches.recipePins = (caches.recipePins || []).filter((p: any) => p.recipeId === recipeId)
      apiFetch("DELETE", "/api/admin/recipe-pins", { recipeId })
    },
  },

  // amazonSaleSchedules
  amazonSaleSchedules: {
    getAll: (userId?: string) => (userId ? (caches.amazonSaleSchedules || []).filter((s: any) => s.userId === userId) : caches.amazonSaleSchedules || []),
    getById: (id: string) => (caches.amazonSaleSchedules || []).find((s: any) => s.id === id) || null,
    // Refresh schedules from server and update cache. Returns the fresh list.
    refresh: async (userId?: string) => {
      try {
        const data = await apiFetch('GET', '/api/amazon-sale-schedules')
        let items: any = []
        if (data != null) {
          if (typeof data === 'object' && data !== null && 'data' in data) items = data.data
          else items = data
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.amazonSaleSchedules = items
        return userId ? items.filter((s: any) => s.userId === userId) : items
      } catch (e) {
        console.error('[v0] amazonSaleSchedules.refresh failed', e)
        return (caches.amazonSaleSchedules || []).filter((s: any) => (userId ? s.userId === userId : true))
      }
    },
    create: (schedule: any) => {
      const newSchedule = { id: `sale-${Date.now()}`, ...schedule, createdAt: nowISO(), updatedAt: nowISO() }
      caches.amazonSaleSchedules = [...(caches.amazonSaleSchedules || []), newSchedule]
      apiFetch("POST", "/api/admin/amazon-sale-schedules", { ...(newSchedule||{}), userId: resolveUserId((newSchedule as any)?.userId) })
      return newSchedule
    },
    update: (id: string, updates: any) => {
      caches.amazonSaleSchedules = (caches.amazonSaleSchedules || []).map((s: any) => (s.id === id ? { ...s, ...updates, updatedAt: nowISO() } : s))
      apiFetch("PUT", `/api/admin/amazon-sale-schedules/${encodeURIComponent(id)}`, updates)
    },
    delete: (id: string) => {
      caches.amazonSaleSchedules = (caches.amazonSaleSchedules || []).filter((s: any) => s.id !== id)
      apiFetch("DELETE", `/api/admin/amazon-sale-schedules/${encodeURIComponent(id)}`)
    },
    getActiveSchedules: (userId?: string) => {
      const now = new Date()
      const schedules = caches.amazonSaleSchedules || []
      const active = schedules.filter((s: any) => new Date(s.startDate) <= now && now <= new Date(s.endDate))
      return userId ? active.filter((s: any) => s.userId === userId) : active
    },
  },

  // customFonts
  customFonts: {
    // userId optional: when omitted, return all custom fonts in cache
    getAll: (userId?: string) => (userId ? (caches.customFonts || []).filter((f: any) => f.userId === userId) : caches.customFonts || []),
    getById: (id: string) => (caches.customFonts || []).find((f: any) => f.id === id) || null,
    // Refresh custom fonts from server and update cache. Returns the fresh list.
    refresh: async (userId?: string) => {
      try {
        const data = await apiFetch('GET', '/api/custom-fonts')
        let items: any = []
        if (data != null) {
          if (typeof data === 'object' && data !== null && 'data' in data) items = data.data
          else items = data
        }
        if (!Array.isArray(items)) items = items ? [items] : []
        caches.customFonts = items
        return userId ? items.filter((f: any) => f.userId === userId) : items
      } catch (e) {
        console.error('[v0] customFonts.refresh failed', e)
        return (caches.customFonts || []).filter((f: any) => (userId ? f.userId === userId : true))
      }
    },
    create: (font: any) => {
      const newFont = { id: `custom-font-${Date.now()}`, ...font, createdAt: nowISO() }
      caches.customFonts = [...(caches.customFonts || []), newFont]
      apiFetch("POST", "/api/admin/custom-fonts", { ...(newFont||{}), userId: resolveUserId((newFont as any)?.userId) })
      return newFont
    },
    delete: (id: string) => {
      caches.customFonts = (caches.customFonts || []).filter((f: any) => f.id !== id)
      apiFetch("DELETE", `/api/admin/custom-fonts/${encodeURIComponent(id)}`)
    },
  },

  // initialize/reset: no-op for persistence, but we can optionally warm caches
  initialize: (_mockData: any) => {
    // do not write to localStorage. Optionally kick off a cache warm if provided.
    if (_mockData?.products) caches.products = _mockData.products
  },
  reset: () => {
    // clear in-memory caches only
    Object.keys(caches).forEach((k) => (caches[k] = Array.isArray(caches[k]) ? [] : null))
    console.log("[v0] DB: Reset in-memory caches (no local storage used)")
  },
}

export default db
