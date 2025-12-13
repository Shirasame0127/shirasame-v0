"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Camera, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import AdminLoading from '@/components/admin-loading'
import { usePathname } from 'next/navigation'
import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { auth } from "@/lib/auth"
import type { Product, Recipe } from "@/lib/db/schema"
import dynamic from 'next/dynamic'

const AdminSaleCalendar = dynamic(() => import('@/components/admin-sale-calendar'), { ssr: false })

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productCount, setProductCount] = useState<number | null>(null)

  const pathname = usePathname()

  const loadData = useCallback(async () => {
    console.log("[v0] Dashboard: Loading data from DB")
    setIsLoading(true)

    try {
      // Try to use minimal local mirror, but always refresh caches from server
      const currentUser = auth.getCurrentUser()

      // Refresh caches from server so we rely on server-side session (cookies)
      // Pass user id where possible to allow server-side filtering if implemented
      try {
        await db.products.refreshAdmin(currentUser?.id)
      } catch (e) {
        console.warn('[v0] products.refreshAdmin warning', e)
      }
      // Avoid proactively refreshing recipes here to prevent unnecessary
      // /api/recipes requests when users interact with dashboard controls
      // (e.g. clicking the products stat). Recipes will be refreshed on the
      // dedicated recipes page or when explicitly requested.

      // Determine owner/user scope: prefer explicit signed-in user, else fallback to cached owner
      const userId = currentUser?.id || (db.user.get() as any)?.id || undefined

      const loadedProducts = db.products.getAll(userId)
      const loadedRecipes = db.recipes.getAll(userId)

      // Fetch authoritative product count for dashboard (admin API)
      try {
        const cntRes = await apiFetch('/api/admin/products?count=true&limit=0')
        if (cntRes && cntRes.ok) {
          const cntJson = await cntRes.json().catch(() => null)
          const total = cntJson?.meta?.total ?? (Array.isArray(cntJson?.data) ? cntJson.data.length : null)
          setProductCount(typeof total === 'number' ? total : loadedProducts.length)
        } else {
          setProductCount(loadedProducts.length)
        }
      } catch (e) {
        console.warn('[v0] failed to fetch product count', e)
        setProductCount(loadedProducts.length)
      }

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

  useEffect(() => {
    // Load when component mounts or when route changes to /admin
    if (pathname && pathname.startsWith('/admin')) {
      loadData()
    }

    // Refresh when window/tab gains focus or becomes visible
    const onFocus = () => {
      console.log('[v0] Dashboard: window focus - refreshing data')
      loadData()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('[v0] Dashboard: visibility visible - refreshing data')
        loadData()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pathname, loadData])

  if (isLoading) {
    return <AdminLoading />
  }

  const stats = [
    {
      title: "商品数",
      value: productCount ?? products.length,
      icon: Package,
      description: `${products.filter((p) => p.published).length}件公開中`,
      link: "/admin/products",
    },
    {
      title: "レシピ数",
      value: recipes.length,
      icon: Camera,
      // show published count similar to products
      description: `${recipes.filter((r) => r.published).length}件公開中`,
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
            <Link key={stat.title} href={stat.link} prefetch={false}>
              {content}
            </Link>
          ) : (
            content
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
          <Link href="/admin/products/new" prefetch={false} className="flex flex-col items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-sm">商品を追加</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
          <Link href="/admin/recipes/new" prefetch={false} className="flex flex-col items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-sm">レシピを作成</span>
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">セール管理カレンダー</h3>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/amazon-sales" prefetch={false}>
                全て見る
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
        <CardContent>
          <AdminSaleCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
