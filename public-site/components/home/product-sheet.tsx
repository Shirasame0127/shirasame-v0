"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Loader2, X } from "lucide-react"
import { apiFetch } from "@/lib/api-client"

/**
 * Variant C's product detail surface.
 *
 * Deliberately not the centred modal that A and B use: this docks to the right
 * edge on desktop and slides up from the bottom on mobile, so the gallery stays
 * visible and browsing keeps its place. That difference is one of the things
 * the A/B/C test is measuring.
 *
 * The gallery feed only carries thumbnail-level fields, so the full record
 * (body, affiliate links, every image) is fetched on open and cached per id.
 */

type SheetProduct = {
  id: string
  title?: string | null
  slug?: string | null
  images?: any[]
  tags?: string[]
}

type Detail = {
  title?: string | null
  body?: string | null
  shortDescription?: string | null
  price?: number | null
  showPrice?: boolean
  tags?: string[]
  images?: any[]
  affiliateLinks?: { url: string; label?: string; site?: string }[]
}

function imageUrlsOf(source: any): string[] {
  const out: string[] = []
  const push = (u: unknown) => {
    if (typeof u === "string" && u && !out.includes(u)) out.push(u)
  }
  push(source?.main_image?.src)
  for (const img of Array.isArray(source?.images) ? source.images : []) {
    push(img?.src || img?.url)
  }
  for (const img of Array.isArray(source?.attachment_images) ? source.attachment_images : []) {
    push(img?.src || img?.url)
  }
  return out
}

export default function ProductSheet({
  product,
  initialImageUrl,
  onClose,
}: {
  product: SheetProduct | null
  initialImageUrl?: string
  onClose: () => void
}) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, Detail>>(new Map())
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const isOpen = Boolean(product)

  useEffect(() => {
    if (!product) {
      setDetail(null)
      setActiveImage(null)
      return
    }
    setActiveImage(initialImageUrl || imageUrlsOf(product)[0] || null)

    const cached = cacheRef.current.get(product.id)
    if (cached) {
      setDetail(cached)
      return
    }

    let alive = true
    setLoading(true)
    setDetail(null)
    ;(async () => {
      try {
        const res = await apiFetch(`/products/${encodeURIComponent(product.id)}`)
        const json = await res.json()
        const data = json?.data
        if (alive && data) {
          cacheRef.current.set(product.id, data)
          setDetail(data)
        }
      } catch {
        // The thumbnail-level fields we already have stay on screen.
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [product, initialImageUrl])

  // Escape to close, and move focus into the sheet when it opens.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Lock background scrolling without the fixed-body trick, which loses scroll
  // position on iOS. `overflow: hidden` on <html> is enough here because the
  // sheet is its own scroll container.
  useEffect(() => {
    if (!isOpen) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [isOpen])

  const images = detail ? imageUrlsOf(detail) : product ? imageUrlsOf(product) : []
  const title = detail?.title || product?.title || ""
  const description = detail?.body || detail?.shortDescription || ""
  const tags = detail?.tags || product?.tags || []
  const links = detail?.affiliateLinks || []

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title || "商品の詳細"}
        className={`fixed z-[71] flex flex-col bg-[var(--c-surface)] text-[var(--c-ink)] shadow-2xl transition-transform duration-300 ease-out
          inset-x-0 bottom-0 h-[88dvh] rounded-t-3xl
          sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[min(460px,92vw)] sm:rounded-none
          ${isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-[var(--c-line)] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]">Item</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full p-2 text-[var(--c-muted)] transition-colors hover:bg-[var(--c-raise)] hover:text-[var(--c-ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeImage && (
            <img
              src={activeImage}
              alt={title}
              className="w-full bg-[var(--c-raise)] object-contain"
              style={{ maxHeight: "46dvh" }}
            />
          )}

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 py-3">
              {images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  aria-label="別の画像を表示"
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === url ? "border-[var(--c-accent)]" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-5 px-5 pb-8 pt-4">
            <h2 className="text-xl font-semibold leading-snug">{title}</h2>

            {loading && (
              <p className="flex items-center gap-2 text-sm text-[var(--c-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                詳細を読み込んでいます
              </p>
            )}

            {description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--c-muted)]">
                {description}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--c-raise)] px-3 py-1 text-xs text-[var(--c-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {links.length > 0 && (
          <footer className="space-y-2 border-t border-[var(--c-line)] px-5 py-4">
            {links.map((link, i) => (
              <a
                key={`${link.url}-${i}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-between rounded-xl bg-[var(--c-accent)] px-4 py-3 text-sm font-semibold text-[var(--c-accent-ink)] transition-opacity hover:opacity-90"
              >
                <span>{link.label || link.site || "購入ページを開く"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </footer>
        )}
      </aside>
    </>
  )
}
