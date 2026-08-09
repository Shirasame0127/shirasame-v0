"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ExternalLink, Loader2, X } from "lucide-react"
import { EmbeddedLink } from "@/components/embedded-link"
import { apiFetch } from "@/lib/api-client"

/**
 * Variant B's product detail, styled to match the magazine cover theme.
 *
 * The gallery feed only carries id/title/images, so opening from the gallery
 * used to show a near-empty dialog — no price, description, buy buttons or
 * attachments, because those fields only exist on the product detail endpoint.
 * The full record is fetched on open (and cached per id) and merged over
 * whatever the caller already had, so the dialog paints immediately and fills
 * in the rest a moment later.
 *
 * Scrolling: the whole dialog is ONE scroll container. On a phone that means
 * the main image scrolls away with the text instead of being pinned above a
 * separately scrolling column — the shared modal pins it, which makes long
 * descriptions feel cramped. On desktop the image column is `sticky`, so it
 * still stays in view while the details scroll past it.
 */

type Img = { src?: string | null; srcSet?: string | null; role?: string | null }

function normalizeImages(product: any): { main: Img | null; attachments: Img[] } {
  if (!product) return { main: null, attachments: [] }

  const apiMain: Img | null =
    product.main_image && typeof product.main_image === "object" ? product.main_image : null
  const apiAttachments: Img[] = Array.isArray(product.attachment_images) ? product.attachment_images : []

  const legacy: Img[] = Array.isArray(product.images)
    ? product.images.map((img: any) => ({
        src: img?.src || img?.url || null,
        srcSet: img?.srcSet || null,
        role: img?.role || null,
      }))
    : []

  const main =
    apiMain ||
    legacy.find((i) => i.role === "main") ||
    legacy.find((i) => i.role !== "attachment") ||
    legacy[0] ||
    null

  const attachments = (
    apiAttachments.length > 0 ? apiAttachments : legacy.filter((i) => i.role === "attachment")
  ).slice(0, 6)

  return { main, attachments }
}

/** Product photos come back at width=400; ask the CDN for a larger rendition. */
function upscale(url?: string | null, width = 1000) {
  if (!url) return url ?? null
  return url.replace(/(\/cdn-cgi\/image\/(?:[^/]*?)width=)\d+/, `$1${width}`)
}

export default function ProductModalB({
  product,
  isOpen,
  onClose,
  initialImageUrl,
}: {
  product: any | null
  isOpen: boolean
  onClose: () => void
  initialImageUrl?: string
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const cacheRef = useRef<Map<string, any>>(new Map())

  const merged = useMemo(() => ({ ...(product || {}), ...(detail || {}) }), [product, detail])
  const { main, attachments } = useMemo(() => normalizeImages(merged), [merged])

  useEffect(() => {
    if (!isOpen) return
    setActiveSrc(initialImageUrl || main?.src || null)
    // `main?.src` is intentionally out of the deps: once the detail fetch
    // resolves it changes, and re-running here would yank the visitor off the
    // thumbnail they picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialImageUrl, product?.id])

  useEffect(() => {
    const id = product?.id
    if (!isOpen || !id) return

    const cached = cacheRef.current.get(String(id))
    if (cached) {
      setDetail(cached)
      return
    }

    let alive = true
    setDetail(null)
    setLoadingDetail(true)
    ;(async () => {
      try {
        const res = await apiFetch(`/products/${encodeURIComponent(String(id))}`)
        const json = await res.json()
        if (alive && json?.data) {
          cacheRef.current.set(String(id), json.data)
          setDetail(json.data)
        }
      } catch {
        // Keep whatever fields the caller already provided.
      } finally {
        if (alive) setLoadingDetail(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [isOpen, product?.id])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Lock the page behind the dialog. `overflow: hidden` on <html> keeps the
  // scroll position, unlike the position:fixed body trick.
  useEffect(() => {
    if (!isOpen) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const title = merged.title || product.title || ""
  const gallery: Img[] = [main, ...attachments].filter(Boolean) as Img[]
  const displaySrc = upscale(activeSrc || main?.src) || "/placeholder.svg"

  const tags: string[] = Array.isArray(merged.tags) ? merged.tags : []
  const shortDescription = merged.shortDescription || merged.short_description || null
  const body = merged.body || null
  const notes = merged.notes || null
  const affiliateLinks: any[] = Array.isArray(merged.affiliateLinks)
    ? merged.affiliateLinks
    : Array.isArray(merged.affiliate_links)
      ? merged.affiliate_links
      : []
  const relatedLinks: string[] = Array.isArray(merged.relatedLinks)
    ? merged.relatedLinks
    : Array.isArray(merged.related_links)
      ? merged.related_links
      : []

  const rawPrice = merged.price ?? null
  const price =
    typeof rawPrice === "number"
      ? rawPrice
      : typeof rawPrice === "string" && /^\d+$/.test(rawPrice)
        ? Number(rawPrice)
        : null

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[#1f2328]/45 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "商品の詳細"}
        // ONE scroll container: on mobile the image scrolls with the content.
        className="m-paper relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-y-auto overscroll-contain rounded-t-2xl border-2 border-[var(--m-rule)] shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="閉じる"
          className="sticky top-3 z-20 ml-auto mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--m-rule)] bg-white text-[var(--m-ink)] shadow-sm transition-colors hover:bg-[#eaf7f7]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="-mt-9 flex flex-col md:flex-row">
          {/* Image column. Sticky only from md up, so phones scroll it away. */}
          <div className="shrink-0 p-4 md:w-1/2 md:self-start md:p-6 lg:sticky lg:top-0">
            <div className="m-panel overflow-hidden p-2">
              {/* Square, filled. Images are cropped in the admin before upload,
                  so `cover` shows the crop that was chosen; `contain` letterboxed
                  it and reintroduced the bars the crop existed to remove. */}
              <div className="aspect-square overflow-hidden rounded-lg bg-white">
                <img
                  src={displaySrc}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.onerror = null
                    el.src = "/placeholder.svg"
                  }}
                />
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => setActiveSrc(img.src || null)}
                    aria-label={`画像 ${i + 1} を表示`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                      (activeSrc || main?.src) === img.src
                        ? "border-[var(--m-pink)]"
                        : "border-[var(--m-rule-soft)]"
                    }`}
                  >
                    <img src={img.src || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-5 px-4 pb-8 pt-2 md:px-6 md:py-6">
            <header>
              <h2 className="m-heading text-2xl leading-snug text-[var(--m-ink)]">{title}</h2>
              {/* Pink marker rule under the title, echoing the cover copy. */}
              <div className="mt-2 h-[3px] w-16 rounded-full bg-[var(--m-pink-soft)]" />
            </header>

            {loadingDetail && (
              <p className="flex items-center gap-2 text-xs text-[var(--m-ink-soft)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                詳細を読み込んでいます
              </p>
            )}

            {shortDescription && (
              <p className="m-bubble m-copy max-w-full text-sm">
                <span className="whitespace-pre-wrap">{shortDescription}</span>
              </p>
            )}

            {price !== null && !Number.isNaN(price) && (
              <p className="m-display text-xl text-[var(--m-teal)]">¥{price.toLocaleString("ja-JP")}</p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border-[1.5px] border-[var(--m-rule-soft)] bg-white px-3 py-1 text-xs text-[var(--m-ink-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {body && (
              <section className="m-panel-soft p-4">
                <h3 className="m-subheading mb-2 text-sm text-[var(--m-teal)]">商品詳細</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--m-ink)]">{body}</p>
              </section>
            )}

            {notes && (
              <section className="m-panel-soft p-4">
                <h3 className="m-subheading mb-2 text-sm text-[var(--m-teal)]">メモ</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--m-ink-soft)]">{notes}</p>
              </section>
            )}

            {affiliateLinks.length > 0 && (
              <section className="space-y-2">
                <h3 className="m-subheading text-sm text-[var(--m-teal)]">購入リンク</h3>
                {affiliateLinks.map((link: any, i: number) => {
                  let label = link.label
                  if (!label) {
                    try {
                      label = new URL(link.url).hostname.replace("www.", "")
                    } catch {
                      label = "購入リンク"
                    }
                  }
                  return (
                    <a
                      key={`${link.url}-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--m-teal)] bg-[var(--m-teal)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a7f92]"
                    >
                      <span className="truncate">{label}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  )
                })}
              </section>
            )}

            {relatedLinks.length > 0 && (
              <section className="space-y-2">
                <h3 className="m-subheading text-sm text-[var(--m-teal)]">関連リンク</h3>
                {relatedLinks.map((url, i) => (
                  <EmbeddedLink
                    key={`${url}-${i}`}
                    url={url}
                    buttonClassName="w-full rounded-full py-5 border-2 border-[var(--m-rule)] bg-white text-[var(--m-ink)] hover:bg-[#eaf7f7]"
                  />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
