"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Camera, Layout, Plus, ArrowRight, ExternalLink } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import AdminLoading from '@/components/admin-loading'
import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { RecipesService } from '@/lib/services/recipes.service'
import { auth } from "@/lib/auth"
import { StarMark } from "@/components/brand"
import dynamic from 'next/dynamic'

const AdminSaleCalendar = dynamic(() => import('@/components/admin-sale-calendar'), { ssr: false })

type Counts = { total: number | null; published: number | null }

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Counts>({ total: null, published: null })
  const [recipes, setRecipes] = useState<Counts>({ total: null, published: null })
  const [collections, setCollections] = useState<Counts>({ total: null, published: null })

  const loadData = useCallback(async (opts?: { background?: boolean }) => {
    if (!opts?.background) setIsLoading(true)
    const currentUser = auth.getCurrentUser()
    const userId = currentUser?.id || (db.user.get() as any)?.id || undefined

    try { await db.products.refreshAdmin(currentUser?.id) } catch {}
    try { await (db.collections as any)?.refreshAdmin?.(currentUser?.id) } catch {}

    const localProducts = db.products.getAll(userId)
    const localRecipes = db.recipes.getAll(userId)
    const localCollections = db.collections.getAll(userId)

    // Run authoritative count fetches in parallel; fall back to local mirror.
    const [prodRes, collRes, recipeCounts] = await Promise.allSettled([
      apiFetch('/api/admin/products?count=true&limit=0').then((r) => (r.ok ? r.json() : null)),
      apiFetch('/api/admin/collections/counts').then((r) => (r.ok ? r.json() : null)),
      RecipesService.getCounts(),
    ])

    if (prodRes.status === 'fulfilled' && prodRes.value) {
      const j = prodRes.value
      const total = j?.meta?.total ?? (Array.isArray(j?.data) ? j.data.length : null)
      setProducts({
        total: typeof total === 'number' ? total : localProducts.length,
        published: typeof j?.meta?.publishedTotal === 'number' ? j.meta.publishedTotal : localProducts.filter((p) => p.published).length,
      })
    } else {
      setProducts({ total: localProducts.length, published: localProducts.filter((p) => p.published).length })
    }

    if (collRes.status === 'fulfilled' && collRes.value) {
      const d = collRes.value?.data
      setCollections({
        total: typeof d?.totalCount === 'number' ? d.totalCount : localCollections.length,
        published: typeof d?.publicCount === 'number' ? d.publicCount : localCollections.filter((c: any) => c.visibility === 'public').length,
      })
    } else {
      setCollections({ total: localCollections.length, published: localCollections.filter((c: any) => c.visibility === 'public').length })
    }

    if (recipeCounts.status === 'fulfilled') {
      const c = recipeCounts.value
      setRecipes({
        total: typeof c.total === 'number' ? c.total : localRecipes.length,
        published: typeof c.published === 'number' ? c.published : localRecipes.filter((r) => r.published).length,
      })
    } else {
      setRecipes({ total: localRecipes.length, published: localRecipes.filter((r) => r.published).length })
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    // Refresh in the background (no full-screen spinner) when the tab regains focus.
    const onFocus = () => loadData({ background: true })
    const onVisibility = () => { if (document.visibilityState === 'visible') loadData({ background: true }) }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    const onRecipesChanged = () => loadData({ background: true })
    window.addEventListener('recipes:changed', onRecipesChanged)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('recipes:changed', onRecipesChanged)
    }
  }, [loadData])

  if (isLoading) return <AdminLoading />

  const stats = [
    { title: "商品", value: products.total, sub: products.published, icon: Package, link: "/admin/products" },
    { title: "レシピ", value: recipes.total, sub: recipes.published, icon: Camera, link: "/admin/recipes" },
    { title: "コレクション", value: collections.total, sub: collections.published, icon: Layout, link: "/admin/collections" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="label-mono mb-2 flex items-center gap-2">
            <StarMark size={12} className="text-primary" /> Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">ダッシュボード</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            公開ページ
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.link} prefetch={false} className="group">
              <Card className="h-full gap-0 py-0 transition-colors hover:border-primary/40">
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="label-mono">{stat.title}</p>
                    <p className="num-display mt-3 text-4xl leading-none text-foreground">
                      {stat.value ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {stat.sub ?? 0}件公開中
                    </p>
                  </div>
                  <span className="rounded-md border bg-muted/40 p-2 text-muted-foreground transition-colors group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4">
          <Link href="/admin/products/new" prefetch={false}>
            <Plus className="h-5 w-5 text-primary" />
            <span>商品を追加</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4">
          <Link href="/admin/recipes/new" prefetch={false}>
            <Plus className="h-5 w-5 text-primary" />
            <span>レシピを作成</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4">
          <Link href="/admin/collections" prefetch={false}>
            <Layout className="h-5 w-5 text-primary" />
            <span>コレクション管理</span>
          </Link>
        </Button>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <StarMark size={14} className="text-primary" />
            セール管理カレンダー
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/amazon-sales" prefetch={false} className="gap-1">
              全て見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardContent className="p-4 md:p-5">
          <AdminSaleCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
