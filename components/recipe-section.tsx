"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/db/storage"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { getPublicImageUrl } from "@/lib/image-url"
import { ProductDetailModal } from "./product-detail-modal"

/**
 * 公開ページのレシピセクション
 * 
 * 機能：
 * - 公開中のレシピ一覧表示
 * - ピンクリックで商品詳細モーダル表示
 */

export function RecipeSection() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [allPins, setAllPins] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const recipesData = await db.recipes.getAll()
    const publishedRecipes = recipesData.filter((r: any) => r.published)
    setRecipes(publishedRecipes)

    const productsData = await db.products.getAll()
    setProducts(productsData)

    const pinsData: any[] = []
    for (const recipe of publishedRecipes) {
      const pins = await db.recipePins.getByRecipeId(recipe.id)
      pinsData.push(...pins)
    }
    setAllPins(pinsData)
  }

  function handlePinClick(productId: string) {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product)
    }
  }

  if (recipes.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => {
          const recipePins = allPins.filter(p => p.recipeId === recipe.id)

          return (
            <Card key={recipe.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">{recipe.title}</h3>
                
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {recipe.imageUrl && (
                    <Image
                      src={getPublicImageUrl(recipe.imageUrl) || "/placeholder.svg"}
                      alt={recipe.title}
                      fill
                      className="object-contain"
                    />
                  )}

                  {/* ピン表示 */}
                  {recipePins.map((pin: any) => {
                    const product = products.find(p => p.id === pin.productId)
                    if (!product) return null

                    return (
                      <div
                        key={pin.id}
                        className="absolute cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          left: `${pin.xPercent}%`,
                          top: `${pin.yPercent}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => handlePinClick(pin.productId)}
                      >
                        {/* ピン（点） */}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pin.pinColor }}
                        />

                        {/* 線とテキスト */}
                        <div
                          className="absolute left-full top-1/2 flex items-center pointer-events-none"
                          style={{ transform: "translateY(-50%)" }}
                        >
                          <div
                            className="h-px"
                            style={{
                              width: "30px",
                              backgroundColor: pin.lineColor,
                            }}
                          />
                          <div
                            className="whitespace-nowrap px-2 py-1 rounded"
                            style={{
                              fontSize: `${pin.fontSize}%`,
                              fontWeight: pin.fontWeight,
                              color: pin.pinColor,
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                            }}
                          >
                            {pin.labelText}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 紐づいている商品一覧 */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">使用している商品</p>
                  <div className="flex flex-wrap gap-2">
                    {recipePins.map((pin: any) => {
                      const product = products.find(p => p.id === pin.productId)
                      if (!product) return null

                      return (
                        <button
                          key={pin.id}
                          onClick={() => handlePinClick(pin.productId)}
                          className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors"
                        >
                          {product.title}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 商品詳細モーダル */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
