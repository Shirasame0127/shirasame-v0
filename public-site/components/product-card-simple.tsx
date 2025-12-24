"use client"

import type { Product } from "@shared/types"
import { responsiveImageForUsage } from '@/lib/image-url'

interface ProductCardSimpleProps { product: Product; onClick: (initialImageUrl?: string) => void; saleName?: string | null }

export function ProductCardSimple({ product, onClick, saleName }: ProductCardSimpleProps) {
  const sizes = "(max-width: 768px) 100vw, 400px"
  // Prefer top-level `main_image` from owner-products API; fallback to legacy product.images
  const mainTop = (product as any).main_image && typeof (product as any).main_image === 'object' ? (product as any).main_image : null
  const images = Array.isArray(product.images) ? product.images : []
  const mainLegacy = images.find((img) => img?.role === "main") || images[0] || null

  // If API only provides `main_image_key`, generate a public URL via image-usecases
  let src: string | null = null
  let srcSet: string | null = null
  try {
    const key = (product as any)?.main_image_key || (product as any)?.mainImageKey || null
    if (key) {
      const resp = responsiveImageForUsage(String(key), 'list')
      src = resp.src || null
      srcSet = resp.srcSet || null
    }
  } catch {}

  if (!src) src = mainTop?.src || mainLegacy?.url || '/placeholder.svg'
  if (!srcSet) srcSet = (mainTop as any)?.srcSet || (mainLegacy && ((mainLegacy as any).srcSet || (mainLegacy as any).src)) || null

  const handleClick = () => {
    try { onClick(src || undefined) } catch { try { (onClick as any)() } catch {} }
  }

  return (
    <button onClick={handleClick} className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md">
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
