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
import type { Product } from "@/lib/mock-data/products"

interface ProductCardSimpleProps {
  product: Product
  onClick: () => void
}

export function ProductCardSimple({ product, onClick }: ProductCardSimpleProps) {
  const mainImage = product.images.find((img) => img.role === "main") || product.images[0]

  return (
    // カード全体をボタンとして機能させる
    <button onClick={onClick} className="group block w-full text-left">
      {/* 画像コンテナ */}
      {/* aspect-square: 正方形のアスペクト比を維持 */}
      {/* rounded-md: 角丸の大きさ（sm, md, lg, xlから選択） */}
      {/* hover:shadow-md: ホバー時の影の大きさ */}
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted hover:shadow-md transition-all duration-300">
        <Image
          src={mainImage?.url || "/placeholder.svg"}
          alt={product.title}
          fill
          // group-hover:scale-105: ホバー時に1.05倍に拡大
          // 数値を変更すると拡大率が変わります（例: scale-110で1.1倍）
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </button>
  )
}
