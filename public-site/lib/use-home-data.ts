"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/api-client"
import type { Collection, Product, User } from "@shared/types"

/**
 * Home page data loading, shared by variants B and C.
 *
 * Differs from the (frozen) variant A loader in three ways that matter:
 *
 *  1. First paint does not wait for the whole catalogue. One page of gallery
 *     items lands, the page renders, and the rest streams in behind it.
 *     A fetches every page in a serial `await` loop before rendering anything.
 *  2. Failures surface as an error state with a retry, instead of a
 *     `console.error` and a permanently blank screen.
 *  3. It only calls endpoints the public worker actually serves. A also calls
 *     `/gallery/ids`, which is not registered under `/api/public/*` and 404s on
 *     every load.
 */

export const FIRST_PAGE_SIZE = 24
const BACKFILL_PAGE_SIZE = 60
/** Safety stop so a misbehaving API can never spin forever. */
const MAX_PAGES = 200

export type GalleryItem = {
  id: string
  productId: string | null
  title: string | null
  slug: string | null
  image: string
  srcSet?: string | null
  aspect?: string | number | null
  role?: string | null
  tags: string[]
  shortDescription?: string | null
}

export type SaleSchedule = {
  id: string
  saleName: string
  startDate: string
  endDate: string
  collectionId: string | null
}

export type HomeData = {
  status: "loading" | "ready" | "error"
  error: string | null
  retry: () => void
  /** True while later gallery pages are still streaming in behind the fold. */
  isBackfilling: boolean
  galleryItems: GalleryItem[]
  products: Product[]
  recipes: any[]
  collections: any[]
  user: User | null
  tagGroups: Record<string, string[]>
  /** productId -> the name of the sale currently running for it. */
  activeSaleMap: Map<string, string>
}

async function getJson(path: string): Promise<any> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

async function getJsonSafe(path: string, fallback: any): Promise<any> {
  try {
    return await getJson(path)
  } catch {
    return fallback
  }
}

function asArray(json: any): any[] {
  if (Array.isArray(json)) return json
  if (json && Array.isArray(json.data)) return json.data
  return []
}

function normalizeGalleryItem(raw: any): GalleryItem | null {
  const image = raw?.image || raw?.src || raw?.url || null
  if (!image) return null
  return {
    id: String(raw.id ?? image),
    productId: raw.productId ?? raw.product_id ?? null,
    title: raw.title ?? null,
    slug: raw.slug ?? null,
    image: String(image),
    srcSet: raw.srcSet ?? null,
    aspect: raw.aspect ?? null,
    role: raw.role ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : raw.tags ? [String(raw.tags)] : [],
    shortDescription: raw.shortDescription ?? raw.short_description ?? null,
  }
}

/** Rebuild lightweight product records from the flattened gallery feed. */
function productsFromGallery(items: GalleryItem[]): Product[] {
  const grouped = new Map<string, any>()
  for (const it of items) {
    const pid = it.productId || `p-${it.id}`
    let entry = grouped.get(pid)
    if (!entry) {
      entry = { id: it.productId || pid, slug: it.slug, title: it.title || "", tags: it.tags, images: [] }
      grouped.set(pid, entry)
    }
    entry.images.push({ url: it.image, aspect: it.aspect ?? null, role: it.role ?? null })
  }
  return Array.from(grouped.values()) as Product[]
}

function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== "object") return null
  const u: any = { ...raw }
  if (u.display_name && !u.displayName) u.displayName = u.display_name
  if (u.profile_image && !u.profileImage) u.profileImage = u.profile_image
  if (u.avatar_url && !u.avatarUrl) u.avatarUrl = u.avatar_url
  if (u.header_image_keys && !u.headerImageKeys) u.headerImageKeys = u.header_image_keys
  if (u.social_links && !u.socialLinks) u.socialLinks = u.social_links

  // socialLinks arrives as a JSON string, an array of {platform,url}, or a map.
  let links: any = u.socialLinks ?? null
  if (typeof links === "string") {
    try {
      links = JSON.parse(links)
    } catch {
      links = null
    }
  }
  if (Array.isArray(links)) {
    const map: Record<string, string> = {}
    for (const s of links) {
      if (!s?.url) continue
      map[(s.platform && String(s.platform).trim()) || s.username || s.url] = s.url
    }
    u.socialLinks = map
  } else if (links && typeof links === "object") {
    u.socialLinks = links
  } else {
    u.socialLinks = {}
  }

  if (typeof u.headerImageKeys === "string") {
    try {
      u.headerImageKeys = JSON.parse(u.headerImageKeys)
    } catch {
      u.headerImageKeys = [u.headerImageKeys]
    }
  }
  if (!Array.isArray(u.headerImageKeys)) u.headerImageKeys = []

  if (u.loading_animation?.url && !u.loadingAnimation) u.loadingAnimation = u.loading_animation
  return u as User
}

function normalizeRecipe(raw: any) {
  const r: any = { ...raw }
  if (raw.created_at && !raw.createdAt) r.createdAt = raw.created_at
  if (raw.short_description && !raw.shortDescription) r.shortDescription = raw.short_description
  const first = Array.isArray(r.images) ? r.images[0] : null
  if (first) {
    r.imageUrl = first.src || first.url || null
    r.imageWidth = first.width ?? null
    r.imageHeight = first.height ?? null
  } else if (Array.isArray(r.recipe_images) && r.recipe_images[0]) {
    r.imageUrl = r.recipe_images[0].src || null
  }
  if (!Array.isArray(r.pins)) r.pins = []
  return r
}

/** Attach real product objects to each collection's item list. */
function attachCollectionProducts(collections: any[], products: Product[]) {
  const byId = new Map(products.map((p) => [String(p.id), p]))
  return collections.map((c: any) => {
    const out: any = { ...c }
    if (Array.isArray(c.products) && c.products.length > 0) return out
    const refs = Array.isArray(c.items) ? c.items : []
    out.products = refs
      .map((it: any) => byId.get(String(it?.product_id ?? it?.productId ?? it?.id ?? "")))
      .filter(Boolean)
    return out
  })
}

function buildTagGroups(groupsJson: any, tagsJson: any): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const g of asArray(groupsJson)) {
    if (g?.name) groups[g.name] = []
  }
  for (const t of asArray(tagsJson)) {
    if (!t?.name) continue
    const key = t.group || "未分類"
    if (!groups[key]) groups[key] = []
    if (!groups[key].includes(t.name)) groups[key].push(t.name)
  }
  // Drop groups the API declared but that ended up with no tags.
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0))
}

export function useHomeData(): HomeData {
  const [status, setStatus] = useState<HomeData["status"]>("loading")
  const [error, setError] = useState<string | null>(null)
  const [isBackfilling, setIsBackfilling] = useState(false)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [rawCollections, setRawCollections] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [saleSchedules, setSaleSchedules] = useState<SaleSchedule[]>([])
  const [reloadToken, setReloadToken] = useState(0)

  const retry = useCallback(() => setReloadToken((n) => n + 1), [])

  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    setStatus("loading")
    setError(null)

    ;(async () => {
      try {
        // First page + all the small side resources go out together, so the
        // page can render as soon as the slowest of them lands.
        const [firstPage, colJson, recJson, profileJson, groupsJson, tagsJson, saleJson] = await Promise.all([
          getJson(`/gallery?limit=${FIRST_PAGE_SIZE}&offset=0&shuffle=true`),
          getJsonSafe("/collections", { data: [] }),
          getJsonSafe("/recipes", { data: [] }),
          getJsonSafe("/profile", null),
          getJsonSafe("/tag-groups", { data: [] }),
          getJsonSafe("/tags", { data: [] }),
          getJsonSafe("/amazon-sale-schedules", { data: [] }),
        ])
        if (!aliveRef.current) return

        const firstItems = asArray(firstPage).map(normalizeGalleryItem).filter(Boolean) as GalleryItem[]

        setGalleryItems(firstItems)
        setRecipes(asArray(recJson).map(normalizeRecipe).filter((r: any) => r.published !== false))
        setRawCollections(
          asArray(colJson).filter((c: any) => (c?.visibility ? c.visibility === "public" : true)),
        )
        setUser(normalizeUser(profileJson?.data ?? profileJson))
        setTagGroups(buildTagGroups(groupsJson, tagsJson))
        setSaleSchedules(asArray(saleJson) as SaleSchedule[])
        setStatus("ready")

        // Everything above the fold is on screen now; stream the remainder.
        const total = firstPage?.meta?.total
        const firstCount = firstItems.length
        if (firstCount < FIRST_PAGE_SIZE || (typeof total === "number" && firstCount >= total)) return

        setIsBackfilling(true)
        const seen = new Set(firstItems.map((i) => i.id))

        // Backfill from offset 0, NOT from the first page's length.
        //
        // The first page is fetched with `shuffle=true`, so its 24 items are a
        // random slice of the whole set. The backfill is unshuffled, so its
        // offsets index a completely different ordering. Starting the backfill
        // at offset 24 therefore skipped every product that sits in the first
        // 24 of the unshuffled order but wasn't among the random 24 — roughly
        // 15-20 of 112 never loaded. Walking the unshuffled list from 0 and
        // letting `seen` drop the duplicates covers all of them.
        let offset = 0

        for (let page = 0; page < MAX_PAGES; page++) {
          if (!aliveRef.current) return
          const json = await getJsonSafe(`/gallery?limit=${BACKFILL_PAGE_SIZE}&offset=${offset}`, null)
          if (!json) break
          const raw = asArray(json)
          if (raw.length === 0) break

          const fresh = (raw.map(normalizeGalleryItem).filter(Boolean) as GalleryItem[]).filter(
            (i) => !seen.has(i.id),
          )
          fresh.forEach((i) => seen.add(i.id))
          if (fresh.length > 0 && aliveRef.current) setGalleryItems((prev) => prev.concat(fresh))

          offset += raw.length
          if (raw.length < BACKFILL_PAGE_SIZE) break
          if (typeof total === "number" && offset >= total) break
        }
      } catch (e: any) {
        if (!aliveRef.current) return
        setError(e?.message ? String(e.message) : "読み込みに失敗しました")
        setStatus("error")
      } finally {
        if (aliveRef.current) setIsBackfilling(false)
      }
    })()

    return () => {
      aliveRef.current = false
    }
  }, [reloadToken])

  const products = useMemo(() => productsFromGallery(galleryItems), [galleryItems])
  const collections = useMemo(
    () => attachCollectionProducts(rawCollections, products),
    [rawCollections, products],
  )

  // A sale applies to a collection, so every product in that collection carries
  // its badge for as long as the window is open.
  const activeSaleMap = useMemo(() => {
    const map = new Map<string, string>()
    const now = Date.now()
    for (const sale of saleSchedules) {
      const start = Date.parse(sale.startDate)
      const end = Date.parse(sale.endDate)
      if (Number.isNaN(start) || Number.isNaN(end)) continue
      if (now < start || now > end) continue
      const collection = collections.find((c: any) => String(c.id) === String(sale.collectionId))
      for (const product of collection?.products || []) {
        map.set(String(product.id), sale.saleName)
      }
    }
    return map
  }, [saleSchedules, collections])

  return {
    status,
    error,
    retry,
    isBackfilling,
    galleryItems,
    products,
    recipes,
    collections,
    user,
    tagGroups,
    activeSaleMap,
  }
}
