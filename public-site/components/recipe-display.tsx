"use client"

import { useRef, useState } from "react"
// Use API-provided image URLs; no client-side URL generation
import type { Product } from "@shared/types"

type RecipePin = {
  id: string
  productId?: string | null
  // Preferred API fields
  dotX?: number
  dotY?: number
  dotSizePercent?: number
  tagX?: number
  tagY?: number
  tagText?: string
  dotColor?: string
  tagBackgroundColor?: string

  // Legacy / percent-based fallbacks
  dotXPercent?: number
  dotYPercent?: number
  tagXPercent?: number
  tagYPercent?: number
  tagFontSizePercent?: number
  lineWidthPercent?: number
  tagBorderWidthPercent?: number
  tagBorderRadiusPercent?: number
  tagPaddingXPercent?: number
  tagPaddingYPercent?: number

  // Appearance
  dotShape?: "circle" | "square" | "triangle" | "diamond"
  tagFontFamily?: string
  tagFontWeight?: string
  tagTextColor?: string
  tagTextShadow?: string
  tagBackgroundOpacity?: number
  tagBorderColor?: string
  tagShadow?: string
  lineType?: "solid" | "dashed" | "dotted" | "wavy" | "hand-drawn"
  lineColor?: string
  tagTextStrokeColor?: string
  tagTextStrokeWidth?: number

  // Background sizing/offsets
  tagBackgroundWidthPercent?: number
  tagBackgroundHeightPercent?: number
  tagBackgroundOffsetXPercent?: number
  tagBackgroundOffsetYPercent?: number

  // Shadow & text
  tagShadowColor?: string
  tagShadowOpacity?: number
  tagShadowBlur?: number
  tagShadowDistance?: number
  tagShadowAngle?: number
  tagTextAlign?: "left" | "center" | "right"
  tagVerticalWriting?: boolean
  tagLetterSpacing?: number
  tagLineHeight?: number
  tagBold?: boolean
  tagItalic?: boolean
  tagUnderline?: boolean
  tagTextTransform?: "uppercase" | "lowercase" | "none"
  tagDisplayText?: string
}

type RecipeDisplayProps = {
  recipeId: string
  recipeTitle: string
  imageDataUrl: string
  imageUrl?: string
  imageWidth: number
  imageHeight: number
  aspectRatio?: string
  pins: RecipePin[]
  products: Product[]
  items?: any[]
  onProductClick: (product: Product) => void
}

export function RecipeDisplay({ recipeTitle, imageDataUrl, imageUrl, pins, products, onProductClick }: RecipeDisplayProps) {
  // items prop may be provided by API (full product objects related to this recipe)
  // keep destructuring backward-compatible by reading from arguments object below
  const items: any[] = (arguments && (arguments as any)[0] && (arguments as any)[0].items) || []
  const pinAreaRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const handleImageLoad = () => setImageLoaded(true)

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div ref={pinAreaRef} className="relative w-full">
        {
            (() => {
            const raw = imageUrl || imageDataUrl
            const src = raw || "/placeholder.svg"
            return <img src={src} alt={recipeTitle} className="w-full h-auto object-contain rounded-md" onLoad={handleImageLoad} />
          })()
        }
        {imageLoaded && Array.isArray(pins) && pins.length > 0 ? (
          // Build product map once for quick lookup
          (() => {
            const productMap = new Map(products.map((p) => [String(p.id), p]))
            const itemsMap = new Map((Array.isArray(items) ? items : []).map((it: any) => [String(it.id ?? it.product_id ?? it.productId), it]))
            return pins.map((pin) => {
              const pidKey = pin && pin.productId ? String(pin.productId) : null
              const productFromItems = pidKey ? itemsMap.get(pidKey) : undefined
              const productFromProducts = pidKey ? productMap.get(pidKey) : undefined
              const product = productFromItems || productFromProducts || undefined
              const handleActivate = () => { if (product) try { onProductClick(product) } catch {} }
              const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate() } }
          // If product is not found, still allow rendering the pin (requirements say show nothing only when pins empty)
          // but clicking should not error
          const pinAreaRect = pinAreaRef.current?.getBoundingClientRect()
          if (!pinAreaRect || pinAreaRect.width === 0) return null
          const imageWidthPx = pinAreaRect.width
          // Resolve coordinates: prefer dotX/dotY (numbers), fall back to legacy percent fields
          const toNum = (v: any, def: number) => {
            if (v === null || typeof v === 'undefined' || v === '') return def
            const n = Number(v)
            return Number.isFinite(n) ? n : def
          }
          const dotXPercent = toNum(pin.dotX ?? pin.dotXPercent, 0)
          const dotYPercent = toNum(pin.dotY ?? pin.dotYPercent, 0)
          const tagXPercent = pin.tagX != null ? toNum(pin.tagX, 0) : toNum(pin.tagXPercent, 0)
          const tagYPercent = pin.tagY != null ? toNum(pin.tagY, 0) : toNum(pin.tagYPercent, 0)
          const dotSizePercent = toNum(pin.dotSizePercent ?? pin.dotSizePercent, 0)
          const fontSizePercent = toNum(pin.tagFontSizePercent, 0)
          const lineWidthPercent = toNum(pin.lineWidthPercent, 0)
          const paddingXPercent = toNum(pin.tagPaddingXPercent, 0)
          const paddingYPercent = toNum(pin.tagPaddingYPercent, 0)
          const borderRadiusPercent = toNum(pin.tagBorderRadiusPercent, 0)
          const borderWidthPercent = toNum(pin.tagBorderWidthPercent, 0)
          const strokeWidthPercent = toNum((pin as any).tagTextStrokeWidth, 0)
          const bgWidthPercent = toNum((pin as any).tagBackgroundWidthPercent, 0)
          const bgHeightPercent = toNum((pin as any).tagBackgroundHeightPercent, 0)
          const bgOffsetXPercent = toNum((pin as any).tagBackgroundOffsetXPercent, 0)
          const bgOffsetYPercent = toNum((pin as any).tagBackgroundOffsetYPercent, 0)

          const dotSizePx = (dotSizePercent / 100) * imageWidthPx
          const fontSizePx = (fontSizePercent / 100) * imageWidthPx
          const lineWidthPx = (lineWidthPercent / 100) * imageWidthPx
          const paddingXPx = (paddingXPercent / 100) * imageWidthPx
          const paddingYPx = (paddingYPercent / 100) * imageWidthPx
          const borderRadiusPx = (borderRadiusPercent / 100) * imageWidthPx
          const borderWidthPx = (borderWidthPercent / 100) * imageWidthPx
          const strokeWidthPx = strokeWidthPercent ? (strokeWidthPercent / 100) * imageWidthPx : 0
          const bgWidthPx = bgWidthPercent && bgWidthPercent > 0 ? (bgWidthPercent / 100) * imageWidthPx : undefined
          const bgHeightPx = bgHeightPercent && bgHeightPercent > 0 ? (bgHeightPercent / 100) * imageWidthPx : undefined
          const bgOffsetXPx = bgOffsetXPercent ? (bgOffsetXPercent / 100) * imageWidthPx : 0
          const bgOffsetYPx = bgOffsetYPercent ? (bgOffsetYPercent / 100) * imageWidthPx : 0
          const bgOpacity = typeof (pin as any).tagBackgroundOpacity === 'number' ? (pin as any).tagBackgroundOpacity : 0.8
          const shadowAngle = toNum((pin as any).tagShadowAngle, 45)
          const shadowDistance = toNum((pin as any).tagShadowDistance, 2)
          const shadowBlur = toNum((pin as any).tagShadowBlur, 2)
          const shadowColor = (pin as any).tagShadowColor || "#000000"
          const shadowOpacity = toNum((pin as any).tagShadowOpacity, 0.5)
          const shadowX = Math.cos((shadowAngle * Math.PI) / 180) * shadowDistance
          const shadowY = Math.sin((shadowAngle * Math.PI) / 180) * shadowDistance
          let shadowRgba = "rgba(0,0,0,0.5)"
          if (typeof shadowColor === 'string' && shadowColor.startsWith("#") && shadowColor.length >= 7) {
            const r = Number.parseInt(shadowColor.slice(1, 3), 16)
            const g = Number.parseInt(shadowColor.slice(3, 5), 16)
            const b = Number.parseInt(shadowColor.slice(5, 7), 16)
            shadowRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`
          }
          // Allow admin-provided raw CSS `tag_text_shadow` to override computed shadow
          const textShadow = (pin as any).tagTextShadow || `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowRgba}`


              return (
                <div key={pin.id}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                    <line x1={`${dotXPercent}%`} y1={`${dotYPercent}%`} x2={`${tagXPercent}%`} y2={`${tagYPercent}%`} stroke={(pin as any).lineColor || "#ffffff"} strokeWidth={lineWidthPx} strokeDasharray={(pin as any).lineType === "dashed" ? `${lineWidthPx * 4} ${lineWidthPx * 2}` : (pin as any).lineType === "dotted" ? `${lineWidthPx} ${lineWidthPx}` : undefined} />
                  </svg>

                  <div className="absolute cursor-pointer hover:scale-125 transition-transform z-20" role={product ? 'button' : undefined} tabIndex={0} aria-label={(pin as any).tagDisplayText || pin.tagText || (product ? product.title : 'pin')} onKeyDown={handleKey} style={{ left: `${dotXPercent}%`, top: `${dotYPercent}%`, transform: "translate(-50%, -50%)", width: dotSizePx, height: dotSizePx }} onClick={handleActivate}>
                    <div className="w-full h-full ring-2 ring-white/30" style={{ backgroundColor: pin.dotColor || "#ffffff", borderRadius: (pin as any).dotShape === "circle" ? "50%" : (pin as any).dotShape === "square" ? "0" : (pin as any).dotShape === "diamond" ? "15%" : "0", clipPath: (pin as any).dotShape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : (pin as any).dotShape === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : undefined }} />
                  </div>

                  <div className="absolute cursor-pointer hover:scale-105 transition-transform whitespace-nowrap z-30" role={product ? 'button' : undefined} tabIndex={0} aria-label={(pin as any).tagDisplayText || pin.tagText || (product ? product.title : 'tag')} onKeyDown={handleKey} style={{ left: `${tagXPercent}%`, top: `${tagYPercent}%`, transform: "translate(-50%, -50%)" }} onClick={handleActivate}>
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(calc(-50% + ${bgOffsetXPx}px), calc(-50% + ${bgOffsetYPx}px))`, width: bgWidthPx ? bgWidthPx : "100%", height: bgHeightPx ? bgHeightPx : "100%", backgroundColor: pin.tagBackgroundColor || "#000000", opacity: bgOpacity, borderRadius: borderRadiusPx, borderWidth: borderWidthPx, borderStyle: "solid", borderColor: pin.tagBorderColor || "#ffffff", boxShadow: pin.tagShadow || "0 2px 8px rgba(0,0,0,0.2)", zIndex: -1 }} />
                      <div style={{ fontSize: fontSizePx, fontFamily: (pin as any).tagFontFamily || "system-ui", fontWeight: (pin as any).tagBold ? "bold" : (pin as any).tagFontWeight || "normal", fontStyle: (pin as any).tagItalic ? "italic" : "normal", textDecoration: (pin as any).tagUnderline ? "underline" : "none", textTransform: (pin as any).tagTextTransform || "none", color: (pin as any).tagTextColor || "#ffffff", textShadow: textShadow, WebkitTextStroke: strokeWidthPx > 0 ? `${strokeWidthPx}px ${(pin as any).tagTextStrokeColor}` : "none", textAlign: (pin as any).tagTextAlign, writingMode: (pin as any).tagVerticalWriting ? "vertical-rl" : "horizontal-tb", letterSpacing: `${(pin as any).tagLetterSpacing || 0}em`, lineHeight: (pin as any).tagLineHeight, padding: `${paddingYPx}px ${paddingXPx}px`, whiteSpace: "nowrap" }}>
                        {(pin as any).tagDisplayText || pin.tagText || (product ? product.title : null)}
                    </div>
                  </div>
                </div>
              )
            })
          })()
        ) : null} 
      </div>
    </div>
  )
}
