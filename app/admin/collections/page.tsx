"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { db } from "@/lib/db/storage"
import { ProductCard } from "@/components/product-card"
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
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
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "draft",
  })

  useEffect(() => {
    setCollections(db.collections.getAll())
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
    setManageProductsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タイトルを入力してください"
      })
      return
    }

    if (isCreating) {
      const newCollection: Collection = {
        id: `col-${Date.now()}`,
        userId: "user-shirasame",
        title: formData.title,
        description: formData.description,
        productIds: [],
        visibility: formData.visibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.collections.create(newCollection)
      setCollections([...collections, newCollection])
      toast({
        title: "作成完了",
        description: "コレクションを作成しました"
      })
    } else if (editingCollection) {
      db.collections.update(editingCollection.id, formData)
      setCollections(collections.map((col) => (col.id === editingCollection.id ? { ...col, ...formData } : col)))
      toast({
        title: "更新完了",
        description: "コレクションを更新しました"
      })
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
          onClick={() => {
            db.collections.delete(collectionId)
            setCollections(collections.filter((col) => col.id !== collectionId))
            toast({
              title: "削除完了",
              description: "コレクションを削除しました"
            })
          }}
        >
          削除
        </Button>
      ),
    })
  }

  const handleAddProduct = (collectionId: string, productId: string) => {
    db.collectionItems.addProduct(collectionId, productId)
    toast({
      title: "追加完了",
      description: "商品を追加しました"
    })
  }

  const handleRemoveProduct = (collectionId: string, productId: string) => {
    toast({
      title: "削除の確認",
      description: "この商品をコレクションから削除してもよろしいですか？",
      action: (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            db.collectionItems.removeProduct(collectionId, productId)
            toast({
              title: "削除完了",
              description: "商品を削除しました"
            })
          }}
        >
          削除
        </Button>
      ),
    })
  }

  const getCollectionProducts = (collectionId: string) => {
    const items = db.collectionItems.getByCollectionId(collectionId)
    const products = db.products.getAll()
    return items.map((item) => products.find((p) => p.id === item.productId)).filter(Boolean)
  }

  const getAvailableProducts = (collectionId: string) => {
    const collectionProductIds = db.collectionItems.getByCollectionId(collectionId).map((item) => item.productId)
    return db.products.getAll().filter((p) => !collectionProductIds.includes(p.id))
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

      <div className="grid md:grid-cols-2 gap-6">
        {collections.map((collection) => {
          const itemCount = db.collectionItems.getByCollectionId(collection.id).length

          return (
            <Card key={collection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2">{collection.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={collection.visibility === "public" ? "default" : "secondary"}>
                        {collection.visibility === "public" ? "公開" : "下書き"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{itemCount}個のアイテム</span>
                    </div>
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
          )
        })}
      </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCollectionProducts(managingCollectionId).map((product: any) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} isAdminMode={true} />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveProduct(managingCollectionId, product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
