"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Menu, RefreshCw, Search, X } from "lucide-react"

import GalleryGrid from "@/components/home/gallery-grid"
import ProductSheet from "@/components/home/product-sheet"
import { HOME_VIEWS, isHomeView, viewMeta, type HomeView } from "@/components/home/views"
import { SocialLinks } from "@/components/social-links"
import { FIRST_PAGE_SIZE, type HomeData } from "@/lib/use-home-data"
import { trackAb } from "@/lib/ab"

const RecipeDisplay = dynamic(() => import("@/components/recipe-display").then((m) => m.RecipeDisplay), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-[var(--c-raise)]" />,
})

/**
 * Variant C — the redesign.
 *
 * Shares variant B's information architecture (four named surfaces, curated
 * first) but expresses it differently: a persistent left rail on desktop rather
 * than a pill bar, editorial section headers, a dark palette, and a docked
 * detail sheet instead of a centred modal. Those are the differences the test
 * is meant to measure — the structure itself is not one of them, because
 * burying collections and recipes under a growing gallery was simply wrong.
 */

function readInitialView(): HomeView {
  if (typeof window === "undefined") return "collections"
  const v = new URLSearchParams(window.location.search).get("view")
  return isHomeView(v) ? v : "collections"
}

/** Square card with title, used by the collection / all-items / recipe lists. */
function ItemCard({ product, onClick }: { product: any; onClick: () => void }) {
  const src = product?.main_image?.src || product?.images?.[0]?.url || "/placeholder.svg"
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--c-raise)]">
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
      {product?.title && (
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-[var(--c-muted)] transition-colors group-hover:text-[var(--c-ink)]">
          {product.title}
        </p>
      )}
    </button>
  )
}

export default function HomeC({ data }: { data: HomeData }) {
  const { status, error, retry, isBackfilling, galleryItems, products, recipes, collections, user, tagGroups } = data

  const [view, setView] = useState<HomeView>(readInitialView)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [columns, setColumns] = useState(3)
  const [selected, setSelected] = useState<{ product: any; image?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const composingRef = useRef(false)

  useEffect(() => {
    if (composingRef.current) return
    const id = window.setTimeout(() => setDebouncedQuery(query), 250)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    view === "collections" ? params.delete("view") : params.set("view", view)
    const qs = params.toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
  }, [view])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setColumns(w < 480 ? 2 : w < 900 ? 3 : w < 1440 ? 4 : 5)
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

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const changeView = useCallback((next: HomeView) => {
    setView(next)
    setMenuOpen(false)
    trackAb("view_change", { ab_variant: "c", home_view: next })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const openProduct = useCallback((product: any, image?: string) => {
    trackAb("product_open", { ab_variant: "c", product_id: product?.id })
    setSelected({ product, image })
  }, [])

  const rankedTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of galleryItems) for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
    for (const tag of Object.values(tagGroups).flat()) if (!counts.has(tag)) counts.set(tag, 0)
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .map(([tag]) => tag)
      .slice(0, 24)
  }, [galleryItems, tagGroups])

  const matches = useCallback(
    (title: string | null | undefined, description: string | null | undefined, tags: string[]) => {
      const q = debouncedQuery.trim().toLowerCase()
      if (q && !`${title || ""} ${description || ""}`.toLowerCase().includes(q)) return false
      if (activeTags.length > 0) {
        const own = tags.map((t) => t.toLowerCase())
        if (!activeTags.map((t) => t.toLowerCase()).every((t) => own.includes(t))) return false
      }
      return true
    },
    [debouncedQuery, activeTags],
  )

  const filteredGallery = useMemo(
    () => galleryItems.filter((i) => matches(i.title, i.shortDescription, i.tags)),
    [galleryItems, matches],
  )
  const filteredProducts = useMemo(
    () => products.filter((p: any) => matches(p.title, p.shortDescription, Array.isArray(p.tags) ? p.tags : [])),
    [products, matches],
  )

  const hasFilters = debouncedQuery.length > 0 || activeTags.length > 0
  const clearFilters = () => {
    setQuery("")
    setDebouncedQuery("")
    setActiveTags([])
  }
  const toggleTag = (tag: string) =>
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.concat(tag)))

  const meta = viewMeta(view)
  const showSearch = view === "items" || view === "gallery"
  const counts: Record<HomeView, number> = {
    collections: collections.length,
    recipes: recipes.length,
    items: products.length,
    gallery: galleryItems.length,
  }

  const viewNav = (orientation: "rail" | "inline") => (
    <ul className={orientation === "rail" ? "space-y-1" : "flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
      {HOME_VIEWS.map((v) => {
        const active = v.id === view
        return (
          <li key={v.id} className={orientation === "inline" ? "shrink-0" : undefined}>
            <button
              type="button"
              onClick={() => changeView(v.id)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-baseline justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--c-raise)] text-[var(--c-ink)]"
                  : "text-[var(--c-muted)] hover:text-[var(--c-ink)]"
              }`}
            >
              <span>{v.label}</span>
              {counts[v.id] > 0 && <span className="text-xs tabular-nums opacity-70">{counts[v.id]}</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )

  if (status === "error") {
    return (
      <div className="c-root flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">読み込めませんでした</h1>
        <p className="max-w-md text-sm text-[var(--c-muted)]">
          通信が不安定か、サーバーが応答していないようです。{error ? `（${error}）` : ""}
        </p>
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--c-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--c-accent-ink)]"
        >
          <RefreshCw className="h-4 w-4" />
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className="c-root min-h-screen">
      {/* C has no shared PublicNav, so it carries its own menu — without it a
          visitor bucketed into C could never switch back to A or B. */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={menuOpen}
        className="fixed right-4 top-4 z-50 rounded-full border border-[var(--c-line)] bg-[var(--c-surface)]/80 p-3 backdrop-blur-md transition-colors hover:bg-[var(--c-raise)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        className={`fixed right-0 top-0 z-[61] h-full w-[min(320px,88vw)] overflow-y-auto border-l border-[var(--c-line)] bg-[var(--c-surface)] p-6 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--c-muted)]">Menu</p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="閉じる"
            className="rounded-full p-2 text-[var(--c-muted)] hover:bg-[var(--c-raise)] hover:text-[var(--c-ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="表示の切り替え">{viewNav("rail")}</nav>
      </div>

      <header className="border-b border-[var(--c-line)] px-6 pb-10 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--c-muted)]">Desk &amp; Gadgets</p>
          <h1 className="mt-4 font-heading text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            {user?.displayName || "SHIRASAME"}
          </h1>
          {user?.bio && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--c-muted)] sm:text-base">{user.bio}</p>
          )}
          {user?.socialLinks && <div className="mt-6"><SocialLinks links={user.socialLinks} /></div>}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-10 px-6 sm:px-10 lg:px-16">
        <nav className="hidden w-44 shrink-0 lg:block" aria-label="表示の切り替え">
          <div className="sticky top-8 py-10">{viewNav("rail")}</div>
        </nav>

        <div className="min-w-0 flex-1 py-10">
          {/* Mobile / tablet: the same switcher as a sticky inline bar. */}
          <div className="sticky top-0 z-30 -mx-2 bg-[var(--c-bg)]/90 px-2 py-3 backdrop-blur-xl lg:hidden">
            {viewNav("inline")}
          </div>

          {/* Editorial section header: which surface you're on, and why. */}
          <header className="border-b border-[var(--c-line)] pb-6 pt-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">{meta.title}</h2>
              {counts[view] > 0 && (
                <span className="shrink-0 pb-1 text-xs tabular-nums text-[var(--c-muted)]">
                  {counts[view]} 件
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--c-muted)]">{meta.subtitle}</p>
          </header>

          {showSearch && (
            <div className="sticky top-14 z-20 -mx-2 bg-[var(--c-bg)]/90 px-2 py-4 backdrop-blur-xl lg:top-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--c-muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onCompositionStart={() => {
                    composingRef.current = true
                  }}
                  onCompositionEnd={(e) => {
                    composingRef.current = false
                    setQuery((e.target as HTMLInputElement).value)
                  }}
                  placeholder="キーワードで探す"
                  aria-label="検索"
                  className="h-12 w-full rounded-full border border-[var(--c-line)] bg-[var(--c-raise)] pl-11 pr-11 text-sm outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--c-accent)]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="検索をクリア"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--c-muted)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {rankedTags.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="shrink-0 rounded-full border border-[var(--c-line)] px-3 py-1.5 text-xs text-[var(--c-muted)]"
                    >
                      リセット
                    </button>
                  )}
                  {rankedTags.map((tag) => {
                    const on = activeTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={on}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          on
                            ? "border-[var(--c-accent)] bg-[var(--c-accent)] text-[var(--c-accent-ink)]"
                            : "border-[var(--c-line)] text-[var(--c-muted)] hover:border-[var(--c-ink)] hover:text-[var(--c-ink)]"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-8">
            {status === "loading" ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-hidden>
                {Array.from({ length: columns * 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-[var(--c-raise)]"
                    style={{ height: 140 + ((i * 53) % 120) }}
                  />
                ))}
              </div>
            ) : (
              <>
                {view === "collections" && (
                  <div className="space-y-16">
                    {collections.length === 0 && (
                      <p className="py-20 text-center text-[var(--c-muted)]">{meta.empty}</p>
                    )}
                    {collections.map((collection: any) => {
                      const items = collection.products || []
                      return (
                        <section key={collection.id} id={`collection-${collection.id}`} className="scroll-mt-32">
                          <header className="mb-5">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="text-2xl font-semibold tracking-tight">{collection.title}</h3>
                              <span className="shrink-0 text-xs tabular-nums text-[var(--c-muted)]">
                                {items.length} 件
                              </span>
                            </div>
                            {collection.description && (
                              <p className="mt-1.5 text-sm text-[var(--c-muted)]">{collection.description}</p>
                            )}
                          </header>
                          {items.length === 0 ? (
                            <p className="py-8 text-sm text-[var(--c-muted)]">
                              このコレクションにはまだアイテムがありません
                            </p>
                          ) : (
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                              {items.map((product: any) => (
                                <ItemCard
                                  key={product.id}
                                  product={product}
                                  onClick={() => openProduct(product, product?.images?.[0]?.url)}
                                />
                              ))}
                            </div>
                          )}
                        </section>
                      )
                    })}
                  </div>
                )}

                {view === "recipes" && (
                  <div className="space-y-20">
                    {recipes.length === 0 && <p className="py-20 text-center text-[var(--c-muted)]">{meta.empty}</p>}
                    {recipes.map((recipe: any) => {
                      const items: any[] = Array.isArray(recipe.items) ? recipe.items : []
                      return (
                        <section key={recipe.id} id={`recipe-${recipe.id}`} className="scroll-mt-32">
                          <header className="mb-5">
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="text-2xl font-semibold tracking-tight">{recipe.title}</h3>
                              <span className="shrink-0 text-xs tabular-nums text-[var(--c-muted)]">
                                {recipe.pins?.length ?? 0} 個の印
                              </span>
                            </div>
                            {recipe.body && <p className="mt-1.5 text-sm text-[var(--c-muted)]">{recipe.body}</p>}
                          </header>

                          {/* Portrait photos need a width cap, otherwise the pin
                              labels collide and the image dwarfs the page. */}
                          <div className="mx-auto max-w-2xl">
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
                              onProductClick={(product: any, imageUrl?: string) => openProduct(product, imageUrl)}
                            />
                          </div>

                          {items.length > 0 && (
                            <div className="mt-8">
                              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]">
                                Used in this photo ({items.length})
                              </p>
                              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                                {items.map((product: any) => (
                                  <ItemCard
                                    key={product.id}
                                    product={product}
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
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                      <p className="text-[var(--c-muted)]">{hasFilters ? "条件に合うアイテムがありません" : meta.empty}</p>
                      {hasFilters && (
                        <button onClick={clearFilters} className="rounded-full border border-[var(--c-line)] px-4 py-2 text-sm">
                          条件をリセット
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                      {filteredProducts.map((product: any) => (
                        <ItemCard
                          key={product.id}
                          product={product}
                          onClick={() => openProduct(product, product?.images?.[0]?.url)}
                        />
                      ))}
                    </div>
                  ))}

                {view === "gallery" &&
                  (filteredGallery.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                      <p className="text-[var(--c-muted)]">{hasFilters ? "条件に合う写真がありません" : meta.empty}</p>
                      {hasFilters && (
                        <button onClick={clearFilters} className="rounded-full border border-[var(--c-line)] px-4 py-2 text-sm">
                          条件をリセット
                        </button>
                      )}
                    </div>
                  ) : (
                    <GalleryGrid
                      items={filteredGallery}
                      columns={columns}
                      eagerCount={FIRST_PAGE_SIZE}
                      onItemClick={(id) => {
                        const item = galleryItems.find((g) => g.id === id)
                        if (!item) return
                        const product =
                          products.find((p: any) => String(p.id) === String(item.productId)) ||
                          ({ id: item.productId || item.id, title: item.title, images: [{ url: item.image }] } as any)
                        openProduct(product, item.image)
                      }}
                      renderOverlay={(item) =>
                        item.title ? (
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            {item.title}
                          </span>
                        ) : null
                      }
                    />
                  ))}

                {isBackfilling && (view === "gallery" || view === "items") && (
                  <p className="py-10 text-center text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]">
                    Loading more
                  </p>
                )}
              </>
            )}
          </div>

          <section id="c-about" className="mt-24 scroll-mt-32 border-t border-[var(--c-line)] py-16">
            <h2 className="font-heading text-3xl tracking-tight">About</h2>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
              {(user?.profileImage || user?.avatarUrl) && (
                <img
                  src={(user.profileImage || user.avatarUrl) as string}
                  alt={user?.displayName || ""}
                  className="h-24 w-24 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="space-y-4">
                {user?.bio && (
                  <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[var(--c-muted)]">
                    {user.bio}
                  </p>
                )}
                {user?.socialLinks && <SocialLinks links={user.socialLinks} />}
              </div>
            </div>
          </section>
        </div>
      </div>

      <ProductSheet
        product={selected?.product ?? null}
        initialImageUrl={selected?.image}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
