"use client"

import { useRef, useState } from "react"
import { getPublicImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/db/schema"

// ===========================
// 型定義
// ===========================
type RecipePin = {
  id: string
  productId: string
  // 位置（パーセント値、0-100）
  dotXPercent: number
  dotYPercent: number
  tagXPercent: number
  tagYPercent: number
  // サイズ（画像幅に対するパーセント値）
  dotSizePercent: number
  tagFontSizePercent: number
  lineWidthPercent: number
  tagBorderWidthPercent: number
  tagBorderRadiusPercent: number
  tagPaddingXPercent: number
  tagPaddingYPercent: number
  // スタイル
  dotColor: string
  dotShape: "circle" | "square" | "triangle" | "diamond"
  tagText: string
  tagFontFamily: string
  tagFontWeight: string
  tagTextColor: string
  tagTextShadow: string
  tagBackgroundColor: string
  tagBackgroundOpacity: number
  tagBorderColor: string
  tagShadow: string
  lineType: "solid" | "dashed" | "dotted" | "wavy" | "hand-drawn"
  lineColor: string

  tagTextStrokeColor?: string
  tagTextStrokeWidth?: number
  tagBackgroundWidthPercent?: number
  tagBackgroundHeightPercent?: number
  tagBackgroundOffsetXPercent?: number
  tagBackgroundOffsetYPercent?: number
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
  onProductClick: (product: Product) => void
}

/**
 * ==========================================================
 * レシピ表示コンポーネント（編集画面と完全一致版）
 * ==========================================================
 *
 * 【スケーリングの仕組み】
 *
 * 1. 編集画面で設定されたサイズはピクセル値として保存
 *    例：点のサイズ = 12px、フォントサイズ = 14px
 *
 * 2. 位置は基準画像サイズに対するパーセント値として保存
 *    例：X = 30%、Y = 42%
 *
 * 3. 表示時の計算：
 *    a. 画像の実際の表示サイズを取得（getBoundingClientRect）
 *    b. スケールを計算：scale = 表示幅 / 基準画像幅
 *    c. すべてのサイズをスケール：表示サイズ = 基準サイズ × scale
 *    d. 位置はパーセント値をそのまま使用
 *
 * 【具体例】
 * 編集画面：736×414の画像、30%,42%の位置にピン、フォントサイズ14px
 * 公開ページ：1472×828で表示（2倍）
 *
 * scale = 1472 / 736 = 2
 * 位置 = 30%, 42%（パーセントなので変わらない）
 * フォントサイズ = 14px × 2 = 28px
 *
 * 結果：編集画面と完全に同じ見た目が実現される
 * ==========================================================
 */
export function RecipeDisplay({
  recipeId,
  recipeTitle,
  imageDataUrl,
  imageUrl,
  imageWidth,
  imageHeight,
  aspectRatio = "4:3",
  pins,
  products,
  onProductClick,
}: RecipeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinAreaRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
      <div ref={pinAreaRef} className="relative w-full">
        <img
          src={(imageUrl ? getPublicImageUrl(imageUrl) : imageDataUrl) || "/placeholder.svg"}
          alt={recipeTitle}
          className="w-full h-auto object-contain rounded-md"
          onLoad={handleImageLoad}
        />

        {imageLoaded &&
          pins.map((pin) => {
            const product = products.find((p) => p.id === pin.productId)
            if (!product) return null

            const pinAreaRect = pinAreaRef.current?.getBoundingClientRect()
            if (!pinAreaRect || pinAreaRect.width === 0) return null

            const imageWidthPx = pinAreaRect.width

            // パーセント値をピクセルに変換（編集画面と同じ計算）
            const dotSizePx = (pin.dotSizePercent / 100) * imageWidthPx
            const fontSizePx = (pin.tagFontSizePercent / 100) * imageWidthPx
            const lineWidthPx = (pin.lineWidthPercent / 100) * imageWidthPx
            const paddingXPx = (pin.tagPaddingXPercent / 100) * imageWidthPx
            const paddingYPx = (pin.tagPaddingYPercent / 100) * imageWidthPx
            const borderRadiusPx = (pin.tagBorderRadiusPercent / 100) * imageWidthPx
            const borderWidthPx = (pin.tagBorderWidthPercent / 100) * imageWidthPx

            const strokeWidthPx = pin.tagTextStrokeWidth ? (pin.tagTextStrokeWidth / 100) * imageWidthPx : 0
            const bgWidthPx =
              pin.tagBackgroundWidthPercent && pin.tagBackgroundWidthPercent > 0
                ? (pin.tagBackgroundWidthPercent / 100) * imageWidthPx
                : undefined
            const bgHeightPx =
              pin.tagBackgroundHeightPercent && pin.tagBackgroundHeightPercent > 0
                ? (pin.tagBackgroundHeightPercent / 100) * imageWidthPx
                : undefined
            const bgOffsetXPx = pin.tagBackgroundOffsetXPercent
              ? (pin.tagBackgroundOffsetXPercent / 100) * imageWidthPx
              : 0
            const bgOffsetYPx = pin.tagBackgroundOffsetYPercent
              ? (pin.tagBackgroundOffsetYPercent / 100) * imageWidthPx
              : 0

            // シャドウの計算
            const shadowAngle = pin.tagShadowAngle ?? 45
            const shadowDistance = pin.tagShadowDistance ?? 2
            const shadowBlur = pin.tagShadowBlur ?? 2
            const shadowColor = pin.tagShadowColor ?? "#000000"
            const shadowOpacity = pin.tagShadowOpacity ?? 0.5

            const shadowX = Math.cos((shadowAngle * Math.PI) / 180) * shadowDistance
            const shadowY = Math.sin((shadowAngle * Math.PI) / 180) * shadowDistance

            // HEX to RGBA conversion for shadow
            let shadowRgba = "rgba(0,0,0,0.5)"
            if (shadowColor.startsWith("#")) {
              const r = Number.parseInt(shadowColor.slice(1, 3), 16)
              const g = Number.parseInt(shadowColor.slice(3, 5), 16)
              const b = Number.parseInt(shadowColor.slice(5, 7), 16)
              shadowRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`
            }
            const textShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowRgba}`

            console.log("[v0] [公開ページ] ピン描画:", {
              pinId: pin.id,
              画像幅: imageWidthPx,
              位置: { x: `${pin.dotXPercent}%`, y: `${pin.dotYPercent}%` },
              パーセント値: {
                点: `${pin.dotSizePercent}%`,
                フォント: `${pin.tagFontSizePercent}%`,
                線: `${pin.lineWidthPercent}%`,
              },
              ピクセル値: {
                点: dotSizePx,
                フォント: fontSizePx,
                線: lineWidthPx,
              },
            })

            return (
              <div key={pin.id}>
                {/* 線 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  <line
                    x1={`${pin.dotXPercent}%`}
                    y1={`${pin.dotYPercent}%`}
                    x2={`${pin.tagXPercent}%`}
                    y2={`${pin.tagYPercent}%`}
                    stroke={pin.lineColor || "#ffffff"}
                    strokeWidth={lineWidthPx}
                    strokeDasharray={
                      pin.lineType === "dashed"
                        ? `${lineWidthPx * 4} ${lineWidthPx * 2}`
                        : pin.lineType === "dotted"
                          ? `${lineWidthPx} ${lineWidthPx}`
                          : undefined
                    }
                  />
                </svg>

                {/* 点 */}
                <div
                  className="absolute cursor-pointer hover:scale-125 transition-transform z-20"
                  style={{
                    left: `${pin.dotXPercent}%`,
                    top: `${pin.dotYPercent}%`,
                    transform: "translate(-50%, -50%)",
                    width: dotSizePx,
                    height: dotSizePx,
                  }}
                  onClick={() => onProductClick(product)}
                >
                  <div
                    className="w-full h-full ring-2 ring-white/30"
                    style={{
                      backgroundColor: pin.dotColor || "#ffffff",
                      borderRadius:
                        pin.dotShape === "circle"
                          ? "50%"
                          : pin.dotShape === "square"
                            ? "0"
                            : pin.dotShape === "diamond"
                              ? "15%"
                              : "0",
                      clipPath:
                        pin.dotShape === "triangle"
                          ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                          : pin.dotShape === "diamond"
                            ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                            : undefined,
                    }}
                  />
                </div>

                {/* タグ */}
                <div
                  className="absolute cursor-pointer hover:scale-105 transition-transform whitespace-nowrap z-30"
                  style={{
                    left: `${pin.tagXPercent}%`,
                    top: `${pin.tagYPercent}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => onProductClick(product)}
                >
                  {/* 背景レイヤー（独立制御） */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${bgOffsetXPx}px), calc(-50% + ${bgOffsetYPx}px))`,
                      width: bgWidthPx ? bgWidthPx : "100%",
                      height: bgHeightPx ? bgHeightPx : "100%",
                      backgroundColor: pin.tagBackgroundColor || "#000000",
                      opacity: isFinite(pin.tagBackgroundOpacity) ? pin.tagBackgroundOpacity : 0.8,
                      borderRadius: borderRadiusPx,
                      borderWidth: borderWidthPx,
                      borderStyle: "solid",
                      borderColor: pin.tagBorderColor || "#ffffff",
                      boxShadow: pin.tagShadow || "0 2px 8px rgba(0,0,0,0.2)",
                      zIndex: -1,
                    }}
                  />

                  {/* テキストレイヤー */}
                  <div
                    style={{
                      fontSize: fontSizePx,
                      fontFamily: pin.tagFontFamily || "system-ui",
                      fontWeight: pin.tagBold ? "bold" : pin.tagFontWeight || "normal",
                      fontStyle: pin.tagItalic ? "italic" : "normal",
                      textDecoration: pin.tagUnderline ? "underline" : "none",
                      textTransform: pin.tagTextTransform || "none",
                      color: pin.tagTextColor || "#ffffff",
                      textShadow: textShadow,
                      WebkitTextStroke: strokeWidthPx > 0 ? `${strokeWidthPx}px ${pin.tagTextStrokeColor}` : "none",
                      textAlign: pin.tagTextAlign,
                      writingMode: pin.tagVerticalWriting ? "vertical-rl" : "horizontal-tb",
                      letterSpacing: `${pin.tagLetterSpacing}em`,
                      lineHeight: pin.tagLineHeight,
                      padding: `${paddingYPx}px ${paddingXPx}px`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pin.tagDisplayText || pin.tagText || product.title}
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
