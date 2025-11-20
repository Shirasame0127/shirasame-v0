"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Camera, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from "react"
import { db } from "@/lib/db/storage"
import { auth } from "@/lib/auth"
import type { Product, Recipe } from "@/lib/db/schema"

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Dashboard: Loading data from DB")
    const currentUser = auth.getCurrentUser()
    
    if (!currentUser) {
      console.error("[v0] Dashboard: No user logged in")
      setIsLoading(false)
      return
    }

    try {
      const loadedProducts = db.products.getAll(currentUser.id)
      const loadedRecipes = db.recipes.getAll(currentUser.id)

      console.log("[v0] Dashboard: Products loaded:", loadedProducts.length)
      console.log("[v0] Dashboard: Recipes loaded:", loadedRecipes.length)

      setProducts(loadedProducts)
      setRecipes(loadedRecipes)
    } catch (error) {
      console.error("[v0] Dashboard: Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">ダッシュボード</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              公開ページ
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  const stats = [
    {
      title: "商品数",
      value: products.length,
      icon: Package,
      description: `${products.filter((p) => p.published).length}件公開中`,
      link: "/admin/products",
    },
    {
      title: "レシピ数",
      value: recipes.length,
      icon: Camera,
      description: "デスクセットアップ",
      link: "/admin/recipes",
    },
    {
      title: "総閲覧数",
      value: "1,234",
      icon: Eye,
      description: "今月の合計",
    },
    {
      title: "クリック数",
      value: "567",
      icon: TrendingUp,
      description: "アフィリエイトリンク",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">ダッシュボード</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            公開ページ
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const content = (
            <Card key={stat.title} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground">{stat.title}</div>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )

          return stat.link ? (
            <Link key={stat.title} href={stat.link}>
              {content}
            </Link>
          ) : (
            content
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
          <Link href="/admin/products/new" className="flex flex-col items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-sm">商品を追加</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
          <Link href="/admin/recipes/new" className="flex flex-col items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-sm">レシピを作成</span>
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">最近の活動</h3>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products">
                全て見る
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
        <CardContent>
          <div className="space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(product.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">まだ商品が登録されていません</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
