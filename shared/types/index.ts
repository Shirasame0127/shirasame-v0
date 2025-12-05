export type ImageMeta = {
  url: string
  width?: number | null
  height?: number | null
  aspect?: number | null
  role?: string | null
  uploadedAt?: string | null
}

export type Product = {
  id: string
  title: string
  slug?: string
  price?: number
  shortDescription?: string
  createdAt: string
  tags?: string[]
  images: ImageMeta[]
  published?: boolean
  body?: string
  affiliateLinks?: { url: string; label?: string; site?: string }[]
  relatedLinks?: { url: string; label?: string }[]
  showPrice?: boolean
}

export type Collection = {
  id: string
  title: string
  description?: string
  products?: Product[]
}

export type RecipePin = { id: string; x: number; y: number; productId?: string }
export type Recipe = {
  id: string
  title: string
  imageDataUrl?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  pins: RecipePin[]
  images?: ImageMeta[]
  published?: boolean
}

export type User = {
  id: string
  displayName: string
  profileImage?: string
  avatarUrl?: string
  headerImageKeys?: string[]
  bio?: string
  socialLinks?: Record<string, string>
}

export type Tag = { id: string; name: string; group?: string | null }
export type TagGroup = { id: string; name: string }

export type AmazonSaleSchedule = {
  id: string
  userId?: string
  collectionId: string
  saleName: string
  startDate: string
  endDate: string
  createdAt?: string
  updatedAt?: string
}
