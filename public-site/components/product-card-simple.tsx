"use client"

import type { Product } from "@shared/types"
// Do not transform image keys on the client; expect the API to provide transformed URLs

interface ProductCardSimpleProps { product: Product; onClick: (initialImageUrl?: string) => void; saleName?: string | null }

export function ProductCardSimple({ product, onClick, saleName }: ProductCardSimpleProps) {
  const sizes = "(max-width: 768px) 100vw, 400px"
  // Prefer top-level `main_image` from owner-products API; fallback to legacy product.images
  const mainTop = (product as any).main_image && typeof (product as any).main_image === 'object' ? (product as any).main_image : null
  const images = Array.isArray(product.images) ? product.images : []
  // Prefer explicit 'main' role, then first non-attachment image, then first available image
  const nonAttachment = images.find((img) => img && img.role !== 'attachment') || null
  const mainLegacy = images.find((img) => img?.role === "main") || nonAttachment || images[0] || null

  // Use API-provided transformed URLs (prefer `main_image.src`).
  // Do NOT construct CDN URLs from keys on the client — backend should provide them.
  let src: string | null = null
  let srcSet: string | null = null

  if (mainTop && mainTop.src) {
    src = String(mainTop.src)
    srcSet = (mainTop as any).srcSet || null
  } else if (mainLegacy && (mainLegacy as any).url) {
    src = (mainLegacy as any).url
    srcSet = (mainLegacy as any).srcSet || null
  } else {
    src = '/placeholder.svg'
    srcSet = null
  }

  const handleClick = () => {
    try { onClick(src || undefined) } catch { try { (onClick as any)() } catch {} }
  }

  // Debug: log cases where src is still a relative /cdn-cgi/image path
  try {
    if (typeof window !== 'undefined' && src && String(src).includes('/cdn-cgi/image/')) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] ProductCardSimple image src', { id: (product as any)?.id, src, srcSet })
    }
  } catch {}

  return (
    <button onClick={handleClick} className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
        <img src={src || '/placeholder.svg'} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={product.title} loading="lazy" className="w-full h-full object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105" onError={(e: any) => { try { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; e.currentTarget.srcset = '' } catch {} }} />
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
