"use client"

// Use API-provided image URLs; no client-side URL generation

import type { Product } from "@shared/types"

interface ProductCardSimpleProps { product: Product; onClick: () => void; saleName?: string | null }

export function ProductCardSimple({ product, onClick, saleName }: ProductCardSimpleProps) {
  const sizes = "(max-width: 768px) 100vw, 400px"
  // Prefer top-level `main_image` from owner-products API; fallback to legacy product.images
  const mainTop = (product as any).main_image && typeof (product as any).main_image === 'object' ? (product as any).main_image : null
  const images = Array.isArray(product.images) ? product.images : []
  const mainLegacy = images.find((img) => img?.role === "main") || images[0] || null

  const src = mainTop?.src || mainLegacy?.url || '/placeholder.svg'
  const srcSet = (mainTop as any)?.srcSet || (mainLegacy && ((mainLegacy as any).srcSet || (mainLegacy as any).src)) || null

  return (
    <button onClick={onClick} className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md">
        <img src={src} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={product.title} loading="lazy" className="w-full h-full object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105" onError={(e: any) => { try { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; e.currentTarget.srcset = '' } catch {} }} />
        {saleName && (
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center rounded-full bg-pink-600 text-white text-[10px] font-semibold px-2 py-0.5 shadow-sm">
              {saleName}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
