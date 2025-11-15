"use client"

import { useEffect } from "react"
import { db } from "@/lib/db/storage"
import { mockProducts } from "@/lib/mock-data/products"
import { mockRecipes, mockRecipeImages, mockRecipeItems } from "@/lib/mock-data/recipes"
import { mockCollections, mockCollectionItems } from "@/lib/mock-data/collections"
import { mockUser } from "@/lib/mock-data/users"

export function AppInitializer() {
  useEffect(() => {
    console.log("[v0] AppInitializer: Starting initialization")
    // 初回ロード時にモックデータをストレージに保存
    db.initialize({
      products: mockProducts,
      recipes: mockRecipes,
      recipeImages: mockRecipeImages,
      recipeItems: mockRecipeItems,
      collections: mockCollections,
      collectionItems: mockCollectionItems,
      user: mockUser,
    })
    console.log("[v0] AppInitializer: Initialization complete")
  }, [])

  return null
}
