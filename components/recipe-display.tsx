'use client'

import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/mock-data/products'

// ===========================
// 型定義
// ===========================
type RecipePin = {
  id: string
  productId: string
  // 位置（基準画像サイズに対するパーセント）
  dotXPercent: number
  dotYPercent: number
  tagXPercent: number
  tagYPercent: number
  // サイズ（ピクセル値、編集時の固定値）
  dotSize: number
  tagFontSize: number
  lineWidth: number
  tagBorderWidth: number
  tagBorderRadius: number
  tagPaddingX: number
  tagPaddingY: number
  // スタイル
  dotColor: string
  dotShape: 'circle' | 'square' | 'triangle' | 'diamond'
  tagText: string
  tagFontFamily: string
  tagFontWeight: string
  tagTextColor: string
  tagTextShadow: string
  tagBackgroundColor: string
  tagBackgroundOpacity: number
  tagBorderColor: string
  tagShadow: string
  lineType: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'hand-drawn'
  lineColor: string
}

type RecipeDisplayProps = {
  recipeId: string
  recipeTitle: string
  imageDataUrl: string
  imageWidth: number  // 基準画像の幅（データベースに保存された値）
  imageHeight: number // 基準画像の高さ（データベースに保存された値）
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
  imageWidth,
  imageHeight,
  pins,
  products,
  onProductClick
}: RecipeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  /**
   * 画像の読み込みとリサイズを監視してスケールを計算
   * 編集画面と全く同じロジック
   */
  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current && containerRef.current && imageLoaded) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const imageRect = imageRef.current.getBoundingClientRect()
        
        if (containerRect.width > 0 && containerRect.height > 0 &&
            imageRect.width > 0 && imageRect.height > 0) {
          const scaleX = imageRect.width / imageWidth
          const scaleY = imageRect.height / imageHeight
          const calculatedScale = Math.min(scaleX, scaleY)
          
          if (isFinite(calculatedScale) && calculatedScale > 0) {
            setScale(calculatedScale)
            console.log('[v0] [公開ページ] スケール計算詳細:', {
              scale: calculatedScale,
              表示サイズ: `${imageRect.width}x${imageRect.height}`,
              基準サイズ: `${imageWidth}x${imageHeight}`,
              scaleX,
              scaleY,
              '使用スケール': calculatedScale === scaleX ? 'scaleX（横基準）' : 'scaleY（縦基準）'
            })
          }
        }
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    
    return () => {
      window.removeEventListener('resize', updateScale)
    }
  }, [imageWidth, imageHeight, imageLoaded])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setTimeout(() => {
      if (imageRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const imageRect = imageRef.current.getBoundingClientRect()
        
        if (containerRect.width > 0 && containerRect.height > 0 &&
            imageRect.width > 0 && imageRect.height > 0) {
          const scaleX = imageRect.width / imageWidth
          const scaleY = imageRect.height / imageHeight
          const calculatedScale = Math.min(scaleX, scaleY)
          
          if (isFinite(calculatedScale) && calculatedScale > 0) {
            setScale(calculatedScale)
            console.log('[v0] RecipeDisplay image loaded, scale:', calculatedScale)
          }
        }
      }
    }, 100)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
      <img
        ref={imageRef}
        src={imageDataUrl || "/placeholder.svg"}
        alt={recipeTitle}
        className="w-full h-auto object-contain rounded-lg"
        style={{ aspectRatio: '4 / 3' }}
        onLoad={handleImageLoad}
      />

      {imageLoaded && scale > 0 && pins.map((pin) => {
        const product = products.find(p => p.id === pin.productId)
        if (!product) return null

        const dotXPercent = isFinite(pin.dotXPercent) ? pin.dotXPercent : 50
        const dotYPercent = isFinite(pin.dotYPercent) ? pin.dotYPercent : 50
        const tagXPercent = isFinite(pin.tagXPercent) ? pin.tagXPercent : 50
        const tagYPercent = isFinite(pin.tagYPercent) ? pin.tagYPercent : 50

        const safeDotSize = isFinite(pin.dotSize) ? pin.dotSize : 12
        const safeFontSize = isFinite(pin.tagFontSize) ? pin.tagFontSize : 14
        const safeLineWidth = isFinite(pin.lineWidth) ? pin.lineWidth : 2
        const safePaddingX = isFinite(pin.tagPaddingX) ? pin.tagPaddingX : 12
        const safePaddingY = isFinite(pin.tagPaddingY) ? pin.tagPaddingY : 6
        const safeBorderRadius = isFinite(pin.tagBorderRadius) ? pin.tagBorderRadius : 4
        const safeBorderWidth = isFinite(pin.tagBorderWidth || 0) ? (pin.tagBorderWidth || 0) : 0

        const scaledDotSize = Math.max(1, safeDotSize * scale)
        const scaledFontSize = Math.max(8, safeFontSize * scale)
        const scaledLineWidth = Math.max(1, safeLineWidth * scale)
        const scaledPaddingX = Math.max(0, safePaddingX * scale)
        const scaledPaddingY = Math.max(0, safePaddingY * scale)
        const scaledBorderRadius = Math.max(0, safeBorderRadius * scale)
        const scaledBorderWidth = Math.max(0, safeBorderWidth * scale)

        console.log('[v0] [公開ページ] ピン描画:', {
          pinId: pin.id,
          scale,
          位置: {
            点: `${dotXPercent}%, ${dotYPercent}%`,
            タグ: `${tagXPercent}%, ${tagYPercent}%`
          },
          元のサイズ: {
            点: safeDotSize,
            フォント: safeFontSize,
            線: safeLineWidth
          },
          スケール後: {
            点: scaledDotSize,
            フォント: scaledFontSize,
            線: scaledLineWidth
          }
        })

        return (
          <div key={pin.id}>
            {/* 線 */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <line
                x1={`${dotXPercent}%`}
                y1={`${dotYPercent}%`}
                x2={`${tagXPercent}%`}
                y2={`${tagYPercent}%`}
                stroke={pin.lineColor || '#ffffff'}
                strokeWidth={scaledLineWidth}
                strokeDasharray={
                  pin.lineType === 'dashed' ? `${scaledLineWidth * 4} ${scaledLineWidth * 2}` :
                  pin.lineType === 'dotted' ? `${scaledLineWidth} ${scaledLineWidth}` :
                  undefined
                }
              />
            </svg>

            {/* 点 */}
            <div
              className="absolute cursor-pointer hover:scale-125 transition-transform z-20"
              style={{
                left: `${dotXPercent}%`,
                top: `${dotYPercent}%`,
                width: `${scaledDotSize}px`,
                height: `${scaledDotSize}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => onProductClick(product)}
            >
              <div
                className="w-full h-full ring-2 ring-white/30"
                style={{
                  backgroundColor: pin.dotColor || '#ffffff',
                  borderRadius: pin.dotShape === 'circle' ? '50%' : 
                                pin.dotShape === 'square' ? '0' : 
                                pin.dotShape === 'diamond' ? '15%' : '0',
                  clipPath: pin.dotShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                            pin.dotShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 
                            undefined,
                }}
              />
            </div>

            {/* タグ */}
            <div
              className="absolute cursor-pointer hover:scale-105 transition-transform whitespace-nowrap z-30"
              style={{
                left: `${tagXPercent}%`,
                top: `${tagYPercent}%`,
                fontSize: `${scaledFontSize}px`,
                fontFamily: pin.tagFontFamily || 'system-ui',
                fontWeight: pin.tagFontWeight || 'normal',
                color: pin.tagTextColor || '#ffffff',
                textShadow: pin.tagTextShadow || '0 2px 4px rgba(0,0,0,0.3)',
                backgroundColor: pin.tagBackgroundColor || '#000000',
                opacity: isFinite(pin.tagBackgroundOpacity) ? pin.tagBackgroundOpacity : 0.8,
                borderWidth: `${scaledBorderWidth}px`,
                borderStyle: 'solid',
                borderColor: pin.tagBorderColor || '#ffffff',
                borderRadius: `${scaledBorderRadius}px`,
                boxShadow: pin.tagShadow || '0 2px 8px rgba(0,0,0,0.2)',
                padding: `${scaledPaddingY}px ${scaledPaddingX}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => onProductClick(product)}
            >
              {pin.tagText || product.title}
            </div>
          </div>
        )
      })}
    </div>
  )
}
