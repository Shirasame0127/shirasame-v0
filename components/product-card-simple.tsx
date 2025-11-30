// ========================================
// シンプル商品カード (ProductCardSimple)
// ========================================
// 商品のメイン画像のみを表示するシンプルなカードコンポーネントです。
// クリックすると商品詳細モーダルが開きます。
//
// 【カスタマイズできる主な項目】
// - 画像の角丸: rounded-md（rounded-lg、rounded-xlなど）
// - ホバー時の影: hover:shadow-md（shadow-lg、shadow-xlなど）
// - ホバー時の拡大率: group-hover:scale-105（1.05倍、他の数値も可）
// - アニメーション速度: duration-300（ミリ秒単位）

"use client"

import Image from "next/image"
import { getPublicImageUrl } from "@/lib/image-url"
import type { Product } from "@/lib/db/schema"

interface ProductCardSimpleProps {
  product: Product
  onClick: () => void
}

export function ProductCardSimple({ product, onClick }: ProductCardSimpleProps) {
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images.find((img) => img?.role === "main") || images[0] || null

  return (
    // カード全体をボタンとして機能させる
    <button
      onClick={onClick}
      className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
    >
      {/* 画像コンテナ */}
      {/* aspect-square: 正方形のアスペクト比を維持 */}
      {/* rounded-lg: 角丸をやや大きく */}
      {/* ホバー時に僅かに拡大＋明るさアップ */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transform transition-transform duration-300 ease-out motion-safe:will-change-transform hover:scale-[1.02] hover:shadow-md">
        <Image
          src={getPublicImageUrl(mainImage?.url) || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover rounded-lg transition duration-300 ease-out group-hover:brightness-105"
        />
      </div>
    </button>
  )
}
