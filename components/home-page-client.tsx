"use client";
// 元の app/page.tsx のロジックをそのまま移植。今後 Server Component から初期データ受け渡し予定。
import { useEffect, useState, useRef, useMemo } from "react"
import { PublicNav } from "@/components/public-nav"
import dynamic from 'next/dynamic'
const ProfileCard = dynamic(() => import('@/components/profile-card').then((mod) => mod.ProfileCard), { ssr: false, loading: () => null })
const ProductCardSimple = dynamic(() => import('@/components/product-card-simple').then((mod) => mod.ProductCardSimple), { ssr: false, loading: () => <div className="h-24 bg-muted" /> })
const ProductDetailModal = dynamic(() => import('@/components/product-detail-modal').then((mod) => mod.ProductDetailModal), { ssr: false, loading: () => null })
const RecipeDisplay = dynamic(() => import('@/components/recipe-display').then((mod) => mod.RecipeDisplay), { ssr: false, loading: () => <div className="h-48 bg-muted" /> })
const ProductMasonry = dynamic(() => import('@/components/product-masonry').then((mod) => mod.default), { ssr: false, loading: () => <div className="h-32" /> })
import { db } from "@/lib/db/storage"
import type { Product } from "@/lib/db/schema"
import Image from "next/image"
import { getPublicImageUrl } from "@/lib/image-url"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, List, Filter, SortAsc, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { ProfileHeader } from "@/components/profile-header"
import InitialLoading from '@/components/initial-loading'

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

function FilterContent({
	isMobile = false,
	searchText,
	setSearchText,
	viewMode,
	setViewMode,
	gridColumns,
	setGridColumns,
	layoutStyle,
	setLayoutStyle,
	sortMode,
	setSortMode,
	tagGroups,
	selectedTags,
	toggleTag,
	openGroups,
	setOpenGroups,
	setSelectedTags,
}: FilterContentProps) {
	const [localQuery, setLocalQuery] = useState<string>(searchText)
	const composingRef = useRef(false)
	const debounceRef = useRef<number | null>(null)

	useEffect(() => { setLocalQuery(searchText) }, [searchText])
	useEffect(() => {
		if (composingRef.current) return
		if (debounceRef.current) clearTimeout(debounceRef.current)
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
						<SelectTrigger className={`w-24 ${isMobile ? 'text-xs h-8' : ''}`}><SelectValue /></SelectTrigger>
						<SelectContent>
							{isMobile ? (<><SelectItem value="2">2列</SelectItem><SelectItem value="3">3列</SelectItem></>) : (<><SelectItem value="4">4列</SelectItem><SelectItem value="5">5列</SelectItem></>)}
						</SelectContent>
					</Select>
				</div>
			)}
			<div className="space-y-2">
				<Label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>並び替え</Label>
				<Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
					<SelectTrigger className={`w-full ${isMobile ? 'text-xs h-9' : ''}`}><SortAsc className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} /><SelectValue /></SelectTrigger>
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
								<Badge key={tag} variant="default" className={`cursor-pointer ${isMobile ? 'text-[10px] px-2 py-0.5' : ''}`} onClick={() => toggleTag(tag)}>{tag} <X className="w-3 h-3 ml-1" /></Badge>
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
												<Badge key={tag} variant={selectedTags.includes(tag) ? 'default' : 'outline'} className={`cursor-pointer hover:scale-105 transition-transform ${isMobile ? 'text-[10px] px-2 py-0.5' : ''}`} onClick={() => toggleTag(tag)}>{tag}</Badge>
											))}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
					{selectedTags.length > 0 && (
						<Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className={`w-full ${isMobile ? 'text-xs h-8' : ''}`}><X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />絞り込みを解除</Button>
					)}
				</div>
			)}
		</div>
	)
}

interface HomePageClientProps {
	initialProducts?: any[]
	initialCollections?: any[]
	initialTagGroups?: Record<string, string[]>
}

export default function HomePageClient({ initialProducts, initialCollections, initialTagGroups }: HomePageClientProps) {
	// SSR/ISR 初期データをそのまま初期状態に反映して、初回レンダで空白を避ける
	const hasInitial = Array.isArray(initialProducts) && initialProducts.length > 0
	const normalizeProducts = (items: any[]) =>
		(items || []).map((p: any) => {
			if (Array.isArray(p.images)) return p
			if (p.image && p.image.url) {
				return {
					...p,
					images: [
						{
							id: p.image.id || null,
							product_id: p.id,
							url: p.image.url,
							width: p.image.width || null,
							height: p.image.height || null,
							aspect:
								p.image.width && p.image.height
									? p.image.width / p.image.height
									: p.image.aspect || null,
							role: p.image.role || "main",
						},
					],
				}
			}
			return { ...p, images: [] }
		})

	const initialNormalizedProducts: Product[] = hasInitial
		? normalizeProducts(initialProducts!).filter((p: any) => p.published)
		: []

	const [products, setProducts] = useState<Product[]>(initialNormalizedProducts)
	const [recipes, setRecipes] = useState<any[]>([])
	const [collections, setCollections] = useState<any[]>(initialCollections || [])
	const [user, setUser] = useState<any>(db.user.get() || null)
	const [theme, setTheme] = useState<any>(null)
	const [isLoaded, setIsLoaded] = useState(hasInitial)
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
	const PAGE_DEFAULT_LIMIT = 24
	const [pageLimit] = useState<number>(PAGE_DEFAULT_LIMIT)
	const [pageOffset, setPageOffset] = useState<number>(initialNormalizedProducts.length)
	const [loadingMore, setLoadingMore] = useState<boolean>(false)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (openGroups === undefined && Object.keys(tagGroups).length > 0) { setOpenGroups(Object.keys(tagGroups)) }
		if (hasInitial) {
			// 既に初期描画済み。必要ならタグを補完取得。
			if (!initialTagGroups || Object.keys(initialTagGroups).length === 0) {
				;(async () => {
					try {
						const [groupsRes, tagsRes] = await Promise.all([
							fetch('/api/tag-groups'),
							fetch('/api/tags'),
						])
						const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
						const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
						const serverGroups = Array.isArray(groupsJson.data) ? groupsJson.data : groupsJson.data || []
						const serverTags = Array.isArray(tagsJson.data) ? tagsJson.data : tagsJson.data || []
						const groups: Record<string, string[]> = {}
						for (const g of serverGroups) { if (!g || !g.name) continue; groups[g.name] = [] }
						for (const t of serverTags) { const tagName = t.name; const groupName = t.group || '未分類'; if (!groups[groupName]) groups[groupName] = []; if (!groups[groupName].includes(tagName)) groups[groupName].push(tagName) }
						if (Object.keys(groups).length > 0) setTagGroups(groups)
					} catch {}
				})()
			}
			// 公開プロフィールは公開用APIで常に取得（Cookie不要）
			;(async () => {
				try {
					const res = await fetch('/api/profile')
					if (res.ok) {
						const pj = await res.json().catch(() => null)
						const u = pj?.data || pj || null
						if (u) setUser(u)
					}
				} catch {}
			})()
			return
		}
		;(async () => {
			try {
				const [prodRes, colRes] = await Promise.allSettled([
					fetch(`/api/products?published=true&shallow=true&limit=${pageLimit}&offset=0`),
					fetch("/api/collections"),
				])
				const prodJson = prodRes.status === 'fulfilled' ? await prodRes.value.json().catch(() => ({ data: [] })) : { data: [] }
				const colJson = colRes.status === 'fulfilled' ? await colRes.value.json().catch(() => ({ data: [] })) : { data: [] }
				const apiProducts = Array.isArray(prodJson.data) ? prodJson.data : []
				const apiCollections = Array.isArray(colJson.data) ? colJson.data : []
				const loadedRecipes = db.recipes.getAll()
				const loadedTheme = db.theme.get()
				let loadedUser: any = null
				try {
					const hasAccessCookie = typeof document !== 'undefined' && document.cookie.includes('sb-access-token=')
					if (hasAccessCookie) {
						const profileRes = await fetch('/api/profile', { credentials: 'include' })
						if (profileRes.ok) { const pj = await profileRes.json().catch(() => null); loadedUser = pj?.data || pj || null }
					}
				} catch {}
				if (!loadedUser) loadedUser = db.user.get()
				const normalizedProducts = apiProducts.map((p: any) => {
					if (Array.isArray(p.images)) return p
					if (p.image && p.image.url) {
						return { ...p, images: [{ id: p.image.id || null, product_id: p.id, url: p.image.url, width: p.image.width || null, height: p.image.height || null, aspect: p.image.width && p.image.height ? p.image.width / p.image.height : p.image.aspect || null, role: p.image.role || 'main' }] }
					}
					return { ...p, images: [] }
				})
				setProducts(normalizedProducts.filter((p: any) => p.published))
				setPageOffset(normalizedProducts.length)
				if ((prodJson as any)?.meta && typeof (prodJson as any).meta.total === 'number') { setHasMore(normalizedProducts.length < (prodJson as any).meta.total) } else { setHasMore(normalizedProducts.length === pageLimit) }
				setRecipes(loadedRecipes.filter((r: any) => r.published))
				setCollections(apiCollections)
				setUser(loadedUser || null)
				setTheme(loadedTheme)
				setIsLoaded(true)
				try {
					const [groupsRes, tagsRes] = await Promise.all([fetch('/api/tag-groups'), fetch('/api/tags')])
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
							;(p.tags as string[]).forEach((tag) => { const isLinkTag = tag === "Amazon" || tag === "楽天市場" || tag === "Yahoo!ショッピング" || tag === "公式サイト"; const groupName = isLinkTag ? "リンク先" : "その他"; if (!derived[groupName]) derived[groupName] = []; if (!derived[groupName].includes(tag)) derived[groupName].push(tag) })
						})
						setTagGroups(derived)
					} else { setTagGroups(groups) }
				} catch {
					const groups: Record<string, string[]> = {}
					apiProducts.filter((p: any) => p.published && Array.isArray(p.tags)).forEach((p: any) => {
						;(p.tags as string[]).forEach((tag) => { const isLinkTag = tag === "Amazon" || tag === "楽天市場" || tag === "Yahoo!ショッピング" || tag === "公式サイト"; const groupName = isLinkTag ? "リンク先" : "その他"; if (!groups[groupName]) { groups[groupName] = [] }; if (!groups[groupName].includes(tag)) { groups[groupName].push(tag) } })
					})
					setTagGroups(groups)
				}
			} catch (e) { 
				console.error("[v0] Failed to load public data", e)
				// フォールバック: エラーでもUIは出す
				setProducts([])
				setCollections([])
				setIsLoaded(true)
			}
			finally {
				// 予期せぬ経路でも確実に描画を進める
				setIsLoaded((prev) => prev || true)
			}
		})()
	}, [hasInitial, initialProducts, initialCollections, initialTagGroups])

	useEffect(() => {
		try { if (typeof window !== 'undefined') { const updateCols = () => { const isMobileViewport = window.innerWidth < 640; if (displayMode === 'gallery') { setGridColumns(isMobileViewport ? 2 : 7) } else { setGridColumns(isMobileViewport ? 2 : 5) } }; updateCols(); window.addEventListener('resize', updateCols); return () => window.removeEventListener('resize', updateCols) } } catch {}
	}, [displayMode])

	const thumbnailFor = (rawUrl: string | null | undefined, _w: number) => {
		// 事前生成サムネ/CDN配信を前提に、そのままURLを使う
		if (!rawUrl) return '/placeholder.svg'
		return rawUrl
	}

	useEffect(() => {
		try { if (typeof window !== 'undefined') { const isMobileViewport = window.innerWidth < 640; setGridColumns(isMobileViewport ? 2 : 5); const handler = () => { const el = document.getElementById('global-gallery-search'); if (!el) return; const top = el.getBoundingClientRect().top; setIsGallerySearchSticky(top <= 64) }; window.addEventListener('scroll', handler, { passive: true }); handler(); return () => { window.removeEventListener('scroll', handler) } } } catch {}
	}, [])

	const handleProductClick = async (product: Product, imageUrl?: string) => {
		setSelectedProduct(product); setSelectedImageUrl(imageUrl ?? null); setIsModalOpen(true)
		;(async () => { try { const res = await fetch(`/api/products?id=${encodeURIComponent(product.id)}`); if (res.ok) { const js = await res.json().catch(() => ({ data: [] })); const full = Array.isArray(js.data) && js.data.length > 0 ? js.data[0] : null; if (full) { setSelectedProduct(full) } } } catch (e) { console.error('[v0] failed to load full product for modal', e) } })()
	}

	const toggleTag = (tag: string) => { setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])) }
	const productMatches = (p: Product) => { const matchesTag = selectedTags.length === 0 || selectedTags.some((tag) => (p.tags || []).includes(tag)); const q = searchText.trim().toLowerCase(); const matchesText = !q || (p.title || '').toLowerCase().includes(q) || ((p.shortDescription || '').toLowerCase().includes(q)); return matchesTag && matchesText }
	const filteredAndSortedProducts = products.filter(productMatches).sort((a, b) => { switch (sortMode) { case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); case "clicks": return Math.random() - 0.5; case "price-asc": return (a.price || 0) - (b.price || 0); case "price-desc": return (b.price || 0) - (a.price || 0); default: return 0 } })
	const appliedStyle = theme ? { fontFamily: theme.fonts?.body || undefined } : {}
	const getProductsForCollection = (collectionId: string) => { const col = collections.find((c: any) => c.id === collectionId); return (col?.products || []) as Product[] }
	function shuffleArray<T>(arr: T[]) {
		const a = arr.slice()
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[a[i], a[j]] = [a[j], a[i]]
		}
		return a
	}
	const galleryItemsShuffled = useMemo(() => {
		if (displayMode !== 'gallery') return []
		return shuffleArray(
			products.flatMap((product) => {
				return (product.images || []).map((img: any, idx: number) => ({
					id: `${product.id}__${idx}`,
					productId: product.id,
					image: getPublicImageUrl(img.url) || img.url || "/placeholder.svg",
					aspect: img.aspect || undefined,
					title: product.title,
					href: `/products/${product.slug}`,
				}))
			})
		)
	}, [shuffleKey, products, displayMode])
	const productById = useMemo(() => { const m = new Map<string, Product>(); for (const p of products) m.set(p.id, p); return m }, [products])
	const loadMore = async () => { if (loadingMore || !hasMore) return; setLoadingMore(true); try { const res = await fetch(`/api/products?published=true&shallow=true&limit=${pageLimit}&offset=${pageOffset}`); if (!res.ok) throw new Error('failed to fetch'); const js = await res.json().catch(() => ({ data: [], meta: undefined })); const items = Array.isArray(js.data) ? js.data : []; const normalized = items.map((p: any) => { if (Array.isArray(p.images)) return p; if (p.image && p.image.url) { return { ...p, images: [{ id: p.image.id || null, product_id: p.id, url: p.image.url, width: p.image.width || null, height: p.image.height || null, aspect: p.image.width && p.image.height ? p.image.width / p.image.height : p.image.aspect || null, role: p.image.role || 'main' }] } } return { ...p, images: [] } }).filter((p: any) => p.published); setProducts((prev) => [...prev, ...normalized]); setPageOffset((prev) => prev + items.length); if (js?.meta && typeof js.meta.total === 'number') { setHasMore((prevOffset) => pageOffset + items.length < js.meta.total) } else { setHasMore(items.length === pageLimit) } } catch (e) { console.error('[v0] loadMore failed', e) } finally { setLoadingMore(false) } }
	const galleryItems = useMemo(() => { return galleryItemsShuffled.filter((item: any) => { const p = productById.get(item.productId); return p ? productMatches(p) : false }) }, [galleryItemsShuffled, productById, searchText, selectedTags])
	useEffect(() => { const node = sentinelRef.current; if (!node) return; const obs = new IntersectionObserver((entries) => { for (const e of entries) { if (e.isIntersecting) { loadMore() } } }, { root: null, rootMargin: '400px', threshold: 0.1 }); obs.observe(node); return () => obs.disconnect() }, [loadingMore, hasMore, pageOffset])
	if (!isLoaded) { return <InitialLoading /> }
	const changeDisplayMode = (mode: 'normal' | 'gallery') => { if (mode === displayMode) return; setIsTransitioning(true); setTimeout(() => { setDisplayMode(mode); if (mode === 'gallery') { setViewMode('grid'); setLayoutStyle('masonry'); setShuffleKey((k) => k + 1) } if (mode === 'normal') { setViewMode('grid'); setLayoutStyle('square') } setIsTransitioning(false) }, 250) }
	return (
		<div className="min-h-screen" style={appliedStyle}>
			<main className="min-h-screen pb-20 relative">
				<PublicNav logoUrl={user?.avatarUrl || user?.profileImage} siteName={user?.displayName || ""} />
				{user && <ProfileHeader user={user} />}
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="mb-8 flex justify-center">
						<div className="relative inline-flex items-center bg-muted p-1 rounded-full" style={{ width: 280 }}>
							<div className={`absolute top-1 left-1 h-8 w-1/2 bg-primary rounded-full transition-transform duration-300 ease-in-out ${displayMode === 'gallery' ? 'translate-x-full' : 'translate-x-0'}`} style={{ marginTop: '3px', width: '137px' }} aria-hidden />
							<button onClick={() => changeDisplayMode('normal')} aria-pressed={displayMode === 'normal'} className={`relative z-10 flex-1 text-sm font-medium px-4 py-2 text-center rounded-full ${displayMode === 'normal' ? 'text-white' : 'text-muted-foreground'}`}>Normal</button>
							<button onClick={() => changeDisplayMode('gallery')} aria-pressed={displayMode === 'gallery'} className={`relative z-10 flex-1 text-sm font-medium px-4 py-2 text-center rounded-full ${displayMode === 'gallery' ? 'text-white' : 'text-muted-foreground'}`}>Gallery</button>
						</div>
					</div>
					<div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
						{displayMode === 'gallery' ? (
							<section id="global-gallery" className="mb-16">
								<div className="gallery-search-viewport" style={{ position: 'sticky', top: '74px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', zIndex: isModalOpen ? 0 : 30 }}>
									<div id="global-gallery-search" className={`${isModalOpen ? 'z-0' : 'z-40'} mb-6 ${isGallerySearchSticky ? 'bg-white rounded-b-2xl shadow-md' : ''}`} style={{ width: 'calc(100dvw - 10px)', maxWidth: '80rem', boxSizing: 'border-box', marginInline: 'auto' }}>
										<div className="relative rounded-full border bg-background/80 backdrop-blur-sm shadow-sm overflow-hidden" role="search" aria-label="ギャラリー検索" style={{ width: 'calc(100% - 10px)', marginInline: 'auto', maxWidth: '80rem' }}>
											<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
											<input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setSearchText((e.target as HTMLInputElement).value) } }} placeholder="キーワードで検索" className="w-full bg-transparent py-3 pr-5 pl-10 text-sm outline-none placeholder:text-muted-foreground" />
										</div>
									</div>
								</div>
								<div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
									{galleryItems.length > 0 ? (
										<ProductMasonry key={`global-gallery-${shuffleKey}`} items={galleryItems} className="gap-3" fullWidth={true} columns={gridColumns} onItemClick={(id: string) => { const item: any = galleryItems.find((gi: any) => gi.id === id); const p = item ? products.find((pr) => pr.id === item.productId) : undefined; if (p) handleProductClick(p, item?.image) }} />
									) : (<p className="text-center text-muted-foreground py-16">そのワードに関連するものはまだないな...</p>)}
								</div>
							</section>
						) : (
							collections.length > 0 && (
								<section id="collections" className="mb-16">
									<h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 heading-with-vertical">Collection</h2>
									<div className="space-y-12">{collections.map((collection) => { const collectionProducts = getProductsForCollection(collection.id); return (<div key={collection.id} id={`collection-${collection.id}`} className="mb-12 scroll-mt-20"><h3 className="font-heading text-lg sm:text-xl font-semibold text-center mb-4">{collection.title}</h3>{collection.description && (<p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">{collection.description}</p>)}{collectionProducts.length > 0 ? (<div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 z-30">{collectionProducts.map((product) => (<ProductCardSimple key={product.id} product={product} onClick={() => handleProductClick(product)} />))}</div>) : (<p className="text-center text-muted-foreground py-8 text-sm">商品がありません</p>)}</div>) })}</div>
								</section>
							)
						)}
						{products.length > 0 && displayMode !== 'gallery' && (
							<section id="all-products" className="mb-16 scroll-mt-20">
								<h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center heading-with-vertical">All Items</h2>
								<p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">公開中の商品を一覧表示しています</p>
								<div className="mb-6">
									<div className="flex justify-center">
										<Button variant="outline" size="lg" onClick={() => setShowFilters(!showFilters)} className="gap-2 hidden sm:flex"><Filter className="w-4 h-4" />Sort{selectedTags.length > 0 && (<Badge variant="secondary" className="ml-2">{selectedTags.length}件</Badge>)}</Button>
										<Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
											<SheetTrigger asChild>
												<Button variant="outline" size="lg" className="gap-2 sm:hidden bg-transparent"><Filter className="w-4 h-4" />Sort{selectedTags.length > 0 && (<Badge variant="secondary" className="ml-2">{selectedTags.length}件</Badge>)}</Button>
											</SheetTrigger>
											<SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-4 pb-0 flex flex-col">
												<SheetHeader className="pb-4 border-b"><SheetTitle className="text-base">絞り込み・並び替え</SheetTitle></SheetHeader>
												<div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"><div className="mx-auto w-full max-w-md px-1"><FilterContent isMobile={true} searchText={searchText} setSearchText={setSearchText} viewMode={viewMode} setViewMode={setViewMode} gridColumns={gridColumns} setGridColumns={setGridColumns} layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} sortMode={sortMode} setSortMode={setSortMode} tagGroups={tagGroups} selectedTags={selectedTags} toggleTag={toggleTag} openGroups={openGroups} setOpenGroups={setOpenGroups} setSelectedTags={setSelectedTags} /></div></div>
												<div className="py-4 border-t bg-background sticky bottom-0"><Button className="w-full h-10 text-sm" onClick={() => setIsFilterSheetOpen(false)}>適用する</Button></div>
											</SheetContent>
										</Sheet>
									</div>
									{showFilters && (
										<div className="mt-4 border rounded-lg p-6 bg-card animate-in fade-in slide-in-from-top-2 duration-300 hidden sm:block">
											<FilterContent searchText={searchText} setSearchText={setSearchText} viewMode={viewMode} setViewMode={setViewMode} gridColumns={gridColumns} setGridColumns={setGridColumns} layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} sortMode={sortMode} setSortMode={setSortMode} tagGroups={tagGroups} selectedTags={selectedTags} toggleTag={toggleTag} openGroups={openGroups} setOpenGroups={setOpenGroups} setSelectedTags={setSelectedTags} />
										</div>
									)}
								</div>
								{viewMode === "grid" ? (
									<div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
										{filteredAndSortedProducts.map((product) => (
											<div key={product.id} className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" onClick={() => handleProductClick(product)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProductClick(product) } }} aria-label={product.title}>
												<Image src={thumbnailFor(getPublicImageUrl(product.images?.[0]?.url) || product.images?.[0]?.url, 400)} alt={product.title} fill className="object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105" />
											</div>
										))}
									</div>
								) : (
									<div className="space-y-3">{filteredAndSortedProducts.map((product) => (
										<div key={product.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-card" onClick={() => handleProductClick(product)}>
											<div className="relative w-24 h-24 shrink-0"><Image src={thumbnailFor(product.images[0]?.url, 160)} alt={product.title} fill className="object-cover rounded" /></div>
											<div className="flex-1"><h3 className="font-semibold mb-1">{product.title}</h3><p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription}</p>{product.price && <p className="text-lg font-bold mt-2">¥{product.price.toLocaleString()}</p>}</div>
										</div>
									))}</div>
								)}
								{filteredAndSortedProducts.length === 0 && (<p className="text-center text-muted-foreground py-16">そのワードに関連するものはまだないな...</p>)}
							</section>
						)}
						{recipes.length > 0 && displayMode !== 'gallery' && (
							<section id="recipes" className="mb-16 scroll-mt-20">
								<h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center">Recipe</h2>
								<p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">実際のデスク環境と使用アイテムを紹介します</p>
								<div className="space-y-12">{recipes.map((recipe, index) => { const pins = db.recipePins.getByRecipeId(recipe.id); if (!recipe.imageDataUrl) return null; const linkedProductIds = [...new Set(pins.map((pin: any) => pin.productId).filter(Boolean))]; const linkedProducts = products.filter((p) => linkedProductIds.includes(p.id)); const isEvenIndex = index % 2 === 0; const imageFirst = isEvenIndex; return (<div key={recipe.id} className="p-3 md:p-6 bg-card shadow-md rounded-t-md rounded-b-md bg-linear-to-b from-card to-transparent"><h3 className="font-heading text-xl sm:text-2xl font-semibold mb-6 text-center">{recipe.title}</h3><div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-transparent"><div className={`w-full md:w-1/2 ${imageFirst ? "md:order-1" : "md:order-2"}`}> <RecipeDisplay recipeId={recipe.id} recipeTitle={recipe.title} imageDataUrl={recipe.imageDataUrl} imageUrl={recipe.imageUrl} imageWidth={recipe.imageWidth} imageHeight={recipe.imageHeight} pins={pins} products={products} onProductClick={handleProductClick} /></div><div className={`w-full bg-transparent md:w-1/2 ${imageFirst ? "md:order-2" : "md:order-1"}`}>{linkedProducts.length > 0 && (<div><h4 className="font-heading text-base sm:text-lg font-semibold mb-4 text-center md:text-left">使用アイテム</h4><div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 gap-3">{linkedProducts.map((product) => (<ProductCardSimple key={product.id} product={product} onClick={() => handleProductClick(product)} />))}</div></div>)}</div></div></div>) })}</div>
							</section>
						)}
						<div ref={sentinelRef as any} className="w-full flex items-center justify-center py-4">{loadingMore ? (<div className="text-sm text-muted-foreground">読み込み中...</div>) : !hasMore ? (<div className="text-sm text-muted-foreground">ここまで</div>) : null}</div>
						<section id="profile" className="mb-16 scroll-mt-20"><div className={`transition-opacity duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>{user && <ProfileCard user={user} />}</div></section>
					</div>
				</div>
			</main>
			<footer className="border-t mt-16 py-8"><div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground"><p>© 2025 {user?.displayName || "User"}. All rights reserved.</p></div></footer>
			<ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialImageUrl={selectedImageUrl ?? undefined} />
		</div>
	)
}

