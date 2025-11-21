import type { Collection as SchemaCollection } from "@/lib/db/schema"

export type Collection = SchemaCollection

export type CollectionItem = {
  id: string
  collectionId: string
  productId: string
  order: number
  createdAt: string
}

export const mockCollections: Collection[] = [
  {
    id: "col-1",
    userId: "user-shirasame",
    title: "今日のおすすめ",
    slug: "todays-picks",
    visibility: "public",
    description: "しらさめのおすすめアイテム",
    productIds: ["prod-1","prod-2","prod-3"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "col-2",
    userId: "user-shirasame",
    title: "ゲーミングデスク",
    slug: "gaming-desk",
    visibility: "public",
    description: "ゲーミング向けのおすすめセット",
    productIds: ["prod-2","prod-4","prod-5"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "col-3",
    userId: "user-shirasame",
    title: "新着",
    slug: "new-arrivals",
    visibility: "public",
    description: "最近追加された商品",
    productIds: ["prod-1","prod-6"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
]

export const mockCollectionItems: CollectionItem[] = [
  // 今日のおすすめ
  { id: "ci-1", collectionId: "col-1", productId: "prod-1", order: 1, createdAt: "2025-01-10T10:00:00Z" },
  { id: "ci-2", collectionId: "col-1", productId: "prod-2", order: 2, createdAt: "2025-01-10T10:05:00Z" },
  { id: "ci-3", collectionId: "col-1", productId: "prod-3", order: 3, createdAt: "2025-01-10T10:10:00Z" },

  // ゲーミングデスク
  { id: "ci-4", collectionId: "col-2", productId: "prod-2", order: 1, createdAt: "2025-01-09T14:30:00Z" },
  { id: "ci-5", collectionId: "col-2", productId: "prod-4", order: 2, createdAt: "2025-01-09T14:35:00Z" },
  { id: "ci-6", collectionId: "col-2", productId: "prod-5", order: 3, createdAt: "2025-01-09T14:40:00Z" },

  // 新着
  { id: "ci-7", collectionId: "col-3", productId: "prod-1", order: 1, createdAt: "2025-01-10T10:00:00Z" },
  { id: "ci-8", collectionId: "col-3", productId: "prod-6", order: 2, createdAt: "2025-01-05T13:00:00Z" },
]
