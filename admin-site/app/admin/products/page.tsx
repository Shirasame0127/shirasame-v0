"use client"

import { useState, useMemo, useEffect } from "react"
import { getCurrentUser } from '@/lib/auth'
import apiFetch from '@/lib/api-client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductListItem } from "@/components/product-list-item"
import type { Product } from "@/lib/db/schema"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "clicks" | "price-asc" | "price-desc">("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [openGroups, setOpenGroups] = useState<string[] | undefined>(undefined)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  useEffect(() => {
    // APIから商品データを読み込む（admin-site の API を使用）
    const fetchProducts = async () => {
      try {
        const current = getCurrentUser()
        if (!current || !current.id) {
          setProducts([])
          return
        }
        const res = await apiFetch(`/api/admin/products`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.products || []
        setProducts(list)
      } catch (error) {
        console.error(error)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [groupsRes, tagsRes] = await Promise.all([apiFetch('/api/tag-groups'), apiFetch('/api/tags')])
        const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
        const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
        const serverGroups = Array.isArray(groupsJson.data) ? groupsJson.data : groupsJson.data || []
        const serverTags = Array.isArray(tagsJson.data) ? tagsJson.data : tagsJson.data || []

        const groups: Record<string, string[]> = {}
        for (const g of serverGroups) {
          if (!g || !g.name) continue
          groups[g.name] = []
        }

        for (const t of serverTags) {
          const tagName = t.name
          const groupName = t.group || '未分類'
          if (!groups[groupName]) groups[groupName] = []
          if (!groups[groupName].includes(tagName)) groups[groupName].push(tagName)
        }

        if (Object.keys(groups).length === 0) {
          const derived: Record<string, string[]> = {}
          products.filter((p: any) => Array.isArray(p.tags)).forEach((p: any) => {
            p.tags.forEach((tag: string) => {
              const groupName = 'その他'
              if (!derived[groupName]) derived[groupName] = []
              if (!derived[groupName].includes(tag)) derived[groupName].push(tag)
            })
          })
          setTagGroups(derived)
        } else {
          setTagGroups(groups)
        }
      } catch (e) {
        const derived: Record<string, string[]> = {}
        products.filter((p: any) => Array.isArray(p.tags)).forEach((p: any) => {
          p.tags.forEach((tag: string) => {
            const groupName = 'その他'
            if (!derived[groupName]) derived[groupName] = []
            if (!derived[groupName].includes(tag)) derived[groupName].push(tag)
          })
        })
        setTagGroups(derived)
      }
    })()
  }, [products])

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

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q))
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags.includes(tag))
      return matchesSearch && matchesTags
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "clicks":
          const ac = (a as any).clicks ?? 0
          const bc = (b as any).clicks ?? 0
          if (ac !== bc) return bc - ac
          return 0
        case "price-asc":
          return (a.price || 0) - (b.price || 0)
        case "price-desc":
          return (b.price || 0) - (a.price || 0)
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

          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-4 pb-0 flex flex-col">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="text-base">タグで絞り込み</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {Object.keys(tagGroups).length === 0 ? (
                  <div className="text-sm text-muted-foreground">タグがありません</div>
                ) : (
                  <Accordion type="multiple" className="w-full" value={openGroups} onValueChange={(v) => setOpenGroups(Array.isArray(v) ? v : [v])}>
                    {Object.entries(tagGroups).map(([groupName, tags]) => (
                      <AccordionItem key={groupName} value={groupName}>
                        <AccordionTrigger className="text-sm py-2">
                          {groupName}
                          {selectedTags.some((t) => tags.includes(t)) && (
                            <Badge variant="secondary" className="ml-2">{selectedTags.filter((t) => tags.includes(t)).length}</Badge>
                          )}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer hover:scale-105 transition-transform text-[12px] px-2 py-0.5"
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
                )}

                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-4" onClick={clearTags}>
                    絞り込みを解除
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              並べ替え
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並べ替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <DropdownMenuRadioItem value="newest">新しい順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="clicks">クリック数順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-asc">価格が安い順</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-desc">価格が高い順</DropdownMenuRadioItem>
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
