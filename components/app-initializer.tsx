"use client"

import { useEffect } from "react"
import { db } from "@/lib/db/storage"
import { mockProducts } from "@/lib/mock-data/products"
import { mockRecipes, mockRecipeImages, mockRecipeItems } from "@/lib/mock-data/recipes"
import { mockCollections, mockCollectionItems } from "@/lib/mock-data/collections"
import { mockUser, mockAuthUser } from "@/lib/mock-data/users"

export function AppInitializer() {
  useEffect(() => {
    console.log("[v0] AppInitializer: Starting initialization")
    
    const USERS_STORAGE_KEY = 'auth_users'
    const existingUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    
    // shirasameユーザーがまだ登録されていない場合のみ追加
    if (!existingUsers.some((u: any) => u.email === mockAuthUser.email)) {
      existingUsers.push(mockAuthUser)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existingUsers))
      console.log("[v0] Initial user registered:", mockAuthUser.email)
    }
    
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
    console.log("[v0] All data is now associated with user:", mockAuthUser.username, `(${mockAuthUser.email})`)
  }, [])

  return null
}
