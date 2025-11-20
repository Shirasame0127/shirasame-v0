import type { Product, ProductImage, AffiliateLink } from "@/lib/mock-data/products"
import type { Recipe, RecipeImage, RecipeItem, CustomFont } from "@/lib/mock-data/recipes"
import type { Collection, CollectionItem } from "@/lib/mock-data/collections"
import type { User } from "@/lib/mock-data/users"

// ローカルストレージキー定義
const STORAGE_KEYS = {
  PRODUCTS: "mock_products",
  PRODUCT_IMAGES: "mock_product_images",
  AFFILIATE_LINKS: "mock_affiliate_links",
  RECIPES: "recipes_v2", // レシピ用のキーをシンプルに整理
  RECIPE_PINS: "recipe_pins_v2",
  COLLECTIONS: "mock_collections",
  COLLECTION_ITEMS: "mock_collection_items",
  USER: "mock_user",
  THEME: "mock_theme",
  TAGS: "mock_tags",
  CUSTOM_FONTS: "mock_custom_fonts",
  IMAGE_UPLOADS: "mock_image_uploads",
  AMAZON_SALE_SCHEDULES: "amazon_sale_schedules", // Amazonセールスケジュール用
} as const

// 型安全なストレージヘルパー
class LocalStorage<T> {
  constructor(private key: string) {}

  get(defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(this.key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  set(value: T): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.key, JSON.stringify(value))
    } catch (error) {
      console.error(`[v0] Failed to save ${this.key}:`, error)
    }
  }

  update(updater: (current: T) => T): void {
    const current = this.get([] as any)
    const updated = updater(current)
    this.set(updated)
  }
}

// ストレージインスタンス
export const productStorage = new LocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS)
export const productImageStorage = new LocalStorage<ProductImage[]>(STORAGE_KEYS.PRODUCT_IMAGES)
export const affiliateLinkStorage = new LocalStorage<AffiliateLink & { id: string; productId: string }[]>(
  STORAGE_KEYS.AFFILIATE_LINKS,
)
export const recipeStorage = new LocalStorage<Recipe[]>(STORAGE_KEYS.RECIPES)
export const recipeImageStorage = new LocalStorage<RecipeImage[]>(STORAGE_KEYS.RECIPE_IMAGES)
export const recipeItemStorage = new LocalStorage<RecipeItem[]>(STORAGE_KEYS.RECIPE_ITEMS)
export const collectionStorage = new LocalStorage<Collection[]>(STORAGE_KEYS.COLLECTIONS)
export const collectionItemStorage = new LocalStorage<CollectionItem[]>(STORAGE_KEYS.COLLECTION_ITEMS)
export const userStorage = new LocalStorage<User[]>(STORAGE_KEYS.USER)
export const themeStorage = new LocalStorage<any>(STORAGE_KEYS.THEME)
export const tagStorage = new LocalStorage<any[]>(STORAGE_KEYS.TAGS)
export const customFontStorage = new LocalStorage<CustomFont[]>(STORAGE_KEYS.CUSTOM_FONTS)
export const imageUploadStorage = new LocalStorage<Record<string, string>>(STORAGE_KEYS.IMAGE_UPLOADS)
export const recipePinStorage = new LocalStorage<any[]>(STORAGE_KEYS.RECIPE_PINS) // 新しいストレージインスタンス追加
export const amazonSaleScheduleStorage = new LocalStorage<any[]>(STORAGE_KEYS.AMAZON_SALE_SCHEDULES) // Amazonセールスケジュール用のストレージインスタンスを追加

// データベース操作API
export const db = {
  // 商品操作
  products: {
    getAll: (userId?: string) => {
      const products = productStorage.get([])
      return userId ? products.filter((p) => p.userId === userId) : products
    },
    getById: (id: string) => productStorage.get([]).find((p) => p.id === id),
    create: (product: Product) => {
      productStorage.update((products) => [...products, product])
      console.log("[v0] DB: Created product", product.id)
      return product
    },
    update: (id: string, updates: Partial<Product>) => {
      productStorage.update((products) =>
        products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
      )
      console.log("[v0] DB: Updated product", id)
    },
    delete: (id: string) => {
      productStorage.update((products) => products.filter((p) => p.id !== id))
      console.log("[v0] DB: Deleted product", id)
    },
  },

  // レシピ操作
  recipes: {
    getAll: (userId?: string) => {
      const recipes = recipeStorage.get([])
      return userId ? recipes.filter((r) => r.userId === userId) : recipes
    },
    getById: (id: string) => {
      const recipe = recipeStorage.get([]).find((r) => r.id === id)
      if (!recipe) return null

      // ピン情報を取得して結合
      const pins = db.recipePins.getByRecipeId(id)
      return { ...recipe, pins }
    },
    create: (recipe: Omit<Recipe, "pins">) => {
      const newRecipe = { ...recipe, pins: [] }
      recipeStorage.update((recipes) => [...recipes, newRecipe])
      console.log("[v0] DB: Created recipe", recipe.id)
      return newRecipe
    },
    update: (id: string, updates: Partial<Omit<Recipe, "pins">>) => {
      recipeStorage.update((recipes) =>
        recipes.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r)),
      )
      console.log("[v0] DB: Updated recipe", id)
    },
    delete: (id: string) => {
      recipeStorage.update((recipes) => recipes.filter((r) => r.id !== id))
      // 関連するピンも削除
      db.recipePins.deleteByRecipeId(id)
      console.log("[v0] DB: Deleted recipe", id)
    },
    togglePublish: (id: string) => {
      recipeStorage.update((recipes) => recipes.map((r) => (r.id === id ? { ...r, published: !r.published } : r)))
      console.log("[v0] DB: Toggled recipe publish status", id)
    },
  },

  // レシピ画像操作
  recipeImages: {
    getByRecipeId: (recipeId: string) => recipeImageStorage.get([]).find((img) => img.recipeId === recipeId),
    upsert: (image: RecipeImage) => {
      const images = recipeImageStorage.get([])
      const existing = images.find((img) => img.recipeId === image.recipeId)
      if (existing) {
        recipeImageStorage.set(images.map((img) => (img.recipeId === image.recipeId ? image : img)))
      } else {
        recipeImageStorage.set([...images, image])
      }
      console.log("[v0] DB: Upserted recipe image", image.recipeId)
    },
  },

  // レシピアイテム操作
  recipeItems: {
    getByRecipeId: (recipeId: string) => recipeItemStorage.get([]).filter((item) => item.recipeId === recipeId),
    create: (item: RecipeItem) => {
      recipeItemStorage.update((items) => [...items, item])
      console.log("[v0] DB: Created recipe item", item.id)
      return item
    },
    update: (id: string, updates: Partial<RecipeItem>) => {
      recipeItemStorage.update((items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
      console.log("[v0] DB: Updated recipe item", id)
    },
    delete: (id: string) => {
      recipeItemStorage.update((items) => items.filter((item) => item.id !== id))
      console.log("[v0] DB: Deleted recipe item", id)
    },
    bulkUpdate: (items: RecipeItem[]) => {
      recipeItemStorage.set(items)
      console.log("[v0] DB: Bulk updated recipe items")
    },
  },

  // コレクション操作
  collections: {
    getAll: (userId?: string) => {
      const collections = collectionStorage.get([])
      return userId ? collections.filter((c) => c.userId === userId) : collections
    },
    getById: (id: string) => collectionStorage.get([]).find((c) => c.id === id),
    create: (collection: Collection) => {
      collectionStorage.update((collections) => [...collections, collection])
      console.log("[v0] DB: Created collection", collection.id)
      return collection
    },
    update: (id: string, updates: Partial<Collection>) => {
      collectionStorage.update((collections) =>
        collections.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
      )
      console.log("[v0] DB: Updated collection", id)
    },
    delete: (id: string) => {
      collectionStorage.update((collections) => collections.filter((c) => c.id !== id))
      console.log("[v0] DB: Deleted collection", id)
    },
  },

  // コレクションアイテム操作
  collectionItems: {
    getByCollectionId: (collectionId: string) =>
      collectionItemStorage.get([]).filter((item) => item.collectionId === collectionId),
    addProduct: (collectionId: string, productId: string) => {
      const items = collectionItemStorage.get([])
      const maxOrder = Math.max(0, ...items.filter((i) => i.collectionId === collectionId).map((i) => i.order))
      const newItem: CollectionItem = {
        id: `col-item-${Date.now()}`,
        collectionId,
        productId,
        order: maxOrder + 1,
        addedAt: new Date().toISOString(),
      }
      collectionItemStorage.set([...items, newItem])
      console.log("[v0] DB: Added product to collection", collectionId, productId)
    },
    removeProduct: (collectionId: string, productId: string) => {
      collectionItemStorage.update((items) =>
        items.filter((item) => !(item.collectionId === collectionId && item.productId === productId)),
      )
      console.log("[v0] DB: Removed product from collection", collectionId, productId)
    },
  },

  // ユーザー操作
  user: {
    get: (userId?: string) => {
      let users = userStorage.get([])

      if (!Array.isArray(users)) {
        console.warn("[v0] DB: userStorage returned non-array, converting to array format")
        if (users && typeof users === "object" && (users as any).id) {
          // 単一オブジェクトを配列に変換
          users = [users as any]
          userStorage.set(users)
        } else {
          console.error("[v0] DB: userStorage data is invalid, returning empty array")
          users = []
        }
      }

      if (userId) {
        return users.find((u: any) => u.id === userId) || null
      }
      return users.length > 0 ? users[0] : null
    },
    create: (user: User) => {
      let users = userStorage.get([])
      if (!Array.isArray(users)) {
        users = []
      }
      userStorage.set([...users, user])
      console.log("[v0] DB: Created user", user.id)
    },
    update: (userId: string, updates: Partial<User>) => {
      const users = userStorage.get([])
      if (!Array.isArray(users)) {
        console.error("[v0] DB: Cannot update user, storage is not an array")
        return
      }
      const updatedUsers = users.map((u: any) => (u.id === userId ? { ...u, ...updates } : u))
      userStorage.set(updatedUsers)
      console.log("[v0] DB: Updated user", userId)
    },
    addFavoriteFont: (userId: string, fontFamily: string) => {
      const users = userStorage.get([])
      if (!Array.isArray(users)) {
        console.error("[v0] DB: Cannot add favorite font, storage is not an array")
        return
      }
      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          const favorites = u.favoriteFonts || []
          if (!favorites.includes(fontFamily)) {
            return { ...u, favoriteFonts: [...favorites, fontFamily] }
          }
        }
        return u
      })
      userStorage.set(updatedUsers)
      console.log("[v0] DB: Added favorite font", fontFamily)
    },
    removeFavoriteFont: (userId: string, fontFamily: string) => {
      const users = userStorage.get([])
      if (!Array.isArray(users)) {
        console.error("[v0] DB: Cannot remove favorite font, storage is not an array")
        return
      }
      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          const favorites = u.favoriteFonts || []
          return { ...u, favoriteFonts: favorites.filter((f: string) => f !== fontFamily) }
        }
        return u
      })
      userStorage.set(updatedUsers)
      console.log("[v0] DB: Removed favorite font", fontFamily)
    },
    getFavoriteFonts: (userId: string) => {
      let users = userStorage.get([])
      if (!Array.isArray(users)) {
        console.warn("[v0] DB: userStorage.get([]) did not return an array, attempting to convert")
        if (users && typeof users === "object" && (users as any).id) {
          users = [users as any]
          userStorage.set(users)
        } else {
          return []
        }
      }
      const user = users.find((u: any) => u.id === userId)
      return user?.favoriteFonts || []
    },
  },

  // テーマ操作
  theme: {
    get: () => themeStorage.get(null),
    set: (theme: any) => {
      themeStorage.set(theme)
      console.log("[v0] DB: Set theme")
    },
  },

  // 画像アップロード管理
  images: {
    saveUpload: (key: string, url: string) => {
      imageUploadStorage.update((uploads) => ({ ...uploads, [key]: url }))
      console.log("[v0] DB: Saved image upload", key)
    },
    getUpload: (key: string) => imageUploadStorage.get({})[key],
  },

  tags: {
    getAll: () => {
      const allTags = tagStorage.get([])
      return allTags.filter((t: any) => !t.name?.startsWith("__GROUP_PLACEHOLDER__"))
    },

    getAllWithPlaceholders: () => {
      return tagStorage.get([])
    },

    saveAll: (tags: any[]) => {
      tagStorage.set(tags)
      console.log("[v0] DB: Saved all tags", tags.length)
    },

    getCustomTags: () => {
      const tags = tagStorage.get([])
      return tags.filter((t: any) => t.category === "カスタム").map((t: any) => t.name)
    },
    saveCustomTags: (tags: string[]) => {
      const existing = tagStorage.get([])
      const customTags = tags.map((name) => ({
        id: `tag-${Date.now()}-${Math.random()}`,
        name,
        category: "カスタム" as const,
        userId: "user-shirasame",
        createdAt: new Date().toISOString(),
      }))
      const nonCustom = existing.filter((t: any) => t.category !== "カスタム")
      tagStorage.set([...nonCustom, ...customTags])
      console.log("[v0] DB: Saved custom tags")
    },
    saveCategoryTags: (category: string, tags: string[]) => {
      const existing = tagStorage.get([])
      const categoryTags = tags.map((name) => ({
        id: `tag-${Date.now()}-${Math.random()}`,
        name,
        category: category as any,
        userId: null,
        createdAt: new Date().toISOString(),
      }))
      const otherCategories = existing.filter((t: any) => t.category !== category)
      tagStorage.set([...otherCategories, ...categoryTags])
      console.log("[v0] DB: Saved category tags", category)
    },
  },

  // レシピピン操作
  recipePins: {
    getByRecipeId: (recipeId: string) => recipePinStorage.get([]).filter((p: any) => p.recipeId === recipeId),
    create: (pin: any) => {
      recipePinStorage.update((pins) => [...pins, pin])
      console.log("[v0] DB: Created recipe pin", pin.id)
      return pin
    },
    updateAll: (recipeId: string, pins: any[]) => {
      recipePinStorage.update((allPins) => [...allPins.filter((p: any) => p.recipeId !== recipeId), ...pins])
      console.log("[v0] DB: Updated all pins for recipe", recipeId)
    },
    deleteById: (id: string) => {
      recipePinStorage.update((pins) => pins.filter((p: any) => p.id !== id))
      console.log("[v0] DB: Deleted pin", id)
    },
    deleteByRecipeId: (recipeId: string) => {
      recipePinStorage.update((pins) => pins.filter((p: any) => p.recipeId !== recipeId))
      console.log("[v0] DB: Deleted all pins for recipe", recipeId)
    },
  },

  // Amazonセールスケジュール操作
  amazonSaleSchedules: {
    getAll: (userId?: string) => {
      const schedules = amazonSaleScheduleStorage.get([])
      return userId ? schedules.filter((s: any) => s.userId === userId) : schedules
    },
    getById: (id: string) => amazonSaleScheduleStorage.get([]).find((s: any) => s.id === id),
    create: (schedule: any) => {
      const newSchedule = {
        id: `sale-${Date.now()}`,
        ...schedule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      amazonSaleScheduleStorage.update((schedules) => [...schedules, newSchedule])
      console.log("[v0] DB: Created Amazon sale schedule", newSchedule.id)
      return newSchedule
    },
    update: (id: string, updates: any) => {
      amazonSaleScheduleStorage.update((schedules) =>
        schedules.map((s: any) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)),
      )
      console.log("[v0] DB: Updated Amazon sale schedule", id)
    },
    delete: (id: string) => {
      amazonSaleScheduleStorage.update((schedules) => schedules.filter((s: any) => s.id !== id))
      console.log("[v0] DB: Deleted Amazon sale schedule", id)
    },
    getActiveSchedules: (userId?: string) => {
      const now = new Date()
      const schedules = amazonSaleScheduleStorage.get([])
      const activeSchedules = schedules.filter((s: any) => {
        const startDate = new Date(s.startDate)
        const endDate = new Date(s.endDate)
        return now >= startDate && now <= endDate
      })
      return userId ? activeSchedules.filter((s: any) => s.userId === userId) : activeSchedules
    },
  },

  // カスタムフォント操作
  customFonts: {
    getAll: (userId: string) => {
      const fonts = customFontStorage.get([])
      return fonts.filter((f: any) => f.userId === userId)
    },
    getById: (id: string) => {
      return customFontStorage.get([]).find((f: any) => f.id === id)
    },
    create: (font: Omit<CustomFont, "id" | "createdAt">) => {
      const newFont: CustomFont = {
        id: `custom-font-${Date.now()}`,
        ...font,
        createdAt: new Date().toISOString(),
      }
      customFontStorage.update((fonts) => [...fonts, newFont])
      console.log("[v0] DB: Created custom font", newFont.id)
      return newFont
    },
    delete: (id: string) => {
      customFontStorage.update((fonts) => fonts.filter((f: any) => f.id !== id))
      console.log("[v0] DB: Deleted custom font", id)
    },
  },

  // データ初期化（初回ロード時にモックデータをストレージに保存）
  initialize: (mockData: {
    products?: Product[]
    recipes?: Recipe[]
    recipeImages?: RecipeImage[]
    recipeItems?: RecipeItem[]
    collections?: Collection[]
    collectionItems?: CollectionItem[]
    user?: User
  }) => {
    if (typeof window === "undefined") return

    // 初回ロード時のみ初期化
    if (!localStorage.getItem("mock_initialized")) {
      if (mockData.products) productStorage.set(mockData.products)
      if (mockData.recipes) recipeStorage.set(mockData.recipes)
      if (mockData.recipeImages) recipeImageStorage.set(mockData.recipeImages)
      if (mockData.recipeItems) recipeItemStorage.set(mockData.recipeItems)
      if (mockData.collections) collectionStorage.set(mockData.collections)
      if (mockData.collectionItems) collectionItemStorage.set(mockData.collectionItems)
      if (mockData.user) {
        const existingUsers = userStorage.get([])
        if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
          userStorage.set([mockData.user])
        }
      }

      localStorage.setItem("mock_initialized", "true")
      console.log("[v0] DB: Initialized with mock data")
    } else {
      if (mockData.user) {
        const existingUsers = userStorage.get([])
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          const existingUser = existingUsers[0]
          // headerImageKeys, profileImageKey, customFonts など、ユーザーが設定したデータは保持
          const mergedUser = {
            ...mockData.user,
            headerImageKeys: existingUser.headerImageKeys || mockData.user.headerImageKeys || [],
            profileImageKey: existingUser.profileImageKey || mockData.user.profileImageKey,
            backgroundImageKey: existingUser.backgroundImageKey || mockData.user.backgroundImageKey,
            customFonts: existingUser.customFonts || mockData.user.customFonts || [],
            favoriteFonts: existingUser.favoriteFonts || mockData.user.favoriteFonts || [],
            avatarUrl: existingUser.avatarUrl || mockData.user.avatarUrl,
            headerImage: existingUser.headerImage || mockData.user.headerImage,
            backgroundValue: existingUser.backgroundValue || mockData.user.backgroundValue,
            socialLinks: existingUser.socialLinks || mockData.user.socialLinks,
            amazonAccessKey: existingUser.amazonAccessKey || mockData.user.amazonAccessKey,
            amazonSecretKey: existingUser.amazonSecretKey || mockData.user.amazonSecretKey,
            amazonAssociateId: existingUser.amazonAssociateId || mockData.user.amazonAssociateId,
          }
          userStorage.set([mergedUser])
          console.log("[v0] DB: Merged existing user data with mock defaults")
        }
      }
    }
  },

  // データリセット
  reset: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    localStorage.removeItem("mock_initialized")
    console.log("[v0] DB: Reset all data")
  },
}
