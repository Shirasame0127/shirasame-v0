"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductListItem } from "@/components/product-list-item"
import { db } from "@/lib/db/storage"
import type { Product } from "@/lib/mock-data/products"
import { Plus, Search, Filter, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low">("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    // ストレージから商品データを読み込む
    setProducts(db.products.getAll())
  }, [])

  // 全タグを取得
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    products.forEach((product) => {
      product.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [products])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearTags = () => setSelectedTags([])

  // フィルタリングとソート
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags.includes(tag))
      return matchesSearch && matchesTags
    })

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "price-high":
          return (b.price || 0) - (a.price || 0)
        case "price-low":
          return (a.price || 0) - (b.price || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchQuery, selectedTags, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">商品管理</h1>
          <p className="text-sm md:text-base text-muted-foreground">{filteredAndSortedProducts.length}件の商品</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/tags">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              タグ管理
            </Link>
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4" />
              新規追加
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 md:mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="商品を検索..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>タグで絞り込み</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearTags}>
                    クリア
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                並べ替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並べ替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <DropdownMenuRadioItem value="newest">新しい順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">古い順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high">価格が高い順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-low">価格が安い順</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">絞り込み中:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:bg-destructive/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">該当する商品が見つかりません</div>
        ) : (
          filteredAndSortedProducts.map((product) => <ProductListItem key={product.id} product={product} />)
        )}
      </div>
    </div>
  )
}
