export interface Collection {
  id: string
  userId: string
  title: string
  slug: string
  visibility: "public" | "draft"
  createdAt: string
}

export interface CollectionItem {
  id: string
  collectionId: string
  productId: string
  position: number
  addedAt: string
}

export const mockCollections: Collection[] = [
  {
    id: "col-1",
    userId: "user-shirasame",
    title: "今日のおすすめ",
    slug: "todays-picks",
    visibility: "public",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "col-2",
    userId: "user-shirasame",
    title: "ゲーミングデスク",
    slug: "gaming-desk",
    visibility: "public",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "col-3",
    userId: "user-shirasame",
    title: "新着",
    slug: "new-arrivals",
    visibility: "public",
    createdAt: "2025-01-01T00:00:00Z",
  },
]

export const mockCollectionItems: CollectionItem[] = [
  // 今日のおすすめ
  { id: "ci-1", collectionId: "col-1", productId: "prod-1", position: 1, addedAt: "2025-01-10T10:00:00Z" },
  { id: "ci-2", collectionId: "col-1", productId: "prod-2", position: 2, addedAt: "2025-01-10T10:05:00Z" },
  { id: "ci-3", collectionId: "col-1", productId: "prod-3", position: 3, addedAt: "2025-01-10T10:10:00Z" },

  // ゲーミングデスク
  { id: "ci-4", collectionId: "col-2", productId: "prod-2", position: 1, addedAt: "2025-01-09T14:30:00Z" },
  { id: "ci-5", collectionId: "col-2", productId: "prod-4", position: 2, addedAt: "2025-01-09T14:35:00Z" },
  { id: "ci-6", collectionId: "col-2", productId: "prod-5", position: 3, addedAt: "2025-01-09T14:40:00Z" },

  // 新着
  { id: "ci-7", collectionId: "col-3", productId: "prod-1", position: 1, addedAt: "2025-01-10T10:00:00Z" },
  { id: "ci-8", collectionId: "col-3", productId: "prod-6", position: 2, addedAt: "2025-01-05T13:00:00Z" },
]
