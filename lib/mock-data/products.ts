import type { Product as SchemaProduct } from "@/lib/db/schema"

export type Product = SchemaProduct
export type ProductImage = any
export type AffiliateLink = any

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    userId: "user-shirasame",
    title: "ロジクール MX Master 3S",
    slug: "logitech-mx-master-3s",
    shortDescription: "最高の生産性を実現するワイヤレスマウス",
    body: "静音クリック、8Kセンサー、最大70日のバッテリー寿命を備えた究極のマウスです。",
    images: [
      {
        id: "img-1",
        productId: "prod-1",
        url: "/logitech-mx-master-3s-mouse.jpg",
        width: 400,
        height: 400,
        aspect: "1:1",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
    ],
    tags: ["マウス", "デスク周り", "生産性"],
    price: 15800,
    published: true,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "prod-2",
    userId: "user-shirasame",
    title: "HHKB Professional HYBRID Type-S",
    slug: "hhkb-professional-hybrid-type-s",
    shortDescription: "静音性と打鍵感を両立した高級キーボード",
    body: "プログラマーやライターに愛される、コンパクトで高品質なキーボードです。",
    images: [
      {
        id: "img-2",
        productId: "prod-2",
        url: "/hhkb-keyboard-white.jpg",
        width: 600,
        height: 400,
        aspect: "3:2",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
      {
        provider: "楽天",
        url: "https://rakuten.co.jp/example",
        label: "楽天で見る",
      },
    ],
    tags: ["キーボード", "デスク周り", "生産性"],
    price: 36850,
    published: true,
    createdAt: "2025-01-09T14:30:00Z",
    updatedAt: "2025-01-09T14:30:00Z",
  },
  {
    id: "prod-3",
    userId: "user-shirasame",
    title: "BenQ ScreenBar Plus",
    slug: "benq-screenbar-plus",
    shortDescription: "モニター掛け式デスクライト",
    body: "デスクスペースを取らず、目に優しい照明を提供します。自動調光機能付き。",
    images: [
      {
        id: "img-3",
        productId: "prod-3",
        url: "/benq-screenbar-monitor-light.jpg",
        width: 600,
        height: 400,
        aspect: "3:2",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
    ],
    tags: ["照明", "デスク周り", "目に優しい"],
    price: 16800,
    published: true,
    createdAt: "2025-01-08T09:15:00Z",
    updatedAt: "2025-01-08T09:15:00Z",
  },
  {
    id: "prod-4",
    userId: "user-shirasame",
    title: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    shortDescription: "業界最高クラスのノイズキャンセリング",
    body: "最高峰のノイズキャンセリング技術と、クリアな音質を実現したワイヤレスヘッドホン。",
    images: [
      {
        id: "img-4",
        productId: "prod-4",
        url: "/sony-wh-1000xm5-headphones-black.jpg",
        width: 400,
        height: 400,
        aspect: "1:1",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
    ],
    tags: ["ヘッドホン", "オーディオ", "集中力"],
    price: 53900,
    published: true,
    createdAt: "2025-01-07T16:20:00Z",
    updatedAt: "2025-01-07T16:20:00Z",
  },
  {
    id: "prod-5",
    userId: "user-shirasame",
    title: "エルゴトロン LX デスクマウントアーム",
    slug: "ergotron-lx-monitor-arm",
    shortDescription: "モニターアームでデスクをすっきり",
    body: "最大34インチのモニターに対応。自由な位置調整が可能で、デスクスペースを最大限に活用。",
    images: [
      {
        id: "img-5",
        productId: "prod-5",
        url: "/ergotron-lx-monitor-arm.jpg",
        width: 400,
        height: 400,
        aspect: "1:1",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
    ],
    tags: ["モニターアーム", "デスク周り", "エルゴノミクス"],
    price: 17800,
    published: true,
    createdAt: "2025-01-06T11:45:00Z",
    updatedAt: "2025-01-06T11:45:00Z",
  },
  {
    id: "prod-6",
    userId: "user-shirasame",
    title: "Anker PowerConf C300",
    slug: "anker-powerconf-c300",
    shortDescription: "高画質ウェブカメラ",
    body: "2Kの高解像度とAI自動フレーミング機能を搭載。リモートワークに最適。",
    images: [
      {
        id: "img-6",
        productId: "prod-6",
        url: "/anker-webcam-black.jpg",
        width: 500,
        height: 400,
        aspect: "5:4",
        role: "main",
      },
    ],
    affiliateLinks: [
      {
        provider: "Amazon",
        url: "https://amazon.co.jp/example",
        label: "Amazonで見る",
      },
    ],
    tags: ["カメラ", "リモートワーク", "ビデオ会議"],
    price: 12800,
    published: true,
    createdAt: "2025-01-05T13:00:00Z",
    updatedAt: "2025-01-05T13:00:00Z",
  },
]
