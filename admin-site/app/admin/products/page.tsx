"use client"

import { useState, useMemo, useEffect } from "react"
import { getCurrentUser } from '@/lib/auth'
import apiFetch from '@/lib/api-client'
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, PointerSensor, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { ProductListItem } from "@/components/product-list-item"
import type { Product } from "@/lib/db/schema"
import { Plus, Search, Filter, SlidersHorizontal, X, GripVertical, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { StarMark } from "@/components/brand"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type SortKey = "manual" | "newest" | "clicks" | "price-asc" | "price-desc"

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [openGroups, setOpenGroups] = useState<string[] | undefined>(undefined)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  const fetchProducts = async () => {
    setStatus("loading")
    try {
      const current = getCurrentUser()
      if (!current || !current.id) { setProducts([]); setStatus("ready"); return }
      const res = await apiFetch(`/api/admin/products`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json().catch(() => null)
      let list: any[] = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data?.data)) list = data.data
      else if (Array.isArray((data as any)?.products)) list = (data as any).products
      setProducts(list)
      setStatus("ready")
    } catch (error) {
      console.error(error)
      setStatus("error")
    }
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const [groupsRes, tagsRes] = await Promise.all([apiFetch('/api/tag-groups'), apiFetch('/api/tags')])
        const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
        const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
        const serverGroups = Array.isArray(groupsJson.data) ? groupsJson.data : groupsJson.data || []
        const serverTags = Array.isArray(tagsJson.data) ? tagsJson.data : tagsJson.data || []
        const groups: Record<string, string[]> = {}
        for (const g of serverGroups) { if (g?.name) groups[g.name] = [] }
        for (const t of serverTags) {
          const groupName = t.group || '未分類'
          if (!groups[groupName]) groups[groupName] = []
          if (!groups[groupName].includes(t.name)) groups[groupName].push(t.name)
        }
        setTagGroups(groups)
      } catch {
        setTagGroups({})
      }
    })()
  }, [])

  const toggleTag = (tag: string) => setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  const clearTags = () => setSelectedTags([])

  const isFiltering = searchQuery.trim().length > 0 || selectedTags.length > 0
  const dragEnabled = sortBy === "manual" && !isFiltering

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = (products || []).filter((product) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || product.title.toLowerCase().includes(q) || (product.shortDescription && product.shortDescription.toLowerCase().includes(q))
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => Array.isArray(product?.tags) && product.tags.includes(tag))
      return matchesSearch && matchesTags
    })
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "manual": return 0
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "clicks": return (((b as any).clicks ?? 0) - ((a as any).clicks ?? 0))
        case "price-asc": return (a.price || 0) - (b.price || 0)
        case "price-desc": return (b.price || 0) - (a.price || 0)
        default: return 0
      }
    })
    return sorted
  }, [products, searchQuery, selectedTags, sortBy])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(MouseSensor),
  )

  const handleProductsDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || String(active.id) === String(over.id)) return
    const oldIndex = products.findIndex((p) => String(p.id) === String(active.id))
    const newIndex = products.findIndex((p) => String(p.id) === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const prevOrder = products
    const next = arrayMove(products, oldIndex, newIndex)
    setProducts(next)
    try {
      const res = await apiFetch('/api/admin/products/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map((p, i) => ({ id: p.id, order: i })) }),
      })
      if (!res.ok) throw new Error('reorder failed')
    } catch {
      setProducts(prevOrder) // roll back
      toast({ title: '並び順の保存に失敗しました', variant: 'destructive' })
    }
  }

  const sortLabels: Record<SortKey, string> = {
    manual: "手動（ドラッグ並べ替え）", newest: "新しい順", clicks: "クリック数順",
    "price-asc": "価格が安い順", "price-desc": "価格が高い順",
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono mb-2 flex items-center gap-2"><StarMark size={12} className="text-primary" /> Products</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">商品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filteredAndSortedProducts.length}件の商品</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/tags" prefetch={false}><SlidersHorizontal className="h-4 w-4" />タグ管理</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/products/new" prefetch={false}><Plus className="h-4 w-4" />新規追加</Link>
          </Button>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-4 mb-4 space-y-3 bg-background/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="商品を検索..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="絞り込み" className={selectedTags.length > 0 ? "border-primary text-primary" : ""}>
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex h-auto max-h-[80vh] flex-col rounded-t-2xl px-4 pb-0">
              <SheetHeader className="flex flex-row items-center justify-between border-b pb-2">
                <SheetTitle className="text-base">タグで絞り込み</SheetTitle>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearTags}>絞り込みを解除</Button>
                )}
              </SheetHeader>
              <div className="border-b py-3">
                <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border px-2 py-2">
                  {selectedTags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">選択中のタグはありません</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => toggleTag(tag)} aria-label={`${tag}を解除`} className="rounded-full p-0.5 hover:bg-destructive/20">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                {Object.keys(tagGroups).length === 0 ? (
                  <div className="text-sm text-muted-foreground">タグがありません</div>
                ) : (
                  <Accordion type="multiple" className="w-full" value={openGroups} onValueChange={(v) => setOpenGroups(Array.isArray(v) ? v : [v])}>
                    {Object.entries(tagGroups).filter(([, tags]) => Array.isArray(tags) && tags.length > 0).map(([groupName, tags]) => (
                      <AccordionItem key={groupName} value={groupName}>
                        <AccordionTrigger className="py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{groupName}</span>
                            <Badge variant="outline" className="text-[11px]">{tags.length}</Badge>
                            {selectedTags.some((t) => tags.includes(t)) && (
                              <Badge variant="default" className="text-[11px]">{selectedTags.filter((t) => tags.includes(t)).length}</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer text-[12px] transition-colors" onClick={() => toggleTag(tag)}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="並べ替え"><SlidersHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並べ替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <DropdownMenuRadioItem key={k} value={k}>{sortLabels[k]}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">絞り込み中:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => toggleTag(tag)} className="rounded-full p-0.5 hover:bg-destructive/20"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
        {sortBy === "manual" && isFiltering && (
          <p className="text-xs text-muted-foreground">検索・絞り込み中は並べ替えできません。解除すると有効になります。</p>
        )}
      </div>

      {status === "loading" ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/40" />)}
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">商品の読み込みに失敗しました</p>
          <Button variant="outline" size="sm" onClick={fetchProducts}>再読み込み</Button>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        isFiltering ? (
          <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">該当する商品が見つかりません</div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/60" />
            <div>
              <p className="font-medium">まだ商品がありません</p>
              <p className="mt-1 text-sm text-muted-foreground">最初の商品を登録しましょう。</p>
            </div>
            <Button asChild><Link href="/admin/products/new" prefetch={false}><Plus className="h-4 w-4" />商品を追加</Link></Button>
          </div>
        )
      ) : dragEnabled ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductsDragEnd}>
          <SortableContext items={filteredAndSortedProducts.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="space-y-3">
              {filteredAndSortedProducts.map((product) => (
                <SortableProductRow key={product.id} id={product.id}>
                  <ProductListItem product={product} onDeleted={() => setProducts((prev) => prev.filter((x) => x.id !== product.id))} />
                </SortableProductRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedProducts.map((product) => (
            <ProductListItem key={product.id} product={product} onDeleted={() => setProducts((prev) => prev.filter((x) => x.id !== product.id))} />
          ))}
        </div>
      )}
    </div>
  )
}

function SortableProductRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: any = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined }
  return (
    <div ref={setNodeRef as any} style={style} className="flex items-stretch gap-2">
      <button
        {...attributes}
        {...listeners}
        aria-label="ドラッグして並べ替え"
        className="flex w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
