"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DndContext, PointerSensor, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { db } from "@/lib/db/storage"
import { ProductCard } from "@/components/product-card"
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Collection } from "@/types/collection" // Declare the Collection variable
import { useToast } from "@/hooks/use-toast"

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [manageProductsDialogOpen, setManageProductsDialogOpen] = useState(false)
  const [managingCollectionId, setManagingCollectionId] = useState<string | null>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [managingCollectionProductIds, setManagingCollectionProductIds] = useState<string[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "draft",
  })

  useEffect(() => {
    // Load from server API to ensure authoritative list
    ;(async () => {
      try {
        const res = await fetch('/api/admin/collections')
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const list = Array.isArray(json) ? json : json.data || []
        // apply saved order from localStorage if present
        try {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('collections-order') : null
          if (saved) {
            const ids: string[] = JSON.parse(saved || '[]')
            if (Array.isArray(ids) && ids.length > 0) {
              const map = new Map(list.map((c: any) => [c.id, c]))
              const ordered: any[] = []
              ids.forEach((id) => { if (map.has(id)) { ordered.push(map.get(id)); map.delete(id) } })
              // append any new items not in saved order
              for (const c of list) { if (!ids.includes(c.id)) ordered.push(c) }
              setCollections(ordered)
            } else {
              setCollections(list)
            }
          } else {
            setCollections(list)
          }
        } catch (e) {
          setCollections(list)
        }

        // Inspect each collection for actual existing item counts
        try {
          const inspections = await Promise.all(list.map(async (c: any) => {
            try {
              const r = await fetch(`/api/admin/collections/${encodeURIComponent(c.id)}/inspect`)
              if (!r.ok) return null
              const j = await r.json().catch(() => null)
              return { id: c.id, inspect: j?.data || null }
            } catch (e) {
              return null
            }
          }))

          const inspectMap = new Map<string, any>()
          inspections.forEach((it: any) => { if (it && it.id) inspectMap.set(it.id, it.inspect) })
          if (inspectMap.size > 0) {
            setCollections((prev) => prev.map((c) => ({ ...c, inspect: inspectMap.get(c.id) || null })))
          }
        } catch (e) {
          console.warn('collection inspect failed', e)
        }
      } catch (e) {
        console.warn('failed to load collections', e)
        // fallback to in-memory cache if available
        setCollections(db.collections.getAll())
      }
    })()
  }, [])

  const openCreateDialog = () => {
    setIsCreating(true)
    setEditingCollection(null)
    setFormData({ title: "", description: "", visibility: "public" })
    setDialogOpen(true)
  }

  const openEditDialog = (collection: Collection) => {
    setIsCreating(false)
    setEditingCollection(collection)
    setFormData({
      title: collection.title,
      description: collection.description || "",
      visibility: collection.visibility,
    })
    setDialogOpen(true)
  }

  const openManageProductsDialog = (collectionId: string) => {
    setManagingCollectionId(collectionId)
    // fetch products and collection items for this collection
    ;(async () => {
      try {
        const [prodRes, itemsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch(`/api/admin/collections/${encodeURIComponent(collectionId)}/items`),
        ])

        const prodJson = await prodRes.json().catch(() => ({ data: [] }))
        const itemsJson = await itemsRes.json().catch(() => ({ data: [] }))

        const prods = Array.isArray(prodJson) ? prodJson : prodJson.data || []
        const items = Array.isArray(itemsJson) ? itemsJson : itemsJson.data || []

        setProductsList(prods)
        setManagingCollectionProductIds(items.map((it: any) => it.productId))
      } catch (e) {
        console.error('failed to load products or collection items', e)
        // fallback to in-memory
        setProductsList(db.products.getAll())
        setManagingCollectionProductIds(db.collectionItems.getByCollectionId(collectionId).map((i: any) => i.productId))
      }
    })()

    setManageProductsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タイトルを入力してください"
      })
      return
    }

    if (isCreating) {
      try {
        const payload = {
          title: formData.title,
          description: formData.description,
          visibility: formData.visibility,
        }
        const res = await fetch('/api/admin/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const created = json.data || json
        setCollections((prev) => [...prev, created])
        toast({ title: '作成完了', description: 'コレクションを作成しました' })
      } catch (e) {
        console.error('create collection failed', e)
        toast({ variant: 'destructive', title: '作成失敗', description: 'コレクションの作成に失敗しました' })
      }
    } else if (editingCollection) {
      try {
        const res = await fetch(`/api/admin/collections/${encodeURIComponent(editingCollection.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formData.title, description: formData.description, visibility: formData.visibility }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          console.error('update failed', json)
          const msg = json?.error || json?.message || 'コレクションの更新に失敗しました'
          toast({ variant: 'destructive', title: '更新失敗', description: String(msg) })
          return
        }

        const updated = json.data || json
        setCollections((cols) => cols.map((col) => (col.id === editingCollection.id ? { ...col, ...updated } : col)))
        toast({ title: '更新完了', description: 'コレクションを更新しました' })
      } catch (e: any) {
        console.error('update failed', e)
        toast({ variant: 'destructive', title: '更新失敗', description: String(e?.message || e) })
      }
    }

    setDialogOpen(false)
  }

  const handleDelete = (collectionId: string) => {
    toast({
      title: "削除の確認",
      description: "このコレクションを削除してもよろしいですか？",
      action: (
        <Button
          variant="destructive"
          size="sm"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/admin/collections/${encodeURIComponent(collectionId)}`, { method: 'DELETE' })
                  if (!res.ok) throw new Error('delete failed')
                  db.collections.delete(collectionId)
                  setCollections(collections.filter((col) => col.id !== collectionId))
                  toast({ title: '削除完了', description: 'コレクションを削除しました' })
                } catch (e) {
                  console.error('delete collection failed', e)
                  toast({ variant: 'destructive', title: '削除に失敗しました' })
                }
              }}
        >
          削除
        </Button>
      ),
    })
  }

  // SortableCard component for dnd-kit — provides handle support.
  function SortableCard({ id, children }: { id: string; children: (props: { attributes: any; listeners: any; isDragging: boolean }) => React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
    const style: any = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : undefined,
    }
    return (
      <div ref={setNodeRef} style={{ ...style, touchAction: 'none', userSelect: 'none' }}>
        {children({ attributes, listeners, isDragging })}
      </div>
    )
  }

  const handleAddProduct = (collectionId: string, productId: string) => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/collection-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionId, productId }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          console.error('add failed', json)
          toast({ variant: 'destructive', title: '追加失敗', description: json?.error || json?.message || '商品の追加に失敗しました' })
          return
        }

        setManagingCollectionProductIds((prev) => [...prev, productId])
        const itemCount = json?.data?.itemCount ?? json?.itemCount ?? null
        if (itemCount != null) {
          setCollections((prev) => prev.map((c) => c.id === collectionId ? ({ ...c, itemCount } as any) : c))
        } else {
          // fallback increment
          setCollections((prev) => prev.map((c) => c.id === collectionId
            ? ({ ...c, itemCount: ((c as any).itemCount ?? db.collectionItems.getByCollectionId(collectionId).length) + 1 } as any)
            : c
          ))
        }
        toast({ title: '追加完了', description: '商品を追加しました' })
      } catch (e) {
        console.error('add product to collection failed', e)
        toast({ variant: 'destructive', title: '追加失敗', description: '商品の追加に失敗しました' })
      }
    })()
  }

  const handleRemoveProduct = async (collectionId: string, productId: string) => {
    try {
      const res = await fetch('/api/admin/collection-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, productId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('delete failed', json)
        toast({ variant: 'destructive', title: '解除に失敗しました', description: json?.error || json?.message || '商品の解除に失敗しました' })
        return
      }

      setManagingCollectionProductIds((prev) => prev.filter((id) => id !== productId))
      const itemCount = json?.data?.itemCount ?? json?.itemCount ?? null
      if (itemCount != null) {
        setCollections((prev) => prev.map((c) => c.id === collectionId ? ({ ...c, itemCount } as any) : c))
      } else {
        // fallback decrement
        setCollections((prev) => prev.map((c) => c.id === collectionId
          ? ({ ...c, itemCount: Math.max(0, ((c as any).itemCount ?? db.collectionItems.getByCollectionId(collectionId).length) - 1) } as any)
          : c
        ))
      }
      toast({ title: '解除しました', description: '商品をコレクションから外しました' })
    } catch (e) {
      console.error('delete collection item failed', e)
      toast({ variant: 'destructive', title: '解除に失敗しました' })
    }
  }

  const getCollectionProducts = (collectionId: string) => {
    if (managingCollectionId === collectionId && productsList.length > 0) {
      return productsList.filter((p) => managingCollectionProductIds.includes(p.id))
    }
    // fallback to in-memory
    const items = db.collectionItems.getByCollectionId(collectionId) as any[]
    const products = db.products.getAll() as any[]
    return items
      .map((item: any) => products.find((p: any) => p.id === item.productId))
      .filter(Boolean)
  }

  const getAvailableProducts = (collectionId: string) => {
    if (managingCollectionId === collectionId && productsList.length > 0) {
      return productsList.filter((p) => !managingCollectionProductIds.includes(p.id))
    }
    const collectionProductIds = (db.collectionItems.getByCollectionId(collectionId) as any[])
      .map((item: any) => item.productId)
    return db.products.getAll().filter((p) => !collectionProductIds.includes(p.id))
  }

  const handleToggleVisibility = async (collectionId: string, toVisibility: "public" | "draft") => {
    // capture previous visibility to allow rollback
    const prevVis = (collections.find((c) => c.id === collectionId) as any)?.visibility || "draft"

    // optimistic UI update
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, visibility: toVisibility } : c)))

    try {
      const res = await fetch(`/api/admin/collections/${encodeURIComponent(collectionId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: toVisibility }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error || json?.message || 'failed')
      }

      const updated = json.data || json
      try {
        ;(db.collections as any).update?.(collectionId, updated)
      } catch (e) {
        // ignore if in-memory update fails
      }
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, ...updated } : c)))
      toast({ title: '更新完了', description: '公開状態を更新しました' })
    } catch (e) {
      console.error('toggle visibility failed', e)
      // rollback
      setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, visibility: prevVis } : c)))
      toast({ variant: 'destructive', title: '更新失敗', description: '公開状態の更新に失敗しました' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">コレクション管理</h1>
          <p className="text-muted-foreground">商品のグループを作成・管理</p>
        </div>
        <Button size="lg" className="gap-2" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          新規作成
        </Button>
      </div>

      <DndContext
        sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }))}
        onDragEnd={(e: DragEndEvent) => {
          const { active, over } = e
          if (!over) return
          if (active.id === over.id) return
          const oldIndex = collections.findIndex((c) => c.id === active.id)
          const newIndex = collections.findIndex((c) => c.id === over.id)
          if (oldIndex < 0 || newIndex < 0) return
          const next = arrayMove(collections, oldIndex, newIndex)
          setCollections(next)
          try {
            localStorage.setItem('collections-order', JSON.stringify(next.map((c) => c.id)))
          } catch (e) {}

          // try to persist order to server (best-effort)
          ;(async () => {
            try {
              await fetch('/api/admin/collections/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: next.map((c, i) => ({ id: c.id, order: i })) }),
              })
            } catch (err) {
              console.warn('collections reorder persist failed', err)
            }
          })()
        }}
      >
        <SortableContext items={collections.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="grid md:grid-cols-2 gap-6">
            {collections.map((collection) => {
          const itemCount = (collection as any).itemCount ?? db.collectionItems.getByCollectionId(collection.id).length
              return (
                <SortableCard key={collection.id} id={collection.id}>
                  {({ attributes, listeners }) => (
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="mb-2">{collection.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={collection.visibility === "public" ? "default" : "secondary"}>
                                {collection.visibility === "public" ? "公開" : "下書き"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{((collection as any).inspect?.existingCount ?? itemCount)}個のアイテム</span>
                              {((collection as any).inspect?.missingCount ?? 0) > 0 && (
                                <Badge variant="destructive" className="ml-2">欠損 { (collection as any).inspect.missingCount } 件</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={collection.visibility === "public"}
                              onCheckedChange={(checked) => handleToggleVisibility(collection.id, checked ? "public" : "draft")}
                            />
                            <button
                              {...attributes}
                              {...listeners}
                              type="button"
                              aria-label={`ドラッグ ${collection.id}`}
                              style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
                              className="h-6 w-6 rounded border bg-muted flex items-center justify-center text-xs ml-2"
                            >
                              ≡
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => openManageProductsDialog(collection.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            商品管理
                          </Button>
                          {((collection as any).inspect?.missingCount ?? 0) > 0 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-transparent"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/admin/collections/${encodeURIComponent(collection.id)}/sync`, { method: 'POST' })
                                  if (!res.ok) throw new Error('sync failed')
                                  const json = await res.json()
                                  const data = json.data || json
                                  // update local collection counts
                                  setCollections((prev) => prev.map((c) => c.id === collection.id ? { ...c, inspect: { totalCount: data.totalCount, existingCount: data.existingCount, missingCount: 0 } } : c))
                                  toast({ title: '同期完了', description: '欠損商品を削除しました' })
                                } catch (e) {
                                  console.error('sync failed', e)
                                  toast({ variant: 'destructive', title: '同期失敗', description: '欠損商品の同期に失敗しました' })
                                }
                              }}
                            >
                              同期
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(collection)}>
                            <Edit className="w-4 h-4 mr-1" />
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive bg-transparent"
                            onClick={() => handleDelete(collection.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </SortableCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "新規コレクション作成" : "コレクション編集"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "新しいコレクションを作成します" : "コレクション情報を編集します"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>タイトル *</Label>
              <Input
                placeholder="例: おすすめデスク周り"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea
                placeholder="コレクションの説明"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>公開する</Label>
              <Switch
                checked={formData.visibility === "public"}
                onCheckedChange={(checked) => setFormData({ ...formData, visibility: checked ? "public" : "draft" })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="w-4 h-4 mr-1" />
                キャンセル
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageProductsDialogOpen} onOpenChange={setManageProductsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>商品管理</DialogTitle>
            <DialogDescription>コレクションに含める商品を管理します</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            {managingCollectionId && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">含まれている商品</h3>
                  <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                    {getCollectionProducts(managingCollectionId).map((product: any) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} isAdminMode={true} />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveProduct(managingCollectionId, product.id)}
                        >
                          解除
                        </Button>
                      </div>
                    ))}
                    {getCollectionProducts(managingCollectionId).length === 0 && (
                      <p className="col-span-full text-center text-muted-foreground py-8">商品がありません</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">追加できる商品</h3>
                  <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                    {getAvailableProducts(managingCollectionId).map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} isAdminMode={true} />
                        <Button
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleAddProduct(managingCollectionId, product.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          追加
                        </Button>
                      </div>
                    ))}
                    {getAvailableProducts(managingCollectionId).length === 0 && (
                      <p className="col-span-full text-center text-muted-foreground py-8">
                        すべての商品が追加されています
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
