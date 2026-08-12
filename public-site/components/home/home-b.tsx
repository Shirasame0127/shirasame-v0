"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Filter, Mail, Menu, RefreshCw, Search, X } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ProfileHeader } from "@/components/profile-header"
import MagazineNav, { MAGAZINE_PANEL_ID } from "@/components/home/magazine-nav"
import { SocialLinks } from "@/components/social-links"
import GalleryGrid from "@/components/home/gallery-grid"
import ProductModalB from "@/components/home/product-modal-b"
import { STRIP_VIEWS, isHomeView, viewMeta, type HomeView } from "@/components/home/views"
import { FIRST_PAGE_SIZE, type HomeData } from "@/lib/use-home-data"
import { trackAb } from "@/lib/ab"

const RecipeDisplay = dynamic(() => import("@/components/recipe-display").then((m) => m.RecipeDisplay), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-white/60" />,
})

/**
 * Variant B — variant A's structure, restyled as a comic-magazine cover.
 *
 * Keeps A's four surfaces (collections, recipes, all items, gallery) and its
 * behaviours; what changes is the presentation: graph paper, thin mint panel
 * rules, a centred wordmark band, vertical Japanese section titles and pink
 * cover copy. Theme tokens live in globals.css under `[data-ab="b"]`.
 *
 * The surfaces stay switchable rather than stacked, because stacking pushed
 * collections and recipes below a gallery that grows every week.
 */

type SortMode = "newest" | "title"

const TAGLINE = "デスクとガジェットの紹介誌"

/** Offset the index strip rests at once pinned — flush with the top of the viewport. */
const STRIP_TOP = 0

function readInitialState() {
  if (typeof window === "undefined") return { view: "collections" as HomeView, q: "", tags: [] as string[] }
  const params = new URLSearchParams(window.location.search)
  const view = params.get("view")
  return {
    view: isHomeView(view) ? view : ("collections" as HomeView),
    q: params.get("q") || "",
    tags: (params.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  }
}

/**
 * Framed square product card.
 *
 * `showTitle: false` drops the caption and the inner frame padding, so the
 * photo fills the whole cell — used by the collection view, where the covers
 * carry the meaning and the names underneath were just noise.
 */
function ItemCard({
  product,
  onClick,
  showTitle = true,
  saleName,
}: {
  product: any
  onClick: () => void
  showTitle?: boolean
  saleName?: string | null
}) {
  const src = product?.main_image?.src || product?.images?.[0]?.url || "/placeholder.svg"
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div
        className={`m-panel relative overflow-hidden transition-colors group-hover:border-[var(--m-pink-soft)] ${
          showTitle ? "p-1.5" : "p-0"
        }`}
      >
        {saleName && (
          <span className="m-label absolute left-1.5 top-1.5 z-10 rounded-full bg-[var(--m-pink)] px-2 py-0.5 text-[10px] leading-none text-white shadow-sm">
            {saleName}
          </span>
        )}
        {/* With padding, the image needs its own smaller radius inside the frame.
            Without it, the frame's own radius is the only one that should show —
            a second radius here left a visible mismatch at the corners. */}
        <div className={`aspect-square overflow-hidden bg-white ${showTitle ? "rounded-lg" : ""}`}>
          <img
            src={src}
            alt={product?.title || ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            onError={(e) => {
              const el = e.currentTarget
              el.onerror = null
              el.src = "/placeholder.svg"
            }}
          />
        </div>
      </div>
      {showTitle && (
        /* Always two lines tall. Letting it grow from one line to two gave
           neighbouring cards different heights and left the grid ragged.
           2 x 1.45 line-height = 2.9em. */
        <p className="m-label mt-1.5 line-clamp-2 min-h-[2.9em] px-0.5 text-[var(--m-ink)] transition-colors group-hover:text-[var(--m-teal)]">
          {product?.title || ""}
        </p>
      )}
    </button>
  )
}

/** Panel header bar: teal fill, white display type, count on the right. */
function PanelHeader({
  title,
  description,
  meta,
  attached = false,
}: {
  title: string
  description?: string | null
  meta?: string
  /** Sit flush against the block below instead of leaving a gap. */
  attached?: boolean
}) {
  return (
    <header className={attached ? "" : "mb-4"}>
      <div className="flex items-center justify-between gap-3 rounded-t-xl bg-[var(--m-teal)] px-4 py-2.5">
        <h3 className="m-subheading truncate text-base text-white">{title}</h3>
        {meta && <span className="m-display shrink-0 text-xs text-white/85">{meta}</span>}
      </div>
      {description && (
        <p className="m-copy border-x-2 border-b-2 border-[var(--m-rule)] bg-white px-4 py-2 text-sm">
          {description}
        </p>
      )}
    </header>
  )
}

export default function HomeB({ data }: { data: HomeData }) {
  const {
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
  } = data

  const initial = useRef(readInitialState())
  const [view, setView] = useState<HomeView>(initial.current.view)
  const [searchText, setSearchText] = useState(initial.current.q)
  const [queryInput, setQueryInput] = useState(initial.current.q)
  const [selectedTags, setSelectedTags] = useState<string[]>(initial.current.tags)
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Two column scales. The gallery is a photo wall, so it stays airy; the card
  // grids (all items, the item list under a recipe) are contact sheets and run
  // denser — four across on a phone.
  const [galleryColumns, setGalleryColumns] = useState(2)
  const [cardColumns, setCardColumns] = useState(4)
  const [selected, setSelected] = useState<{
    product: any
    image?: string
  } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Filter state for the "全アイテム" block at the foot of the collection view.
  // Kept separate from the items/gallery tabs' filters so the two don't fight.
  const [allQuery, setAllQuery] = useState("")
  const [allDebounced, setAllDebounced] = useState("")
  const [allTags, setAllTags] = useState<string[]>([])
  const [isStripStuck, setIsStripStuck] = useState(false)
  const stripSentinelRef = useRef<HTMLDivElement | null>(null)

  const composingRef = useRef(false)
  const allComposingRef = useRef(false)
  useEffect(() => {
    if (allComposingRef.current) return
    const id = window.setTimeout(() => setAllDebounced(allQuery), 250)
    return () => window.clearTimeout(id)
  }, [allQuery])

  // Most-used tags across the catalogue, for the quick chip rail.
  const allRankedTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products as any[]) {
      for (const t of Array.isArray(p.tags) ? p.tags : []) counts.set(t, (counts.get(t) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .map(([t]) => t)
      .slice(0, 20)
  }, [products])

  const allFiltered = useMemo(() => {
    const q = allDebounced.trim().toLowerCase()
    const tags = allTags.map((t) => t.toLowerCase())
    return (products as any[]).filter((p) => {
      if (q && !`${p.title || ""} ${p.shortDescription || ""}`.toLowerCase().includes(q)) return false
      if (tags.length) {
        const own = (Array.isArray(p.tags) ? p.tags : []).map((t: string) => t.toLowerCase())
        if (!tags.every((t) => own.includes(t))) return false
      }
      return true
    })
  }, [products, allDebounced, allTags])

  const toggleAllTag = (tag: string) =>
    setAllTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  const allHasFilters = allDebounced.length > 0 || allTags.length > 0
  useEffect(() => {
    if (composingRef.current) return
    const id = window.setTimeout(() => setSearchText(queryInput), 250)
    return () => window.clearTimeout(id)
  }, [queryInput])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    view === "collections" ? params.delete("view") : params.set("view", view)
    searchText ? params.set("q", searchText) : params.delete("q")
    selectedTags.length ? params.set("tags", selectedTags.join(",")) : params.delete("tags")
    const qs = params.toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
  }, [view, searchText, selectedTags])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setGalleryColumns(w < 480 ? 2 : w < 768 ? 3 : w < 1280 ? 4 : 5)
      setCardColumns(w < 768 ? 4 : w < 1280 ? 5 : 6)
    }
    update()
    let timer: number | null = null
    const onResize = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(update, 150)
    }
    window.addEventListener("resize", onResize)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // A sticky element cannot report its own stuck state, so watch a sentinel
  // sitting directly above it: once the sentinel clears the strip's top offset,
  // the strip is pinned.
  useEffect(() => {
    const node = stripSentinelRef.current
    if (!node) return
    const obs = new IntersectionObserver(([entry]) => setIsStripStuck(!entry.isIntersecting), {
      rootMargin: `-${STRIP_TOP + 1}px 0px 0px 0px`,
      threshold: 0,
    })
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const changeView = useCallback((next: HomeView) => {
    setView(next)
    trackAb("view_change", { ab_variant: "b", home_view: next })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const openProduct = useCallback((product: any, image?: string) => {
    trackAb("product_open", { ab_variant: "b", product_id: product?.id })
    setSelected({ product, image })
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.concat(tag)))
  }, [])

  const matches = useCallback(
    (title: string | null | undefined, description: string | null | undefined, tags: string[]) => {
      const q = searchText.trim().toLowerCase()
      if (q && !`${title || ""} ${description || ""}`.toLowerCase().includes(q)) return false
      if (selectedTags.length > 0) {
        const own = tags.map((t) => t.toLowerCase())
        if (!selectedTags.map((t) => t.toLowerCase()).every((t) => own.includes(t))) return false
      }
      return true
    },
    [searchText, selectedTags],
  )

  const filteredGallery = useMemo(
    () => galleryItems.filter((i) => matches(i.title, i.shortDescription, i.tags)),
    [galleryItems, matches],
  )
  const filteredProducts = useMemo(() => {
    const out = products.filter((p: any) =>
      matches(p.title, p.shortDescription, Array.isArray(p.tags) ? p.tags : []),
    )
    return sortMode === "title"
      ? out.slice().sort((a: any, b: any) => (a.title || "").localeCompare(b.title || "", "ja"))
      : out
  }, [products, matches, sortMode])

  const hasFilters = searchText.length > 0 || selectedTags.length > 0
  const clearFilters = () => {
    setQueryInput("")
    setSearchText("")
    setSelectedTags([])
  }

  // The API hands the avatar back under several names depending on age.
  const profileImage =
    (user as any)?.profileImage ||
    (user as any)?.profile_image ||
    (user as any)?.avatarUrl ||
    (user as any)?.avatar_url ||
    null

  const meta = viewMeta(view)
  const showSearch = view === "items" || view === "gallery"
  const counts: Record<HomeView, number> = {
    collections: collections.length,
    recipes: recipes.length,
    items: products.length,
    gallery: galleryItems.length,
  }
  const cardGridStyle = {
    gridTemplateColumns: `repeat(${cardColumns}, minmax(0, 1fr))`,
  }

  if (status === "error") {
    return (
      <div className="m-paper min-h-screen">
        <MagazineNav
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          view={view}
          onSelectView={changeView}
          collections={[]}
          recipes={[]}
          onSelectAnchor={() => {}}
        />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="m-display text-xl">読み込めませんでした</p>
          <p className="max-w-md text-sm text-[var(--m-ink-soft)]">
            通信が不安定か、サーバーが応答していないようです。
            {error ? `（${error}）` : ""}
          </p>
          <button
            onClick={retry}
            className="m-display inline-flex items-center gap-2 rounded-full border-2 border-[var(--m-teal)] bg-[var(--m-teal)] px-5 py-2.5 text-sm text-white"
          >
            <RefreshCw className="h-4 w-4" />
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="m-paper min-h-screen">
      <MagazineNav
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        view={view}
        onSelectView={changeView}
        collections={collections.map((c: any) => ({
          id: String(c.id),
          label: c.title || "",
        }))}
        recipes={recipes.map((r: any) => ({
          id: String(r.id),
          label: r.title || "",
        }))}
        floatingTriggerHidden={isStripStuck}
        onSelectAnchor={(nextView, elementId) => {
          setView(nextView)
          // Wait a frame for the surface to mount before scrolling to it.
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "start" }),
            ),
          )
        }}
      />
      {user ? (
        <ProfileHeader user={user as any} />
      ) : (
        // The nav is fixed and overlays the profile header image by design.
        // Without a header image there is nothing to overlay, so reserve its height.
        <div className="h-16" aria-hidden />
      )}

      {/* On a phone the cover furniture (issue badge, wordmark, strapline, bio)
          all sits at the foot of the page so the catalogue starts immediately;
          from `sm` up the masthead returns to the top where a cover belongs.
          Ordering is done with flex `order` rather than duplicating markup. */}
      <main className="mx-auto flex max-w-6xl flex-col px-3 pb-24 sm:px-5">
        {/* ---- Masthead: issue badge, tagline, wordmark, cover copy ---- */}
        <section className="relative order-4 border-x-2 border-b-2 border-[var(--m-rule)] bg-white/70 px-4 pb-8 pt-6 sm:order-1 sm:px-8">
          <div className="absolute left-0 top-0 rounded-br-xl bg-[var(--m-teal)] px-3 py-1">
            <span className="m-display text-[11px] text-white">全 {products.length} アイテム</span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="m-rule-line flex-1" />
            {/* Keeps its own face whatever the reader picks in the index panel,
                and never wraps — "白雨(しらさめ)" was breaking at the bracket on
                narrow screens, so the size scales with the viewport instead. */}
            <h1 className="m-wordmark whitespace-nowrap text-center text-[clamp(1.75rem,8.5vw,4.5rem)]">
              {user?.displayName || "しらさめ"}
            </h1>
            <span className="m-rule-line flex-1" />
          </div>

          {/* Outbound links carried over from the previous design. */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <a
              href="https://shirasame.my.canva.site/shirasame"
              target="_blank"
              rel="noopener noreferrer"
              className="m-subheading inline-flex items-center rounded-full bg-[var(--m-ink)] px-6 py-3 text-sm text-white shadow-md transition-colors hover:bg-black"
            >
              このサイトになかったアイテムはこちら
            </a>
            <a
              href="https://shirasame-store.booth.pm/"
              target="_blank"
              rel="noopener noreferrer"
              className="m-subheading inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm text-white shadow-md transition-colors hover:bg-[#e55a00]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#ff6a00]">
                B
              </span>
              壁紙やグッズはこちら（Booth）
            </a>
          </div>
        </section>

        {/* ---- Index strip: the four surfaces ---- */}
        <div ref={stripSentinelRef} aria-hidden className="order-1 h-px sm:order-2" />

        <nav
          aria-label="表示の切り替え"
          style={{ top: STRIP_TOP }}
          className={`sticky z-40 order-1 border-x-2 border-b-2 border-[var(--m-rule)] bg-[var(--m-paper)]/95 px-2 backdrop-blur-sm transition-[padding,box-shadow] duration-300 motion-reduce:transition-none sm:order-2 ${
            isStripStuck ? "py-1 shadow-[0_6px_16px_rgba(31,35,40,0.10)]" : "py-2"
          }`}
        >
          <div className="flex items-center gap-1">
            <ul className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STRIP_VIEWS.map((v) => {
                const active = v.id === view
                return (
                  <li key={v.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => changeView(v.id)}
                      aria-current={active ? "page" : undefined}
                      className={`m-display w-full whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-[var(--m-teal)] text-white"
                          : "text-[var(--m-ink-soft)] hover:bg-[#eaf7f7] hover:text-[var(--m-teal)]"
                      }`}
                    >
                      {v.label}
                      {counts[v.id] > 0 && (
                        <span
                          className={`ml-1.5 text-[11px] ${active ? "text-white/80" : "text-[var(--m-ink-soft)]"}`}
                        >
                          {counts[v.id]}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

              {/* Contact and the index are absorbed into the strip once it pins.
                Both grow in from zero width so the tabs slide over rather than
                jumping. */}
            <a
              href="#profile"
              aria-label="連絡先を見る"
              tabIndex={isStripStuck ? undefined : -1}
              aria-hidden={isStripStuck ? undefined : true}
              className={`flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-[var(--m-rule)] bg-white text-[var(--m-teal)] transition-all duration-300 motion-reduce:transition-none ${
                isStripStuck
                  ? "w-10 scale-100 border-2 opacity-100"
                  : "pointer-events-none w-0 scale-75 border-0 opacity-0"
              }`}
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden />
            </a>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls={MAGAZINE_PANEL_ID}
              aria-label="目次を開く"
              tabIndex={isStripStuck ? undefined : -1}
              aria-hidden={isStripStuck ? undefined : true}
              className={`flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-[var(--m-rule)] bg-white text-[var(--m-ink)] transition-all duration-300 motion-reduce:transition-none ${
                isStripStuck
                  ? "w-10 scale-100 border-2 opacity-100"
                  : "pointer-events-none w-0 scale-75 border-0 opacity-0"
              }`}
            >
              <Menu className="h-5 w-5 shrink-0" />
            </button>
          </div>

          {showSearch && (
            <div className="mt-2 flex items-center gap-2 px-1 pb-1">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--m-ink-soft)]" />
                <input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onCompositionStart={() => {
                    composingRef.current = true
                  }}
                  onCompositionEnd={(e) => {
                    composingRef.current = false
                    setQueryInput((e.target as HTMLInputElement).value)
                  }}
                  placeholder="キーワードで探す"
                  aria-label="検索"
                  className="h-11 w-full rounded-full border-2 border-[var(--m-rule-soft)] bg-white pl-10 pr-9 text-sm text-[var(--m-ink)] outline-none focus:border-[var(--m-rule)]"
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={() => setQueryInput("")}
                    aria-label="検索をクリア"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--m-ink-soft)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="m-display flex h-11 items-center gap-2 rounded-full border-2 border-[var(--m-rule)] bg-white px-4 text-sm text-[var(--m-ink)]"
              >
                <Filter className="h-4 w-4" />
                絞り込み
                {selectedTags.length > 0 && (
                  <span className="rounded-full bg-[var(--m-pink)] px-1.5 text-[11px] text-white">
                    {selectedTags.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {showSearch && hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--m-pink)] px-3 py-1 text-xs text-white"
                >
                  {tag}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button onClick={clearFilters} className="px-2 text-xs text-[var(--m-ink-soft)] underline">
                すべて解除
              </button>
            </div>
          )}
        </nav>

        {/* ---- Body: content left, vertical section title on the right ---- */}
        {/* `isolate` keeps content z-indexes (recipe pins, gallery hover) inside
            their own stacking context so they can never paint over the strip. */}
        <div className="isolate order-2 flex gap-5 border-x-2 border-b-2 border-[var(--m-rule)] bg-white/50 px-3 pb-10 pt-6 sm:order-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <h2 className="m-heading text-3xl text-[var(--m-teal)] sm:text-4xl">{meta.title}</h2>
              <p className="m-copy mt-1.5 text-sm">{meta.subtitle}</p>
            </div>

            {status === "loading" ? (
              <div className="grid gap-3" style={cardGridStyle} aria-hidden>
                {Array.from({ length: cardColumns * 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="m-panel-soft animate-pulse"
                    style={{ height: 120 + ((i * 37) % 90) }}
                  />
                ))}
              </div>
            ) : (
              <>
                {view === "collections" && (
                  <div className="space-y-10">
                    {collections.length === 0 && (
                      <p className="py-16 text-center text-sm text-[var(--m-ink-soft)]">{meta.empty}</p>
                    )}
                    {collections.map((collection: any) => {
                      const items = collection.products || []
                      return (
                        <section
                          key={collection.id}
                          id={`collection-${collection.id}`}
                          className="scroll-mt-28"
                        >
                          <PanelHeader
                            title={collection.title}
                            description={collection.description}
                            meta={`${items.length} 件`}
                          />
                          {items.length === 0 ? (
                            <p className="py-6 text-center text-sm text-[var(--m-ink-soft)]">
                              このコレクションにはまだアイテムがありません
                            </p>
                          ) : (
                            <div className="grid gap-2" style={cardGridStyle}>
                              {items.map((product: any) => (
                                <ItemCard
                                  key={product.id}
                                  product={product}
                                  showTitle={false}
                                  saleName={activeSaleMap.get(String(product.id))}
                                  onClick={() => openProduct(product, product?.images?.[0]?.url)}
                                />
                              ))}
                            </div>
                          )}
                        </section>
                      )
                    })}

                    {/* The full catalogue lives at the foot of this view, so
                        browsing collections flows straight into everything else
                        without needing a separate tab. */}
                    {products.length > 0 && (
                      <section id="all-items" className="scroll-mt-28 pt-6">
                        {/* A full section header, not a collection-style panel bar:
                            this is the whole catalogue, so it gets the large
                            display heading the section titles use. */}
                        <div className="mb-4 border-b-2 border-[var(--m-rule)] pb-3">
                          <div className="flex items-end justify-between gap-3">
                            <h3 className="m-heading text-3xl text-[var(--m-teal)] sm:text-4xl">All Items</h3>
                            <span className="m-display shrink-0 pb-1 text-xs text-[var(--m-ink-soft)]">
                              {allHasFilters ? `${allFiltered.length} / ${products.length} 件` : `${products.length} 件`}
                            </span>
                          </div>
                          <p className="m-copy mt-1 text-sm">登録されているアイテムの一覧です</p>
                        </div>

                        {/* Search + tag chips, scoped to this block. */}
                        <div className="mb-4 space-y-3">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--m-ink-soft)]" />
                            <input
                              value={allQuery}
                              onChange={(e) => setAllQuery(e.target.value)}
                              onCompositionStart={() => {
                                allComposingRef.current = true
                              }}
                              onCompositionEnd={(e) => {
                                allComposingRef.current = false
                                setAllQuery((e.target as HTMLInputElement).value)
                              }}
                              placeholder="全アイテムを検索"
                              aria-label="全アイテムを検索"
                              className="h-11 w-full rounded-full border-2 border-[var(--m-rule-soft)] bg-white pl-10 pr-9 text-sm text-[var(--m-ink)] outline-none focus:border-[var(--m-rule)]"
                            />
                            {allQuery && (
                              <button
                                type="button"
                                onClick={() => setAllQuery("")}
                                aria-label="検索をクリア"
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--m-ink-soft)]"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {allRankedTags.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {allHasFilters && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAllQuery("")
                                    setAllTags([])
                                  }}
                                  className="m-display shrink-0 rounded-full border-2 border-[var(--m-rule-soft)] bg-white px-3 py-1.5 text-xs text-[var(--m-ink-soft)]"
                                >
                                  リセット
                                </button>
                              )}
                              {allRankedTags.map((tag) => {
                                const on = allTags.includes(tag)
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleAllTag(tag)}
                                    aria-pressed={on}
                                    className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs transition-colors ${
                                      on
                                        ? "border-[var(--m-pink)] bg-[var(--m-pink)] text-white"
                                        : "border-[var(--m-rule-soft)] bg-white text-[var(--m-ink-soft)]"
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {allFiltered.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 py-14 text-center">
                            <p className="text-sm text-[var(--m-ink-soft)]">条件に合うアイテムがありません</p>
                            <button
                              onClick={() => {
                                setAllQuery("")
                                setAllTags([])
                              }}
                              className="m-display rounded-full border-2 border-[var(--m-rule)] bg-white px-4 py-2 text-sm"
                            >
                              条件をリセット
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-3" style={cardGridStyle}>
                            {allFiltered.map((product: any) => (
                              <ItemCard
                                key={`all-${product.id}`}
                                product={product}
                                saleName={activeSaleMap.get(String(product.id))}
                                onClick={() => openProduct(product, product?.images?.[0]?.url)}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                )}

                {view === "recipes" && (
                  <div className="space-y-14">
                    {recipes.length === 0 && (
                      <p className="py-16 text-center text-sm text-[var(--m-ink-soft)]">{meta.empty}</p>
                    )}
                    {recipes.map((recipe: any) => {
                      const items: any[] = Array.isArray(recipe.items) ? recipe.items : []
                      return (
                        <section key={recipe.id} id={`recipe-${recipe.id}`} className="scroll-mt-28">
                          {/* Header and photo form one panel: the title bar rounds
                              the top, the photo squares off against it, and the
                              frame closes underneath. Both are capped at the same
                              width so the seam lines up — and portrait photos stay
                              legible instead of dwarfing a wide screen. */}
                          <div className="mx-auto max-w-xl">
                            <PanelHeader
                              title={recipe.title}
                              description={recipe.body}
                              meta={`${recipe.pins?.length ?? 0} 個の印`}
                              attached
                            />
                            <div className="m-recipe-figure overflow-hidden rounded-b-xl border-x-2 border-b-2 border-[var(--m-rule)] bg-white">
                              <RecipeDisplay
                                recipeId={String(recipe.id)}
                                recipeTitle={recipe.title}
                                imageUrl={recipe.imageUrl}
                                imageDataUrl={recipe.imageDataUrl || ""}
                                imageWidth={recipe.imageWidth ?? 0}
                                imageHeight={recipe.imageHeight ?? 0}
                                items={items}
                                pins={recipe.pins || []}
                                products={products}
                                onProductClick={(product: any, imageUrl?: string) =>
                                  openProduct(product, imageUrl)
                                }
                              />
                            </div>
                          </div>
                          {items.length > 0 && (
                            <div className="mt-6">
                              <div className="grid gap-2" style={cardGridStyle}>
                                {items.map((product: any) => (
                                  <ItemCard
                                    key={product.id}
                                    product={product}
                                    showTitle={false}
                                    onClick={() => openProduct(product, product?.main_image?.src)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </section>
                      )
                    })}
                  </div>
                )}

                {view === "items" &&
                  (filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <p className="text-sm text-[var(--m-ink-soft)]">
                        {hasFilters ? "条件に合うアイテムがありません" : meta.empty}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="m-display rounded-full border-2 border-[var(--m-rule)] bg-white px-4 py-2 text-sm"
                        >
                          条件をリセット
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3" style={cardGridStyle}>
                      {filteredProducts.map((product: any) => (
                        <ItemCard
                          key={product.id}
                          product={product}
                          saleName={activeSaleMap.get(String(product.id))}
                          onClick={() => openProduct(product, product?.images?.[0]?.url)}
                        />
                      ))}
                    </div>
                  ))}

                {view === "gallery" &&
                  (filteredGallery.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <p className="text-sm text-[var(--m-ink-soft)]">
                        {hasFilters ? "条件に合う写真がありません" : meta.empty}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="m-display rounded-full border-2 border-[var(--m-rule)] bg-white px-4 py-2 text-sm"
                        >
                          条件をリセット
                        </button>
                      )}
                    </div>
                  ) : (
                    <GalleryGrid
                      items={filteredGallery}
                      columns={galleryColumns}
                      eagerCount={FIRST_PAGE_SIZE}
                      onItemClick={(id) => {
                        const item = galleryItems.find((g) => g.id === id)
                        if (!item) return
                        const product =
                          products.find((p: any) => String(p.id) === String(item.productId)) ||
                          ({
                            id: item.id,
                            title: item.title,
                            images: [{ url: item.image }],
                          } as any)
                        openProduct(product, item.image)
                      }}
                    />
                  ))}

                {isBackfilling && (view === "gallery" || view === "items") && (
                  <p className="m-display py-6 text-center text-xs text-[var(--m-ink-soft)]">
                    さらに読み込んでいます…
                  </p>
                )}
              </>
            )}
          </div>

          {/* Vertical section title, desktop only — decorative, and 縦書き costs
              more legibility than it gains on a phone. */}
          <aside className="hidden shrink-0 lg:block" aria-hidden>
            <div className="sticky top-28">
              <p className="m-vertical text-4xl text-[var(--m-ink)]">{meta.label}</p>
            </div>
          </aside>
        </div>

        {/* ---- Colophon: the strapline and profile blurb, in the 奥付 position
             a Japanese magazine puts them — the back, not the cover. ---- */}
        {/* Colophon, and the profile: the avatar and the contact links were part
            of the previous design and were dropped in this rebuild. `id` matches
            the Contact link in the header. */}
        <section
          id="profile"
          className="order-5 scroll-mt-24 border-x-2 border-b-2 border-[var(--m-rule)] bg-white/70 px-4 py-10 text-center sm:order-4"
        >
          {profileImage && (
            <img
              src={profileImage}
              alt={user?.displayName || ""}
              width={112}
              height={112}
              loading="lazy"
              decoding="async"
              className="mx-auto mb-4 h-28 w-28 rounded-full border-2 border-[var(--m-rule)] object-cover shadow-md"
            />
          )}

          <p className="m-subheading text-sm tracking-[0.3em] text-[var(--m-teal)]">［ SHIRASAME ］</p>
          <p className="m-subheading mt-2 text-xs tracking-[0.2em] text-[var(--m-ink-soft)]">{TAGLINE}</p>
          {user?.bio && (
            <p className="m-subheading mx-auto mt-5 max-w-xl whitespace-pre-wrap text-sm font-normal leading-relaxed text-[var(--m-ink)]">
              {user.bio}
            </p>
          )}

          {user?.socialLinks && (
            <div className="mt-6 flex justify-center">
              <SocialLinks links={user.socialLinks} />
            </div>
          )}
        </section>

        {/* ---- Bottom band: the cover's "new titles" strip ---- */}
        {products.length > 0 && (
          <section className="order-3 border-x-2 border-b-2 border-[var(--m-rule)] bg-white/70 px-4 py-5 sm:order-5">
            <p className="m-display mb-3 text-center text-sm text-[var(--m-teal)]">新着アイテム</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {products.slice(0, 8).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p, p?.images?.[0]?.url)}
                  className="m-label text-[var(--m-ink)] underline decoration-[var(--m-rule)] underline-offset-4 hover:text-[var(--m-pink)]"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="m-paper flex w-[min(360px,90vw)] flex-col px-4">
          <SheetHeader className="border-b-2 border-[var(--m-rule)] pb-4">
            <SheetTitle className="m-display text-base text-[var(--m-ink)]">絞り込み・並び替え</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto py-4">
            <div className="space-y-2">
              <p className="m-display text-sm text-[var(--m-teal)]">並び替え</p>
              <div className="flex gap-2">
                {(["newest", "title"] as SortMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`m-display rounded-full border-2 px-4 py-1.5 text-sm transition-colors ${
                      sortMode === mode
                        ? "border-[var(--m-teal)] bg-[var(--m-teal)] text-white"
                        : "border-[var(--m-rule-soft)] bg-white text-[var(--m-ink)]"
                    }`}
                  >
                    {mode === "newest" ? "新着順" : "名前順"}
                  </button>
                ))}
              </div>
            </div>

            {Object.entries(tagGroups).map(([group, tags]) => (
              <div key={group} className="space-y-2">
                <p className="m-display text-sm text-[var(--m-teal)]">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border-2 px-3 py-1 text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? "border-[var(--m-pink)] bg-[var(--m-pink)] text-white"
                          : "border-[var(--m-rule-soft)] bg-white text-[var(--m-ink-soft)]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 border-t-2 border-[var(--m-rule)] bg-[var(--m-paper)] py-4">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="m-display h-11 w-full rounded-full bg-[var(--m-teal)] text-sm text-white"
            >
              適用する
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <ProductModalB
        product={selected?.product ?? null}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        initialImageUrl={selected?.image}
      />
    </div>
  )
}
