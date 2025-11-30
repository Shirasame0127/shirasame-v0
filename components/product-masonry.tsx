"use client"

import React from "react"
import Link from "next/link"

type Item = {
  id: string
  image: string
  aspect?: string
  title?: string
  href?: string
}

interface MasonryProps {
  items: Item[]
  className?: string
  columns?: number
  fullWidth?: boolean
  onItemClick?: (id: string) => void
}

export default function ProductMasonry({ items, className, columns = 7, fullWidth = false, onItemClick }: MasonryProps) {
  // Normalize columns to a sensible range and map to static Tailwind classes
  // Support up to 7 columns; gallery can request 7 while normal mode may use fewer
  const cols = Math.max(1, Math.min(columns || 7, 7))

  // mobile: 2 or 3 (default 2) — if user requested <=3 columns, use that on mobile, otherwise default 2
  const mobileCols = cols <= 3 ? cols : 2
  // sm: small screens show up to 3 columns
  const smCols = Math.min(3, cols)
  // md: medium screens show up to 5 columns
  const mdCols = Math.min(5, cols)
  // lg: large screens use requested cols (now capped at 5)
  const lgCols = cols

  // Static maps so Tailwind can see the class names at build time
  const COL_MAP: Record<number, string> = {
    1: "columns-1",
    2: "columns-2",
    3: "columns-3",
    4: "columns-4",
    5: "columns-5",
    6: "columns-6",
    7: "columns-7",
  }
  const SM_MAP: Record<number, string> = {
    1: "sm:columns-1",
    2: "sm:columns-2",
    3: "sm:columns-3",
    4: "sm:columns-4",
    5: "sm:columns-5",
    6: "sm:columns-6",
    7: "sm:columns-7",
  }
  const MD_MAP: Record<number, string> = {
    1: "md:columns-1",
    2: "md:columns-2",
    3: "md:columns-3",
    4: "md:columns-4",
    5: "md:columns-5",
    6: "md:columns-6",
    7: "md:columns-7",
  }
  const LG_MAP: Record<number, string> = {
    1: "lg:columns-1",
    2: "lg:columns-2",
    3: "lg:columns-3",
    4: "lg:columns-4",
    5: "lg:columns-5",
    6: "lg:columns-6",
    7: "lg:columns-7",
  }

  const baseColsClass = COL_MAP[mobileCols] || "columns-2"
  const responsiveClass = `${SM_MAP[smCols]} ${MD_MAP[mdCols]} ${LG_MAP[lgCols]}`

  const outerClass = className ?? ""

  const baseStyle = fullWidth ? { width: '100dvw', marginLeft: 'calc((100% - 100dvw) / 2)', boxSizing: 'border-box' } : {}
  // Ensure both gallery sides have at least 5px and at most 50px padding,
  // scaled responsively with viewport width using CSS clamp().
  const containerStyle = { ...baseStyle, paddingInline: 'clamp(5px, 2vw, 50px)' }

  return (
    <div
      className={`${outerClass} ${fullWidth ? 'product-masonry-fullwidth' : ''}`}
      style={containerStyle}
    >
      <div className={`${baseColsClass} ${responsiveClass} gap-4`}> 
        {items.map((it) => (
          <div key={it.id} className="break-inside-avoid mb-4">
            {it.href && !onItemClick ? (
              <Link
                href={it.href}
                className="group block rounded-lg overflow-hidden relative transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <img
                  src={it.image}
                  alt={it.title || ""}
                  loading="lazy"
                  className="w-full h-auto object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105"
                />
              </Link>
            ) : (
              <div
                role={onItemClick ? "button" : undefined}
                onClick={onItemClick ? () => onItemClick(it.id) : undefined}
                onKeyDown={onItemClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick(it.id) } } : undefined}
                tabIndex={onItemClick ? 0 : -1}
                aria-label={it.title || 'ギャラリー画像'}
                className={`group block rounded-lg overflow-hidden relative transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${onItemClick ? 'cursor-pointer' : ''}`}
              >
                <img
                  src={it.image}
                  alt={it.title || ""}
                  loading="lazy"
                  className="w-full h-auto object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
