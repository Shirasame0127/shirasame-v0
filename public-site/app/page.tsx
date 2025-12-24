"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import dynamic from 'next/dynamic'
const ProfileCard = dynamic(() => import('@/components/profile-card').then((m) => m.ProfileCard), { ssr: false, loading: () => null })
const ProductCardSimple = dynamic(() => import('@/components/product-card-simple').then((m) => m.ProductCardSimple), { ssr: false, loading: () => <div className="h-24 bg-muted" /> })
const ProductDetailModal = dynamic(() => import('@/components/product-detail-modal').then((m) => m.ProductDetailModal), { ssr: false, loading: () => null })
const RecipeDisplay = dynamic(() => import('@/components/recipe-display').then((m) => m.RecipeDisplay), { ssr: false, loading: () => <div className="h-48 bg-muted" /> })
const ProductMasonry = dynamic(() => import('@/components/product-masonry').then((m) => m.default), { ssr: false, loading: () => <div className="h-32" /> })

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, List, Filter, SortAsc, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { PublicNav } from "@/components/public-nav"
import InitialLoading from '@/components/initial-loading'
import { ProfileHeader } from "@/components/profile-header"
import { apiFetch } from "@/lib/api-client"
import type { Product, Collection, User, AmazonSaleSchedule } from "@shared/types"

const API_BASE = process.env.NEXT_PUBLIC_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/public"
const api = (p: string) => `${API_BASE}${p.startsWith('/') ? p : '/' + p}`

// Types are now provided by @shared/types

type FilterContentProps = {
  isMobile?: boolean
  searchText: string
  setSearchText: (v: string) => void
  viewMode: "grid" | "list"
  setViewMode: (v: "grid" | "list") => void
  gridColumns: number
  setGridColumns: (n: number) => void
  layoutStyle: "masonry" | "square"
  setLayoutStyle: (s: "masonry" | "square") => void
  sortMode: "newest" | "clicks" | "price-asc" | "price-desc"
  setSortMode: (v: any) => void
  tagGroups: Record<string, string[]>
  selectedTags: string[]
  toggleTag: (t: string) => void
  openGroups: string[] | undefined
  setOpenGroups: (v: string[] | undefined) => void
  setSelectedTags: (v: string[]) => void
}

function FilterContent({ isMobile = false, searchText, setSearchText, viewMode, setViewMode, gridColumns, setGridColumns, layoutStyle, setLayoutStyle, sortMode, setSortMode, tagGroups, selectedTags, toggleTag, openGroups, setOpenGroups, setSelectedTags, }: FilterContentProps) {
  const [localQuery, setLocalQuery] = useState<string>(searchText)
  const composingRef = useRef(false)
  const debounceRef = useRef<number | null>(null)
  useEffect(() => { setLocalQuery(searchText) }, [searchText])
  useEffect(() => {
    if (composingRef.current) return
    if (debounceRef.current) { clearTimeout(debounceRef.current) }
    debounceRef.current = window.setTimeout(() => { setSearchText(localQuery); debounceRef.current = null }, 300)
    return () => { if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null } }
  }, [localQuery, setSearchText])
  const handleCompositionStart = () => { composingRef.current = true }
  const handleCompositionEnd = () => { composingRef.current = false; setSearchText(localQuery) }

  return (
    <div className={`space-y-8 ${isMobile ? 'text-sm' : ''}`}>
      <div className="space-y-2">
        <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>テキスト検索</Label>
        <Input placeholder="商品名・説明文で検索" value={localQuery} onChange={(e: any) => setLocalQuery(e.target.value)} onCompositionStart={handleCompositionStart} onCompositionEnd={handleCompositionEnd} onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); setSearchText(localQuery) } }} className={isMobile ? 'text-xs h-9' : ''} />
      </div>
      {viewMode === 'grid' && (
        <div className="space-y-2">
          <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>列数</Label>
          <Select value={String(gridColumns)} onValueChange={(v) => setGridColumns(Number(v))}>
            <SelectTrigger className={`w-24 ${isMobile ? 'text-xs h-8' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isMobile ? (
                <>
                  <SelectItem value="2">2列</SelectItem>
                  <SelectItem value="3">3列</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="4">4列</SelectItem>
                  <SelectItem value="5">5列</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>並び替え</Label>
        <Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
          <SelectTrigger className={`w-full ${isMobile ? 'text-xs h-9' : ''}`}>
            <SortAsc className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">新しい順</SelectItem>
            <SelectItem value="clicks">クリック数順</SelectItem>
            <SelectItem value="price-asc">価格が安い順</SelectItem>
            <SelectItem value="price-desc">価格が高い順</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {Object.keys(tagGroups).length > 0 && (
        <div className="space-y-2">
          <Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>タグで絞り込み</Label>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted rounded-lg">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className={`cursor-pointer ${isMobile ? 'text-[10px] px-2 py-0.5' : ''}`} onClick={() => toggleTag(tag)}>
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          <div className={`${isMobile ? 'max-h-[38vh] overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded' : ''}`}>
            <Accordion type="multiple" className="w-full" value={openGroups} onValueChange={(v) => setOpenGroups(Array.isArray(v) ? v : [v])}>
              {Object.entries(tagGroups).map(([groupName, tags]) => (
                <AccordionItem key={groupName} value={groupName}>
                  <AccordionTrigger className={isMobile ? 'text-xs py-2' : 'text-sm'}>
                    {groupName}
                    {selectedTags.some((t) => tags.includes(t)) && (
                      <Badge variant="secondary" className={`ml-2 ${isMobile ? 'text-[10px] px-1.5 py-0' : ''}`}>
                        {selectedTags.filter((t) => tags.includes(t)).length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant={selectedTags.includes(tag) ? 'default' : 'secondary'} className={`cursor-pointer hover:scale-105 transition-transform ${isMobile ? 'text-[10px] px-2 py-0.5' : ''}`} onClick={() => toggleTag(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className={`w-full ${isMobile ? 'text-xs h-8' : ''}`}>
              <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              絞り込みを解除
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [saleSchedules, setSaleSchedules] = useState<AmazonSaleSchedule[]>([])
  const [activeSaleMap, setActiveSaleMap] = useState<Map<string, string>>(new Map())
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [displayMode, setDisplayMode] = useState<'normal' | 'gallery'>('normal')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [gridColumns, setGridColumns] = useState(5)
  const [layoutStyle, setLayoutStyle] = useState<"masonry" | "square">("masonry")
  const [sortMode, setSortMode] = useState<"newest" | "clicks" | "price-asc" | "price-desc">("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [openGroups, setOpenGroups] = useState<string[] | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isGallerySearchSticky, setIsGallerySearchSticky] = useState(false)
  const [isAllOverlayOpen, setIsAllOverlayOpen] = useState(false)

  const PAGE_DEFAULT_LIMIT = 24
  const [pageLimit] = useState<number>(PAGE_DEFAULT_LIMIT)
  const [pageOffset, setPageOffset] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Preload main images for visible products and recipe items so modal shows immediately
    try {
        if (typeof window !== 'undefined') {
        const domain = (process.env?.NEXT_PUBLIC_IMAGES_DOMAIN as string) || 'https://images.shirasame.com'
        const normalizeRawForUsage = (raw?: string | null) => {
          if (!raw) return ''
          let s = String(raw)
          try { const u = new URL(s); s = u.pathname + (u.search || '') } catch {}
          const m = s.match(/\/cdn-cgi\/image\/[^\/]+\/(.+)$/)
          if (m && m[1]) return m[1]
          return s.replace(/^\/+/, '')
        }
        const toPreload = new Set<string>()
        for (const p of products) {
          try {
                const mainSrc = (p as any)?.main_image && (p as any).main_image.src ? (p as any).main_image.src : null
            let url: string | null = null
            if (mainSrc) {
              // Use API-provided transformed URL as-is
              url = String(mainSrc)
            } else if (Array.isArray(p.images) && p.images[0]) {
              const legacy = p.images[0].url || null
              if (legacy) {
                url = String(legacy)
              }
            }
            if (url) toPreload.add(url)
          } catch {}
        }
        for (const r of recipes) {
          try {
            if (Array.isArray(r.items)) {
              for (const it of r.items) {
                const mainSrc = it?.main_image && it.main_image.src ? it.main_image.src : null
                let url: string | null = null
                if (mainSrc) {
                  url = String(mainSrc)
                } else if (Array.isArray(it.images) && it.images[0]) {
                  const legacy = it.images[0].url || null
                  if (legacy) url = String(legacy)
                }
                if (url) toPreload.add(url)
              }
            }
          } catch {}
        }
        const imgs: HTMLImageElement[] = []
        toPreload.forEach((u) => { try { const im = document.createElement('img') as HTMLImageElement; im.src = u; imgs.push(im) } catch {} })
        // no cleanup necessary beyond letting images be garbage collected
      }
    } catch {}

    if (openGroups === undefined && Object.keys(tagGroups).length > 0) {
      setOpenGroups(Object.keys(tagGroups))
    }
    ;(async () => {
      try {
        const [prodRes, colRes, recRes, profileRes, saleRes] = await Promise.allSettled([
          apiFetch(`/owner-products?limit=${pageLimit}&offset=0`),
          apiFetch(`/collections`),
          apiFetch(`/recipes`),
          apiFetch('/profile'),
          apiFetch('/amazon-sale-schedules'),
        ])
        const prodJson = prodRes.status === 'fulfilled' ? await prodRes.value.json().catch(() => ({ data: [] })) : { data: [] }
        const colJson = colRes.status === 'fulfilled' ? await colRes.value.json().catch(() => ({ data: [] })) : { data: [] }
        const recJson = recRes.status === 'fulfilled' ? await recRes.value.json().catch(() => ({ data: [] })) : { data: [] }
        const profileJson = profileRes.status === 'fulfilled' ? await profileRes.value.json().catch(() => null) : null
        const apiProducts: Product[] = Array.isArray(prodJson.data) ? prodJson.data : []
        const apiCollections: Collection[] = Array.isArray(colJson.data) ? colJson.data : []
        const apiRecipes = Array.isArray(recJson.data) ? recJson.data : []
        let loadedUser = profileJson?.data || profileJson || null
        const apiSchedules: AmazonSaleSchedule[] = saleRes.status === 'fulfilled' ? (await saleRes.value.json().catch(() => ({ data: [] }))).data || [] : []
        // Normalize profile/site settings so components receive expected shapes
        if (loadedUser && typeof loadedUser === 'object') {
          try {
            // Map snake_case keys from API to camelCase used by components
            if (loadedUser.display_name && !loadedUser.displayName) loadedUser.displayName = loadedUser.display_name
            if (loadedUser.profile_image && !loadedUser.profileImage) loadedUser.profileImage = loadedUser.profile_image
            if (loadedUser.avatar_url && !loadedUser.avatarUrl) loadedUser.avatarUrl = loadedUser.avatar_url
            if (loadedUser.social_links && !loadedUser.socialLinks) loadedUser.socialLinks = loadedUser.social_links
            if (loadedUser.header_image_keys && !loadedUser.headerImageKeys) loadedUser.headerImageKeys = loadedUser.header_image_keys

            // Normalize social_links: string or array -> map expected by SocialLinks
            let socialLinksVal: any = loadedUser.socialLinks ?? null
            if (typeof socialLinksVal === 'string') {
              try {
                const arr = JSON.parse(socialLinksVal)
                if (Array.isArray(arr)) {
                  const map: Record<string, string> = {}
                  for (const s of arr) {
                    if (!s) continue
                    const key = (s.platform && String(s.platform).trim()) || s.username || s.url || 'link'
                    if (s.url) map[key] = s.url
                  }
                  loadedUser.socialLinks = map
                } else {
                  loadedUser.socialLinks = { links: socialLinksVal }
                }
              } catch {
                loadedUser.socialLinks = { links: socialLinksVal }
              }
            } else if (Array.isArray(socialLinksVal)) {
              const map: Record<string, string> = {}
              for (const s of socialLinksVal) {
                if (!s) continue
                const key = (s.platform && String(s.platform).trim()) || s.username || s.url || 'link'
                if (s.url) map[key] = s.url
              }
              loadedUser.socialLinks = map
            }

            if (typeof loadedUser.headerImageKeys === 'string') {
              try { loadedUser.headerImageKeys = JSON.parse(loadedUser.headerImageKeys) } catch { loadedUser.headerImageKeys = [loadedUser.headerImageKeys] }
            }

            if (loadedUser.loading_animation && typeof loadedUser.loading_animation === 'object' && loadedUser.loading_animation.url) {
              loadedUser.loadingAnimation = loadedUser.loading_animation
            }
          } catch (e) { console.error('[public] normalize profile error', e) }
        }

        // Normalize API fields (snake_case -> camelCase) for products/collections/recipes
        const normalizeProduct = (raw: any) => {
          const p = { ...raw } as any
          if (raw.created_at && !raw.createdAt) p.createdAt = raw.created_at
          if (raw.updated_at && !raw.updatedAt) p.updatedAt = raw.updated_at
          if (raw.short_description && !raw.shortDescription) p.shortDescription = raw.short_description
          if (raw.image && !raw.images) p.images = [{ id: raw.image.id || null, product_id: raw.id, url: raw.image.url, width: raw.image.width || null, height: raw.image.height || null, aspect: raw.image.width && raw.image.height ? raw.image.width / raw.image.height : raw.image.aspect || null, role: raw.image.role || 'main', basePath: raw.image.basePath || null }]
          if (!Array.isArray(p.images)) p.images = []
          if (raw.tags && !Array.isArray(raw.tags) && typeof raw.tags === 'string') {
            try { p.tags = JSON.parse(raw.tags) } catch { p.tags = raw.tags.split(',').map((s: string) => s.trim()).filter(Boolean) }
          }
          return p
        }

        const normalizedProducts = apiProducts.map((p: any) => normalizeProduct(p))

        const normalizeCollection = (raw: any) => {
          const c = { ...raw } as any
          if (raw.created_at && !raw.createdAt) c.createdAt = raw.created_at
          if (raw.updated_at && !raw.updatedAt) c.updatedAt = raw.updated_at
          // If API returns 'items' (collection_items) map them to actual product objects using normalizedProducts
          if (Array.isArray(c.products)) c.products = c.products.map((pr: any) => normalizeProduct(pr))
          else if (Array.isArray(c.items)) {
            const prodList: any[] = []
            for (const it of c.items) {
              const pid = it?.product_id ?? it?.id ?? it?.productId ?? null
              if (!pid) continue
              const found = normalizedProducts.find((np: any) => String(np.id) === String(pid))
              if (found) prodList.push(found)
            }
            c.products = prodList
          } else {
            c.products = []
          }
          return c
        }

        const normalizedCollections = apiCollections.map((c: any) => normalizeCollection(c))

        const normalizeRecipe = (raw: any) => {
          const r = { ...raw } as any
          if (raw.created_at && !raw.createdAt) r.createdAt = raw.created_at
          if (raw.updated_at && !raw.updatedAt) r.updatedAt = raw.updated_at
          if (raw.short_description && !raw.shortDescription) r.shortDescription = raw.short_description
          // Ensure imageUrl/imageDataUrl are available for the Recipe display component
          try {
            if (Array.isArray(r.images) && r.images.length > 0) {
                const img = r.images[0]
                r.imageUrl = img.src || img.url || null
              r.imageWidth = img.width || null
              r.imageHeight = img.height || null
              r.imageDataUrl = img.dataUrl || null
            } else if (r.recipe_images && Array.isArray(r.recipe_images) && r.recipe_images.length > 0) {
              r.imageUrl = r.recipe_images[0].src || null
            } else if (r.recipeImageKeys && Array.isArray(r.recipeImageKeys) && r.recipeImageKeys.length > 0) {
              // Backwards-compat: if server hasn't yet provided recipe_images, fall back to recipeImageKeys
              r.imageUrl = r.recipeImageKeys[0]
            }
          } catch {}
          // Ensure pins array exists (some APIs return pins joined)
          if (!Array.isArray(r.pins)) r.pins = Array.isArray(raw.pins) ? raw.pins : []
          return r
        }

        const normalizedRecipes = apiRecipes.map((r: any) => normalizeRecipe(r))

        setProducts(normalizedProducts.filter((p: any) => p.published))
        setPageOffset(normalizedProducts.length)
        if (prodJson?.meta && typeof prodJson.meta.total === 'number') {
          setHasMore(normalizedProducts.length < prodJson.meta.total)
        } else {
          setHasMore(normalizedProducts.length === pageLimit)
        }
        setRecipes(normalizedRecipes.filter((r: any) => r.published !== false))
        setCollections(normalizedCollections)
        setSaleSchedules(apiSchedules)
        setUser(loadedUser || null)
        setIsLoaded(true)

        // Build active sale map { productId -> saleName }
        try {
          const now = new Date()
          const active = apiSchedules.filter((s) => {
            const sd = new Date(s.startDate)
            const ed = new Date(s.endDate)
            return sd <= now && now <= ed
          })
          const map = new Map<string, string>()
          for (const sch of active) {
            const col = apiCollections.find((c: any) => c.id === sch.collectionId)
            const prods: Product[] = Array.isArray(col?.products) ? col!.products! : []
            for (const p of prods) map.set(p.id, sch.saleName)
          }
          setActiveSaleMap(map)
        } catch {}

        try {
          const [groupsRes, tagsRes] = await Promise.all([apiFetch('/tag-groups'), apiFetch('/tags')])
          const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
          const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
          const serverGroups = Array.isArray(groupsJson.data) ? groupsJson.data : groupsJson.data || []
          const serverTags = Array.isArray(tagsJson.data) ? tagsJson.data : tagsJson.data || []
          const groups: Record<string, string[]> = {}
          for (const g of serverGroups) { if (!g || !g.name) continue; groups[g.name] = [] }
          for (const t of serverTags) { const tagName = t.name; const groupName = t.group || '未分類'; if (!groups[groupName]) groups[groupName] = []; if (!groups[groupName].includes(tagName)) groups[groupName].push(tagName) }
          if (Object.keys(groups).length === 0) {
            const derived: Record<string, string[]> = {}
            apiProducts.filter((p: any) => p.published && Array.isArray(p.tags)).forEach((p: any) => {
              (p.tags as string[]).forEach((tag) => {
                const isLinkTag = tag === "Amazon" || tag === "楽天市場" || tag === "Yahoo!ショッピング" || tag === "公式サイト"
                const groupName = isLinkTag ? "リンク先" : "その他"
                if (!derived[groupName]) derived[groupName] = []
                if (!derived[groupName].includes(tag)) derived[groupName].push(tag)
              })
            })
            setTagGroups(derived)
          } else {
            setTagGroups(groups)
          }
        } catch (e) {
          const groups: Record<string, string[]> = {}
          apiProducts.filter((p: any) => p.published && Array.isArray(p.tags)).forEach((p: any) => {
            (p.tags as string[]).forEach((tag) => {
              const isLinkTag = tag === "Amazon" || tag === "楽天市場" || tag === "Yahoo!ショッピング" || tag === "公式サイト"
              const groupName = isLinkTag ? "リンク先" : "その他"
              if (!groups[groupName]) { groups[groupName] = [] }
              if (!groups[groupName].includes(tag)) { groups[groupName].push(tag) }
            })
          })
          setTagGroups(groups)
        }
      } catch (e) { console.error("[public] Failed to load data", e) }
    })()
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const updateCols = () => {
          const isMobileViewport = window.innerWidth < 640
          if (displayMode === 'gallery') { setGridColumns(isMobileViewport ? 2 : 7) } else { setGridColumns(isMobileViewport ? 2 : 5) }
        }
        updateCols(); window.addEventListener('resize', updateCols); return () => window.removeEventListener('resize', updateCols)
      }
    } catch {}
  }, [displayMode])

  const thumbnailFor = (rawUrl: string | null | undefined, w: number, basePath?: string | null) => {
    // rawUrl is expected to be a public-facing URL provided by the API (URL-only).
    if (!rawUrl) return '/placeholder.svg'
    if ((rawUrl as any).startsWith && (rawUrl as any).startsWith('data:')) return rawUrl
    try {
      const pu = rawUrl
      // Do not construct CDN URLs on the client. Prefer API-provided URL (pu).
      if (basePath) {
        return pu || '/placeholder.svg'
      }
      try { return api(`/images/thumbnail?url=${encodeURIComponent(pu)}&w=${w}`) } catch { return pu }
    } catch {
      return rawUrl
    }
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const isMobileViewport = window.innerWidth < 640
        setGridColumns(isMobileViewport ? 2 : 5)
        const handler = () => {
          const el = document.getElementById('global-gallery-search')
          if (!el) return
          const top = el.getBoundingClientRect().top
          setIsGallerySearchSticky(top <= 64)
        }
        window.addEventListener('scroll', handler, { passive: true } as any)
        handler()
        return () => { window.removeEventListener('scroll', handler) }
      }
    } catch {}
  }, [])

  const handleProductClick = async (product: Product, imageUrl?: string) => {
    // Prefer API-provided main_image.src for modal initial image
    let initial = imageUrl || null
    try {
      const apiMain = (product as any)?.main_image && (product as any).main_image.src ? (product as any).main_image.src : null
      if (!initial && apiMain) initial = apiMain
    } catch {}
    setSelectedProduct(product)
    setSelectedImageUrl(initial)
    setIsModalOpen(true)
    ;(async () => {
      try {
        // Use owner-products detail API (returns { data: object | null })
        const slug = (product as any)?.slug || product.id
        const res = await apiFetch(`/owner-products/${encodeURIComponent(String(slug || ''))}`)
        if (res.ok) {
          const js = await res.json().catch(() => ({ data: null }))
          const full = js.data || null
          if (full) { setSelectedProduct(full) }
        }
      } catch (e) { console.error('[public] failed to load full product for modal', e) }
    })()
  }

  const toggleTag = (tag: string) => { setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])) }

  const productMatches = (p: Product) => {
    const matchesTag = selectedTags.length === 0 || selectedTags.some((tag) => (p.tags || []).includes(tag))
    const q = searchText.trim().toLowerCase()
    const matchesText = !q || (p.title || '').toLowerCase().includes(q) || ((p.shortDescription || '').toLowerCase().includes(q))
    return matchesTag && matchesText
  }

  const filteredAndSortedProducts = products.filter(productMatches).sort((a, b) => {
    switch (sortMode) {
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "clicks": return Math.random() - 0.5
      case "price-asc": return (a.price || 0) - (b.price || 0)
      case "price-desc": return (b.price || 0) - (a.price || 0)
      default: return 0
    }
  })

  const appliedStyle = theme ? { fontFamily: theme?.fonts?.body || undefined } : {}
  const getProductsForCollection = (collectionId: string) => { const col = collections.find((c: any) => c.id === collectionId); return (col?.products || []) as Product[] }
  function shuffleArray<T>(arr: T[]) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

  const galleryItemsShuffled = useMemo(() => {
    if (displayMode !== 'gallery') return [] as any[]
    const domain = (process.env?.NEXT_PUBLIC_IMAGES_DOMAIN as string) || 'https://images.shirasame.com'
    const normalizeRawForUsage = (raw?: string | null) => {
      if (!raw) return ''
      let s = String(raw)
      try { const u = new URL(s); s = u.pathname + (u.search || '') } catch {}
      const m = s.match(/\/cdn-cgi\/image\/[^\/]+\/(.+)$/)
      if (m && m[1]) return m[1]
      return s.replace(/^\/+/, '')
    }
    return shuffleArray(products.flatMap((product) => {
      // Prefer API-provided transformed URL: product.main_image.src
      const mainSrc = (product as any)?.main_image && (product as any).main_image.src ? (product as any).main_image.src : null
      if (mainSrc) {
        try {
            const u = String(mainSrc)
          return [{ id: `${product.id}__0`, productId: product.id, image: u, aspect: undefined, title: product.title, href: `/products/${product.slug}` }]
        } catch {
          return [{ id: `${product.id}__0`, productId: product.id, image: String(mainSrc), aspect: undefined, title: product.title, href: `/products/${product.slug}` }]
        }
      }
      // Fallback to legacy images[].url if present
      const legacy = (product as any)?.images && Array.isArray((product as any).images) ? (product as any).images[0] : null
      const url = legacy?.url || "/placeholder.svg"
      try {
        const u2 = String(url)
        return [{ id: `${product.id}__0`, productId: product.id, image: u2, aspect: legacy?.aspect || undefined, title: product.title, href: `/products/${product.slug}` }]
      } catch {
        return [{ id: `${product.id}__0`, productId: product.id, image: url, aspect: legacy?.aspect || undefined, title: product.title, href: `/products/${product.slug}` }]
      }
    }))
  }, [shuffleKey, products, displayMode])

  const productById = useMemo(() => { const m = new Map<string, Product>(); for (const p of products) m.set(p.id, p); return m }, [products])
  const saleNameFor = (productId: string): string | null => activeSaleMap.get(productId) || null

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await apiFetch(`/owner-products?limit=${pageLimit}&offset=${pageOffset}`)
      if (!res.ok) throw new Error('failed to fetch')
      const js = await res.json().catch(() => ({ data: [], meta: undefined }))
      const items = Array.isArray(js.data) ? js.data : []
      const normalized = items.map((p: any) => {
        if (Array.isArray(p.images)) return p
        if (p.image && p.image.url) {
          return { ...p, images: [{ id: p.image.id || null, product_id: p.id, url: p.image.url, width: p.image.width || null, height: p.image.height || null, aspect: p.image.width && p.image.height ? p.image.width / p.image.height : p.image.aspect || null, role: p.image.role || 'main', }], }
        }
        return { ...p, images: [] }
      }).filter((p: any) => p.published)
      setProducts((prev) => [...prev, ...normalized])
      setPageOffset((prev) => prev + items.length)
      if (js?.meta && typeof js.meta.total === 'number') { setHasMore((prevOffset) => pageOffset + items.length < js.meta.total) } else { setHasMore(items.length === pageLimit) }
    } catch (e) { console.error('[public] loadMore failed', e) } finally { setLoadingMore(false) }
  }

  const galleryItems = useMemo(() => { return galleryItemsShuffled.filter((item: any) => { const p = productById.get(item.productId); return p ? productMatches(p) : false }) }, [galleryItemsShuffled, productById, searchText, selectedTags])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const obs = new IntersectionObserver((entries) => { for (const e of entries) { if (e.isIntersecting) { loadMore() } } }, { root: null, rootMargin: '400px', threshold: 0.1 })
    obs.observe(node)
    return () => obs.disconnect()
  }, [loadingMore, hasMore, pageOffset])

  if (!isLoaded) { return <InitialLoading /> }

  const changeDisplayMode = (mode: 'normal' | 'gallery') => {
    if (mode === displayMode) return
    setIsTransitioning(true)
    setTimeout(() => {
      setDisplayMode(mode)
      if (mode === 'gallery') { setViewMode('grid'); setLayoutStyle('masonry'); setShuffleKey((k) => k + 1) }
      if (mode === 'normal') { setViewMode('grid'); setLayoutStyle('square') }
      setIsTransitioning(false)
    }, 250)
  }

  return (
    <div className="min-h-screen" style={appliedStyle}>
      <InitialLoading />
      <main className="min-h-screen pt-16 pb-20 relative">
        <PublicNav siteName={user?.displayName || ""} />
        {process.env.NODE_ENV !== 'production' && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <details className="bg-white/80 p-2 rounded-md border">
              <summary className="cursor-pointer font-medium">[DEBUG] user state</summary>
              <pre className="text-xs max-h-64 overflow-auto p-2">{JSON.stringify(user, null, 2)}</pre>
            </details>
          </div>
        )}
        {user && <ProfileHeader user={user as any} />}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center bg-muted p-1 rounded-full shadow-sm" style={{ width: 280 }}>
              <div className={`absolute top-1 left-1 h-8 w-1/2 rounded-full transition-transform duration-300 ease-in-out ${displayMode === 'gallery' ? 'translate-x-full bg-pink-600' : 'translate-x-0 bg-primary'}`} style={{ marginTop: '3px' , width: '137px' }} aria-hidden />
              <button onClick={() => changeDisplayMode('normal')} aria-pressed={displayMode === 'normal'} className={`relative z-10 flex-1 text-sm font-semibold px-4 py-2 text-center rounded-full ${displayMode === 'normal' ? 'text-white' : 'text-foreground/70'}`}>Normal</button>
              <button onClick={() => changeDisplayMode('gallery')} aria-pressed={displayMode === 'gallery'} className={`relative z-10 flex-1 text-sm font-semibold px-4 py-2 text-center rounded-full ${displayMode === 'gallery' ? 'text-white' : 'text-foreground/70'}`}>Gallery</button>
            </div>
          </div>

          <div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {displayMode === 'gallery' ? (
            <section id="global-gallery" className="mb-16">
              <div className="gallery-search-viewport" style={{ position: 'sticky', top: '74px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', zIndex: isModalOpen ? 0 : 30 }}>
                <div id="global-gallery-search" className={`${isModalOpen ? 'z-0' : 'z-40'} mb-6 ${isGallerySearchSticky ? 'bg-white rounded-b-2xl shadow-md' : ''}`} style={{ width: 'calc(100dvw - 10px)', maxWidth: '80rem', boxSizing: 'border-box', marginInline: 'auto' }}>
                  <div className="relative rounded-full border bg-background/80 backdrop-blur-sm shadow-sm overflow-hidden" role="search" aria-label="ギャラリー検索" style={{ width: 'calc(100% - 10px)', marginInline: 'auto', maxWidth: '80rem' }}>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setSearchText((e.target as HTMLInputElement).value) } }} placeholder="キーワードで検索" className="w-full bg-transparent py-3 pr-5 pl-10 text-sm outline-none placeholder:text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {galleryItems.length > 0 ? (
                  <ProductMasonry key={`global-gallery-${shuffleKey}`} items={galleryItems} className="gap-3" fullWidth={true} columns={gridColumns} onItemClick={(id: string) => { const item: any = galleryItems.find((gi: any) => gi.id === id); const p = item ? products.find((pr) => pr.id === item.productId) : undefined; if (p) handleProductClick(p, item?.image) }} />
                ) : (
                  <p className="text-center text-muted-foreground py-16">そのワードに関連するものはまだないな...</p>
                )}
              </div>
            </section>
          ) : (
            collections.length > 0 && (
              <section id="collections" className="mb-16">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 heading-with-vertical">Collection</h2>
                <div className="space-y-12">
                  {collections.map((collection: any) => {
                    const collectionProducts = getProductsForCollection(collection.id)
                    return (
                      <div key={collection.id} id={`collection-${collection.id}`} className="mb-12 scroll-mt-20">
                        <h3 className="font-heading text-lg sm:text-xl font-semibold text-center mb-4">{collection.title}</h3>
                        {collection.description && (<p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">{collection.description}</p>)}
                        {collectionProducts.length > 0 ? (
                          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 z-30">
                            {collectionProducts.map((product) => {
                              const cardImage = (() => {
                                try {
                                  const mainSrc = (product as any)?.main_image && (product as any).main_image.src ? (product as any).main_image.src : null
                                  if (mainSrc) return String(mainSrc)
                                  const legacy = (product as any)?.images && Array.isArray((product as any).images) ? (product as any).images[0] : null
                                  return legacy?.url || '/placeholder.svg'
                                } catch { return '/placeholder.svg' }
                              })()
                              return (<ProductCardSimple key={product.id} product={product} saleName={saleNameFor(product.id)} onClick={() => handleProductClick(product, cardImage)} />)
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8 text-sm">商品がありません</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          )}

          {products.length > 0 && displayMode !== 'gallery' && (
            <section id="all-products" className="mb-16 scroll-mt-20">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center heading-with-vertical">
                <button onClick={() => setIsAllOverlayOpen(true)} className="underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded px-2">All Items</button>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">クリックで一覧をスライド表示します</p>

              {/* 通常ビューではグリッドは表示せず、オーバーレイで初回画像ロード */}
            </section>
          )}

          {recipes.length > 0 && displayMode !== 'gallery' && (
            <section id="recipes" className="mb-16 scroll-mt-20">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center">Recipe</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">実際のデスク環境と使用アイテムを紹介します</p>
              <div className="space-y-12">
                {recipes.map((recipe: any, index: number) => {
                  const pins = recipe.pins || []
                  if (!recipe.imageDataUrl && !recipe.imageUrl) return null
                  const linkedProductIds = [...new Set(pins.map((pin: any) => pin.productId).filter(Boolean))]
                  const linkedProducts = linkedProductIds.map((id) => {
                    // Prefer canonical product objects from the site's product index
                    // (productById / products). Fall back to recipe.items only when
                    // the canonical product is not available. This ensures image
                    // fields like `main_image` and `main_image_key` are present
                    // so thumbnail rendering matches collection views.
                    const byMap = productById.get(String(id))
                    if (byMap) return byMap
                    const fromProducts = products.find((p) => String(p.id) === String(id)) || null
                    if (fromProducts) return fromProducts
                    const itemFromRecipe = Array.isArray(recipe.items) ? recipe.items.find((it: any) => String(it.id ?? it.product_id ?? it.productId) === String(id)) : undefined
                    if (itemFromRecipe) return itemFromRecipe
                    return null
                  }).filter(Boolean) as any[]
                  const isEvenIndex = index % 2 === 0
                  const imageFirst = isEvenIndex
                  return (
                    <div key={recipe.id} className="p-3 md:p-6 bg-card shadow-md rounded-t-md rounded-b-md bg-linear-to-b from-card to-transparent">
                      <h3 className="font-heading text-xl sm:text-2xl font-semibold mb-6 text-center">{recipe.title}</h3>
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-transparent">
                        <div className={`w-full md:w-1/2 ${imageFirst ? "md:order-1" : "md:order-2"}`}>
                          <RecipeDisplay recipeId={recipe.id} recipeTitle={recipe.title} imageDataUrl={recipe.imageDataUrl} imageUrl={recipe.imageUrl} imageWidth={recipe.imageWidth} imageHeight={recipe.imageHeight} pins={pins} products={products} items={recipe.items || []} onProductClick={handleProductClick as any} />
                        </div>
                        <div className={`w-full bg-transparent md:w-1/2 ${imageFirst ? "md:order-2" : "md:order-1"}`}>
                          {linkedProducts.length > 0 && (
                            <div>
                              <h4 className="font-heading text-base sm:text-lg font-semibold mb-4 text-center md:text-left">使用アイテム</h4>
                              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 gap-3">
                                {linkedProducts.map((product) => {
                                  const cardImage = (() => {
                                    try {
                                      const mainSrc = (product as any)?.main_image && (product as any).main_image.src ? (product as any).main_image.src : null
                                      if (mainSrc) return String(mainSrc)
                                      const legacy = (product as any)?.images && Array.isArray((product as any).images) ? (product as any).images[0] : null
                                      return legacy?.url || '/placeholder.svg'
                                    } catch { return '/placeholder.svg' }
                                  })()
                                  return (<ProductCardSimple key={product.id} product={product} saleName={saleNameFor(product.id)} onClick={() => handleProductClick(product, cardImage)} />)
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <div ref={sentinelRef as any} className="w-full flex items-center justify-center py-4">
            {loadingMore ? (<div className="text-sm text-muted-foreground">読み込み中...</div>) : !hasMore ? (<div className="text-sm text-muted-foreground">ここまで</div>) : null}
          </div>

          <section id="profile" className="mb-16 scroll-mt-20">
            <div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {user && <ProfileCard user={user as any} />}
            </div>
          </section>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 {user?.displayName || "User"}. All rights reserved.</p>
        </div>
      </footer>

      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialImageUrl={selectedImageUrl ?? undefined} saleName={selectedProduct ? saleNameFor(selectedProduct.id) : null} />

      {/* All Items Overlay */}
      <div className={`fixed inset-0 z-40 pointer-events-none ${isAllOverlayOpen ? '' : ''}`} aria-hidden={!isAllOverlayOpen}>
          <div className={`absolute inset-0 bg-sky-50/95 transition-transform duration-300 ease-out ${isAllOverlayOpen ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}>
          <button aria-label="閉じる" className="absolute top-20 right-4 text-gray-800 hover:text-gray-900 text-2xl font-semibold bg-white/70 rounded-full w-10 h-10 flex items-center justify-center shadow" onClick={() => setIsAllOverlayOpen(false)}>
            ×
          </button>
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-center">All Items</h2>
            <div className="mb-6">
              <div className="flex justify-center">
                <Button variant="outline" size="lg" onClick={() => setShowFilters(!showFilters)} className="gap-2 hidden sm:flex bg-white/70">
                  <Filter className="w-4 h-4" />
                  Sort
                  {selectedTags.length > 0 && (<Badge variant="secondary" className="ml-2">{selectedTags.length}件</Badge>)}
                </Button>
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 sm:hidden bg-white/70">
                      <Filter className="w-4 h-4" />
                      Sort
                      {selectedTags.length > 0 && (<Badge variant="secondary" className="ml-2">{selectedTags.length}件</Badge>)}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-4 pb-0 flex flex-col">
                    <SheetHeader className="pb-4 border-b">
                      <SheetTitle className="text.base">絞り込み・並び替え</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="mx-auto w-full max-w-md px-1">
                        <FilterContent isMobile={true} searchText={searchText} setSearchText={setSearchText} viewMode={viewMode} setViewMode={setViewMode} gridColumns={gridColumns} setGridColumns={setGridColumns} layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} sortMode={sortMode} setSortMode={setSortMode} tagGroups={tagGroups} selectedTags={selectedTags} toggleTag={(t) => toggleTag(t)} openGroups={openGroups} setOpenGroups={setOpenGroups} setSelectedTags={setSelectedTags} />
                      </div>
                    </div>
                    <div className="py-4 border-t bg-background sticky bottom-0">
                      <Button className="w-full h-10 text-sm" onClick={() => setIsFilterSheetOpen(false)}>適用する</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {showFilters && (
                <div className="mt-4 border rounded-lg p-6 bg-white/70 backdrop-blur animate-in fade-in slide-in-from-top-2 duration-300 hidden sm:block">
                  <FilterContent searchText={searchText} setSearchText={setSearchText} viewMode={viewMode} setViewMode={setViewMode} gridColumns={gridColumns} setGridColumns={setGridColumns} layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} sortMode={sortMode} setSortMode={setSortMode} tagGroups={tagGroups} selectedTags={selectedTags} toggleTag={toggleTag} openGroups={openGroups} setOpenGroups={setOpenGroups} setSelectedTags={setSelectedTags} />
                </div>
              )}
            </div>

            {viewMode === 'grid' ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                {filteredAndSortedProducts.map((product) => {
                  const sale = saleNameFor(product.id)
                  const sizes = "(max-width: 768px) 100vw, 400px"
                  // prefer top-level main_image, fallback to legacy images
                  const mainTop = (product as any).main_image && typeof (product as any).main_image === 'object' ? (product as any).main_image : null
                  const img0: any = product.images?.[0] || null
                  const mainLegacyUrl = img0?.url || null
                  const src = mainTop?.src || mainLegacyUrl || '/placeholder.svg'
                  const srcSet = mainTop?.srcSet || img0?.srcSet || null
                  return (
                    <div key={product.id} className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" onClick={() => handleProductClick(product)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProductClick(product) } }} aria-label={product.title}>
                      <img src={src} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={product.title} className="object-cover rounded-lg w-full h-full" loading="lazy" onError={(e: any) => { try { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; e.currentTarget.srcset = '' } catch {} }} />
                      
                      {sale && (
                        <div className="absolute left-2 top-2 z-10">
                          <span className="inline-flex items-center rounded-full bg-pink-600 text-white text-[10px] font-semibold px-2 py-0.5 shadow-sm">{sale}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedProducts.map((product) => {
                  const sale = saleNameFor(product.id)
                  const sizes = "(max-width: 768px) 100vw, 400px"
                  const mainTop = (product as any).main_image && typeof (product as any).main_image === 'object' ? (product as any).main_image : null
                  const img0: any = product.images?.[0] || null
                  const mainLegacyUrl = img0?.url || null
                  const src = mainTop?.src || mainLegacyUrl || '/placeholder.svg'
                  const srcSet = mainTop?.srcSet || img0?.srcSet || null
                  return (
                    <div key={product.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white/70" onClick={() => handleProductClick(product)}>
                      <div className="relative w-24 h-24 shrink-0">
                        <img src={src} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={product.title} className="object-cover rounded w-24 h-24" loading="lazy" onError={(e: any) => { try { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; e.currentTarget.srcset = '' } catch {} }} />
                        
                        {sale && (
                          <div className="absolute left-1 top-1 z-10">
                            <span className="inline-flex items-center rounded bg-pink-600 text-white text-[9px] font-semibold px-1.5 py-0.5 shadow">{sale}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription}</p>
                        {product.price && <p className="text-lg font-bold mt-2">¥{Number(product.price).toLocaleString()}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {filteredAndSortedProducts.length === 0 && (<p className="text-center text-muted-foreground py-16">そのワードに関連するものはまだないな...</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
