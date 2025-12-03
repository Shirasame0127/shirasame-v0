"use client"

import { getPublicImageUrl, buildR2VariantFromBasePathWithFormat } from "@/lib/image-url"

import type { Product } from "@shared/types"

interface ProductCardSimpleProps { product: Product; onClick: () => void; saleName?: string | null }

export function ProductCardSimple({ product, onClick, saleName }: ProductCardSimpleProps) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images.find((img) => img?.role === "main") || images[0] || null

  const raw = mainImage?.url || null
  let webp: string | null = null
  let jpg: string | null = null
  if (raw) {
    if (/thumb-400|detail-800/.test(raw)) {
      jpg = getPublicImageUrl(raw) || raw
      webp = jpg.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(raw)) {
      jpg = getPublicImageUrl(raw) || raw
      webp = jpg.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    } else {
      // For card thumbnails prefer the smaller thumb variant
      webp = buildR2VariantFromBasePathWithFormat(raw, 'thumb-400', 'webp')
      jpg = buildR2VariantFromBasePathWithFormat(raw, 'thumb-400', 'jpg')
    }
  }

  return (
    <button onClick={onClick} className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md">
        <picture>
          {webp && <source type="image/webp" srcSet={webp} />}
          <img src={jpg || (raw ?? '/placeholder.svg')} alt={product.title} loading="lazy" className="w-full h-full object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105" />
        </picture>
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
