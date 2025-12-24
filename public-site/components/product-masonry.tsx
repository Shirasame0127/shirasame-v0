"use client"

import React from "react"
import Link from "next/link"
// Items provide `image` as a public URL; no client-side URL generation

type Item = { id: string; image: string; aspect?: string; title?: string; href?: string }

interface MasonryProps { items: Item[]; className?: string; columns?: number; fullWidth?: boolean; onItemClick?: (id: string) => void }

export default function ProductMasonry({ items, className, columns = 7, fullWidth = false, onItemClick }: MasonryProps) {
  const cols = Math.max(1, Math.min(columns || 7, 7))
  const mobileCols = cols <= 3 ? cols : 2
  const smCols = Math.min(3, cols)
  const mdCols = Math.min(5, cols)
  const lgCols = cols
  const COL_MAP: Record<number, string> = { 1: "columns-1", 2: "columns-2", 3: "columns-3", 4: "columns-4", 5: "columns-5", 6: "columns-6", 7: "columns-7" }
  const SM_MAP: Record<number, string> = { 1: "sm:columns-1", 2: "sm:columns-2", 3: "sm:columns-3", 4: "sm:columns-4", 5: "sm:columns-5", 6: "sm:columns-6", 7: "sm:columns-7" }
  const MD_MAP: Record<number, string> = { 1: "md:columns-1", 2: "md:columns-2", 3: "md:columns-3", 4: "md:columns-4", 5: "md:columns-5", 6: "md:columns-6", 7: "md:columns-7" }
  const LG_MAP: Record<number, string> = { 1: "lg:columns-1", 2: "lg:columns-2", 3: "lg:columns-3", 4: "lg:columns-4", 5: "lg:columns-5", 6: "lg:columns-6", 7: "lg:columns-7" }
  const baseColsClass = COL_MAP[mobileCols] || "columns-2"
  const responsiveClass = `${SM_MAP[smCols]} ${MD_MAP[mdCols]} ${LG_MAP[lgCols]}`
  const outerClass = className ?? ""
  const baseStyle: React.CSSProperties = fullWidth ? { width: '100dvw', marginLeft: 'calc((100% - 100dvw) / 2)', boxSizing: 'border-box' } : {}
  const containerStyle: React.CSSProperties = { ...baseStyle, paddingInline: 'clamp(5px, 2vw, 50px)' }

  return (
    <div className={`${outerClass} ${fullWidth ? 'product-masonry-fullwidth' : ''}`} style={containerStyle}>
      <div className={`${baseColsClass} ${responsiveClass} gap-4`}>
        {items.map((it) => (
          <div key={it.id} className="break-inside-avoid mb-4">
            {(() => {
              const raw = it.image || null
              let webp: string | null = null
              let jpg: string | null = null

              const jpgUrl = raw || '/placeholder.svg'
              const imgEl = (
                <img
                  src={jpgUrl}
                  alt={it.title || ''}
                  loading="lazy"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105 no-download"
                />
              )

              if (it.href && !onItemClick) {
                return (
                  <Link href={it.href} className="group block rounded-lg overflow-hidden relative transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" onContextMenu={(e) => e.preventDefault()}>
                    {imgEl}
                  </Link>
                )
              }

              return (
                <div role={onItemClick ? 'button' : undefined} onClick={onItemClick ? () => onItemClick(it.id) : undefined} onKeyDown={onItemClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick(it.id) } } : undefined} tabIndex={onItemClick ? 0 : -1} aria-label={it.title || 'ギャラリー画像'} className={`group block rounded-lg overflow-hidden relative transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${onItemClick ? 'cursor-pointer' : ''}`} onContextMenu={(e) => e.preventDefault()}>
                  {imgEl}
                </div>
              )
            })()}
          </div>
        ))}
      </div>
    </div>
  )
}
