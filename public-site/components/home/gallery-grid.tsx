"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

/**
 * Masonry gallery built on CSS Grid row spans, used by variants B and C.
 *
 * Variant A uses CSS multi-column (`columns-N`). That reflows every item across
 * columns whenever an image resolves or the column count changes, so the grid
 * visibly reshuffles while you scroll. Grid + row spans places each tile in a
 * fixed column, so nothing moves once it is laid out.
 *
 * Aspect ratios come from the API when available and are otherwise learned from
 * the image's natural size on load, so the reserved box converges to the real
 * one instead of leaving every unknown image at 1:1.
 */

export type GalleryGridItem = {
  id: string
  image: string
  srcSet?: string | null
  aspect?: string | number | null
  title?: string | null
}

type Props = {
  items: GalleryGridItem[]
  columns: number
  /** Tiles rendered eagerly (above the fold) instead of lazily. */
  eagerCount?: number
  gap?: number
  className?: string
  onItemClick?: (id: string) => void
  /** Rendered on top of each tile — used by C for its hover caption. */
  renderOverlay?: (item: GalleryGridItem) => React.ReactNode
}

/** Row height in px. Smaller = finer packing, more spans to compute. */
const ROW_UNIT = 8

/** Accepts 1.5, "1.5", "16:9" or "16/9" and returns width/height. */
function parseAspect(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null
  const raw = String(value).trim()
  if (!raw) return null
  const parts = raw.split(/[:/]/)
  if (parts.length === 2) {
    const w = Number(parts[0])
    const h = Number(parts[1])
    return Number.isFinite(w) && Number.isFinite(h) && h > 0 && w > 0 ? w / h : null
  }
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function GalleryGrid({
  items,
  columns,
  eagerCount = 0,
  gap = 12,
  className,
  onItemClick,
  renderOverlay,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [columnWidth, setColumnWidth] = useState(0)
  // Aspect ratios discovered from decoded images, keyed by item id.
  const [learned, setLearned] = useState<Record<string, number>>({})

  const cols = Math.max(1, columns)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      if (width <= 0) return
      setColumnWidth((width - gap * (cols - 1)) / cols)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cols, gap])

  const handleLoad = useCallback(
    (id: string, img: HTMLImageElement) => {
      const { naturalWidth: w, naturalHeight: h } = img
      if (!w || !h) return
      setLearned((prev) => (prev[id] ? prev : { ...prev, [id]: w / h }))
    },
    [],
  )

  const style = useMemo<React.CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridAutoRows: `${ROW_UNIT}px`,
      columnGap: gap,
    }),
    [cols, gap],
  )

  return (
    <div ref={containerRef} className={className} style={style}>
      {items.map((item, index) => {
        const aspect = parseAspect(item.aspect) ?? learned[item.id] ?? 1
        // Until the first measurement lands, span 1 row so the browser has
        // something to lay out; the real span applies on the same frame.
        // Rows have no gap; each cell carries its own bottom margin instead, so
        // the space a tile must reserve is its image height plus that margin.
        const height = columnWidth > 0 ? columnWidth / aspect : 0
        const span = height > 0 ? Math.max(1, Math.ceil((height + gap) / ROW_UNIT)) : 1
        const isEager = index < eagerCount

        return (
          <div key={item.id} style={{ gridRowEnd: `span ${span}`, marginBottom: gap }}>
            <button
              type="button"
              onClick={onItemClick ? () => onItemClick(item.id) : undefined}
              aria-label={item.title || "ギャラリー画像"}
              className="group relative block h-full w-full overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <img
                src={item.image}
                srcSet={item.srcSet || undefined}
                sizes={`(max-width: 640px) ${Math.round(100 / cols)}vw, ${Math.round(1280 / cols)}px`}
                alt={item.title || ""}
                loading={isEager ? "eager" : "lazy"}
                fetchPriority={isEager ? "high" : "auto"}
                decoding="async"
                draggable={false}
                onLoad={(e) => handleLoad(item.id, e.currentTarget)}
                onError={(e) => {
                  const el = e.currentTarget
                  el.onerror = null
                  el.src = "/placeholder.svg"
                  el.srcset = ""
                }}
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              />
              {renderOverlay?.(item)}
            </button>
          </div>
        )
      })}
    </div>
  )
}
