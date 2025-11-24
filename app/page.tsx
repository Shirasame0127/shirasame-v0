"use client"

import { useEffect, useState } from "react"
import { PublicNav } from "@/components/public-nav"
import { ProfileCard } from "@/components/profile-card"
import { ProductCardSimple } from "@/components/product-card-simple"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { RecipeDisplay } from "@/components/recipe-display"
import { db } from "@/lib/db/storage"
import type { Product } from "@/lib/db/schema"
import Image from "next/image"
import { getPublicImageUrl } from "@/lib/image-url"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, List, Filter, SortAsc, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
// Use persisted user record (cloud-first). Do not rely on local mock data.
import { ProfileHeader } from "@/components/profile-header"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [user, setUser] = useState<any>(db.user.get() || null)
  const [theme, setTheme] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [gridColumns, setGridColumns] = useState(6) // PCのデフォルト列数を6列に変更
  const [sortMode, setSortMode] = useState<"newest" | "clicks" | "price-asc" | "price-desc">("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        // 公開商品をAPIから取得
        const prodRes = await fetch("/api/products?published=true")
        const prodJson = await prodRes.json().catch(() => ({ data: [] }))
        const apiProducts = Array.isArray(prodJson.data) ? prodJson.data : []

        // 公開コレクション（所属商品つき）をAPIから取得
        const colRes = await fetch("/api/collections")
        const colJson = await colRes.json().catch(() => ({ data: [] }))
        const apiCollections = Array.isArray(colJson.data) ? colJson.data : []

        // レシピ・ユーザー・テーマは既存モックDBを継続利用
        const loadedRecipes = db.recipes.getAll()
        const loadedTheme = db.theme.get()

        // Profile: prefer server API (cloud-first). Fall back to in-memory cache if API not available yet.
        let loadedUser: any = null
        try {
          const profileRes = await fetch('/api/profile')
          if (profileRes.ok) {
            const pj = await profileRes.json().catch(() => null)
            loadedUser = pj?.data || pj || null
          }
        } catch (e) {
          // ignore and fallback to cache
        }

        if (!loadedUser) {
          loadedUser = db.user.get()
        }

        setProducts(apiProducts.filter((p: any) => p.published))
        setRecipes(loadedRecipes.filter((r: any) => r.published))
        setCollections(apiCollections)
        setUser(loadedUser || null)
        setTheme(loadedTheme)

        // 公開されている商品の tags からタググループを動的に構築
        const groups: Record<string, string[]> = {}
        apiProducts
          .filter((p: any) => p.published && Array.isArray(p.tags))
          .forEach((p: any) => {
            ;(p.tags as string[]).forEach((tag) => {
              const isLinkTag =
                tag === "Amazon" || tag === "楽天市場" || tag === "Yahoo!ショッピング" || tag === "公式サイト"
              const groupName = isLinkTag ? "リンク先" : "その他"
              if (!groups[groupName]) {
                groups[groupName] = []
              }
              if (!groups[groupName].includes(tag)) {
                groups[groupName].push(tag)
              }
            })
          })

        setTagGroups(groups)

        console.log(
          "[v0] Loaded public data from API - Products:",
          apiProducts.length,
          "Recipes:",
          loadedRecipes.filter((r: any) => r.published).length,
        )
      } catch (e) {
        console.error("[v0] Failed to load public data", e)
      } finally {
        setIsLoaded(true)
      }
    })()
  }, [])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesTag = selectedTags.length === 0 || selectedTags.some((tag) => p.tags.includes(tag))
      const matchesText =
        !searchText.trim() ||
        p.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(searchText.toLowerCase()))
      return matchesTag && matchesText
    })
    .sort((a, b) => {
      switch (sortMode) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "clicks":
          return Math.random() - 0.5
        case "price-asc":
          return (a.price || 0) - (b.price || 0)
        case "price-desc":
          return (b.price || 0) - (a.price || 0)
        default:
          return 0
      }
    })

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>
  }

  const appliedStyle = theme
    ? {
        fontFamily: theme.fonts?.body || undefined,
      }
    : {}

  const getProductsForCollection = (collectionId: string) => {
    const col = collections.find((c: any) => c.id === collectionId)
    return (col?.products || []) as Product[]
  }

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-4 ${isMobile ? "text-sm" : ""}`}>
      <div className="space-y-2">
        <Label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>テキスト検索</Label>
        <Input
          placeholder="商品名・説明文で検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={isMobile ? "text-xs h-9" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>表示設定</Label>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size={isMobile ? "sm" : "sm"}
              onClick={() => setViewMode("grid")}
              className={isMobile ? "text-xs h-8" : ""}
            >
              <Grid3x3 className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
              グリッド
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size={isMobile ? "sm" : "sm"}
              onClick={() => setViewMode("list")}
              className={isMobile ? "text-xs h-8" : ""}
            >
              <List className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
              リスト
            </Button>
          </div>

          {viewMode === "grid" && (
            <Select value={String(gridColumns)} onValueChange={(v) => setGridColumns(Number(v))}>
              <SelectTrigger className={`w-24 ${isMobile ? "text-xs h-8" : ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3列</SelectItem>
                <SelectItem value="4">4列</SelectItem>
                <SelectItem value="5">5列</SelectItem>
                <SelectItem value="6">6列</SelectItem>
                <SelectItem value="7">7列</SelectItem>
                <SelectItem value="8">8列</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>並び替え</Label>
        <Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
          <SelectTrigger className={`w-full ${isMobile ? "text-xs h-9" : ""}`}>
            <SortAsc className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-2`} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">新しい順</SelectItem>
            <SelectItem value="clicks">クリック数順</SelectItem>
            <SelectItem value="price-asc">価格が安い順</SelectItem>
            <SelectItem value="price-desc">価格が高い順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(tagGroups).length > 0 && (
        <div className="space-y-2">
          <Label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold`}>タグで絞り込み</Label>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted rounded-lg">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className={`cursor-pointer ${isMobile ? "text-[10px] px-2 py-0.5" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          <Accordion type="multiple" className="w-full">
            {Object.entries(tagGroups).map(([groupName, tags]) => (
              <AccordionItem key={groupName} value={groupName}>
                <AccordionTrigger className={isMobile ? "text-xs py-2" : "text-sm"}>
                  {groupName}
                  {selectedTags.some((t) => tags.includes(t)) && (
                    <Badge variant="secondary" className={`ml-2 ${isMobile ? "text-[10px] px-1.5 py-0" : ""}`}>
                      {selectedTags.filter((t) => tags.includes(t)).length}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer hover:scale-105 transition-transform ${
                          isMobile ? "text-[10px] px-2 py-0.5" : ""
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className={`w-full ${isMobile ? "text-xs h-8" : ""}`}
            >
              <X className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1`} />
              絞り込みを解除
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen" style={appliedStyle}>
      <main className="min-h-screen pb-20 relative">
        <PublicNav logoUrl={user?.avatarUrl || user?.profileImage} siteName={user?.displayName || ""} />

        {user && <ProfileHeader user={user} />}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* コレクションセクション */}
          {collections.length > 0 && (
            <section id="collections" className="mb-16">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8">Collection</h2>

              <div className="space-y-12">
                {collections.map((collection) => {
                  const collectionProducts = getProductsForCollection(collection.id)
                  return (
                    <div key={collection.id} id={`collection-${collection.id}`} className="mb-12 scroll-mt-20">
                      <h3 className="font-heading text-lg sm:text-xl font-semibold text-center mb-4">
                        {collection.title}
                      </h3>
                      {collection.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">
                          {collection.description}
                        </p>
                      )}

                      {collectionProducts.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                          {collectionProducts.map((product) => (
                            <ProductCardSimple
                              key={product.id}
                              product={product}
                              onClick={() => handleProductClick(product)}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8 text-sm">商品がありません</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* すべての商品セクション */}
          {products.length > 0 && (
            <section id="all-products" className="mb-16 scroll-mt-20">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center">All Items</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">
                公開中の商品を一覧表示しています
              </p>

              <div className="mb-6">
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 hidden sm:flex"
                  >
                    <Filter className="w-4 h-4" />
                    Sort
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedTags.length}件
                      </Badge>
                    )}
                  </Button>

                  <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="lg" className="gap-2 sm:hidden bg-transparent">
                        <Filter className="w-4 h-4" />
                        Sort
                        {selectedTags.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedTags.length}件
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-4 pb-0 flex flex-col">
                      <SheetHeader className="pb-4 border-b">
                        <SheetTitle className="text-base">絞り込み・並び替え</SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <FilterContent isMobile={true} />
                      </div>

                      <div className="py-4 border-t bg-background sticky bottom-0">
                        <Button className="w-full h-10 text-sm" onClick={() => setIsFilterSheetOpen(false)}>
                          適用する
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {showFilters && (
                  <div className="mt-4 border rounded-lg p-6 bg-card animate-in fade-in slide-in-from-top-2 duration-300 hidden sm:block">
                    <FilterContent />
                  </div>
                )}
              </div>

              {viewMode === "grid" ? (
                <div className={`grid gap-3 grid-cols-4 md:grid-cols-${gridColumns}`}>
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCardSimple key={product.id} product={product} onClick={() => handleProductClick(product)} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-card"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative w-24 h-24 shrink-0">
                        <Image
                          src={getPublicImageUrl(product.images[0]?.url) || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription}</p>
                        {product.price && <p className="text-lg font-bold mt-2">¥{product.price.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredAndSortedProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">条件に一致する商品が見つかりません</p>
              )}
            </section>
          )}

          {/* ===========================
              レシピセクション: デスクセットアップ
              ========================== */}
          {recipes.length > 0 && (
            <section id="recipes" className="mb-16 scroll-mt-20">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-center">Recipe</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 text-center">
                実際のデスク環境と使用アイテムを紹介します
              </p>

              <div className="space-y-12">
                {recipes.map((recipe, index) => {
                  const pins = db.recipePins.getByRecipeId(recipe.id)
                  if (!recipe.imageDataUrl) return null

                  const linkedProductIds = [...new Set(pins.map((pin: any) => pin.productId).filter(Boolean))]
                  const linkedProducts = products.filter((p) => linkedProductIds.includes(p.id))

                  console.log("[v0] Recipe:", recipe.id, "Pins count:", pins.length)

                  const isEvenIndex = index % 2 === 0
                  const imageFirst = isEvenIndex

                  return (
                    <div
                      key={recipe.id}
                      className="
                        p-3 md:p-6 
                        bg-card 
                        shadow-md
                        rounded-t-md          /* 上だけ角丸 */
                        rounded-b-md        /* 下は角丸なし */
                        bg-linear-to-b      /* 上 → 下へグラデーション */
                        from-card             /* 上は元の背景色 */
                        to-transparent        /* 下は透明 */
                      "
                    >
                      <h3 className="font-heading text-xl sm:text-2xl font-semibold mb-6 text-center">
                        {recipe.title}
                      </h3>

                      {/* スマホ: 縦並び、PC: 左右分割 */}
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start bg-transparent">
                        {/* レシピ画像エリア */}
                        <div className={`w-full md:w-1/2 ${imageFirst ? "md:order-1" : "md:order-2"}`}>
                          <RecipeDisplay
                            recipeId={recipe.id}
                            recipeTitle={recipe.title}
                            imageDataUrl={recipe.imageDataUrl}
                            imageUrl={recipe.imageUrl}
                            imageWidth={recipe.imageWidth}
                            imageHeight={recipe.imageHeight}
                            pins={pins}
                            products={products}
                            onProductClick={handleProductClick}
                          />
                        </div>

                        {/* 使用アイテムエリア */}
                        <div className={`w-full bg-transparent md:w-1/2 ${imageFirst ? "md:order-2" : "md:order-1"}`}>
                          {linkedProducts.length > 0 && (
                            <div>
                              <h4 className="font-heading text-base sm:text-lg font-semibold mb-4 text-center md:text-left">
                                使用アイテム
                              </h4>
                              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 gap-3">
                                {linkedProducts.map((product) => (
                                  <ProductCardSimple
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* プロフィールセクション */}
          <section id="profile" className="mb-16 scroll-mt-20">
            {user && <ProfileCard user={user} />}
          </section>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 {user?.displayName || "User"}. All rights reserved.</p>
        </div>
      </footer>

      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
