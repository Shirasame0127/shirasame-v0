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
  onItemClick?: (id: string) => void
}

export default function ProductMasonry({ items, className, columns = 7, onItemClick }: MasonryProps) {
  // Normalize columns to a sensible range and map to static Tailwind classes
  const cols = Math.max(1, Math.min(columns || 7, 7))

  // mobile: 2 or 3 (default 2) — if user requested <=3 columns, use that on mobile, otherwise default 2
  const mobileCols = cols <= 3 ? cols : 2
  // sm: small screens show up to 3 columns
  const smCols = Math.min(3, cols)
  // md: medium screens show up to 5 columns
  const mdCols = Math.min(5, cols)
  // lg: large screens use requested cols (up to 7)
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

  return (
    <div className={className ?? ""}>
      <div className={`${baseColsClass} ${responsiveClass} gap-4`}> 
        {items.map((it) => (
          <div key={it.id} className="break-inside-avoid mb-4">
            {it.href && !onItemClick ? (
              <Link
                href={it.href}
                className="block rounded overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <img src={it.image} alt={it.title || ""} loading="lazy" className="w-full h-auto object-cover rounded" />
              </Link>
            ) : (
              <div
                role={onItemClick ? "button" : undefined}
                onClick={onItemClick ? () => onItemClick(it.id) : undefined}
                className={`block rounded overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${onItemClick ? 'cursor-pointer' : ''}`}
              >
                <img src={it.image} alt={it.title || ""} loading="lazy" className="w-full h-auto object-cover rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
