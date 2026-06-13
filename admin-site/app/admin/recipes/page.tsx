"use client"

import { useEffect, useState } from "react"
import AdminLoading from '@/components/admin-loading'
import { db } from "@/lib/db/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getPublicImageUrl } from "@/lib/image-url"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Eye, EyeOff, Camera, GripVertical, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import apiFetch from '@/lib/api-client'
import { RecipesService } from '@/lib/services/recipes.service'
import { useToast } from '@/hooks/use-toast'
import { confirm } from '@/components/ui/confirm'
import { StarMark } from '@/components/brand'
import { DndContext, PointerSensor, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Normalize recipe records coming from various sources (server, cache, legacy fields)
function parseJsonField(field: any) {
  if (!field) return []
  if (Array.isArray(field)) return field
  try {
    return JSON.parse(field)
  } catch (e) {
    return []
  }
}

function normalizeRecipe(r: any) {
  if (!r) return r
  const normalized: any = { ...r }
  // unify user id property name
  if (!normalized.userId && normalized.user_id) normalized.userId = normalized.user_id
  // parse JSON string fields
  normalized.images = parseJsonField(normalized.images)
  normalized.items = parseJsonField(normalized.items)


  // Map common snake_case DB columns to camelCase used by UI
  if (typeof normalized.base_image_id !== 'undefined' && typeof normalized.baseImageId === 'undefined') normalized.baseImageId = normalized.base_image_id
  if (typeof normalized.image_width !== 'undefined' && typeof normalized.imageWidth === 'undefined') normalized.imageWidth = normalized.image_width
  if (typeof normalized.image_height !== 'undefined' && typeof normalized.imageHeight === 'undefined') normalized.imageHeight = normalized.image_height
  if (typeof normalized.aspect_ratio !== 'undefined' && typeof normalized.aspectRatio === 'undefined') normalized.aspectRatio = normalized.aspect_ratio
  if (typeof normalized.created_at !== 'undefined' && typeof normalized.createdAt === 'undefined') normalized.createdAt = normalized.created_at
  if (typeof normalized.updated_at !== 'undefined' && typeof normalized.updatedAt === 'undefined') normalized.updatedAt = normalized.updated_at

  // Ensure canonical recipe_image_keys is exposed in both snake and camel forms
  try {
    const keys = Array.isArray(normalized.recipe_image_keys)
      ? normalized.recipe_image_keys
      : (Array.isArray(normalized.recipeImageKeys) ? normalized.recipeImageKeys : [])
    normalized.recipe_image_keys = keys
    normalized.recipeImageKeys = keys
  } catch (e) {
    normalized.recipe_image_keys = normalized.recipe_image_keys || []
    normalized.recipeImageKeys = normalized.recipeImageKeys || []
  }

  // Normalize images array entries: prefer key then url
  try {
    if (Array.isArray(normalized.images)) {
      normalized.images = normalized.images.map((img: any) => {
        if (!img) return img
        const out: any = { ...img }
        // unify possible key fields
        if (!out.key && out.key === undefined) {
          out.key = out.key || out.image_key || out.r2_key || null
        }
        // unify url
        out.url = out.url || out.imageUrl || out.image_url || out.src || null
        // if we have a key but no url, try to build public url
        if (out.key && !out.url) {
          try { out.url = getPublicImageUrl(out.key) || null } catch { out.url = null }
        }
        return out
      })
    }
  } catch (e) {}

  // legacy image/url compatibility: if main image key exists, expose imageUrl
  if (!normalized.imageUrl) {
    const mainKey = normalized.main_image_key || normalized.mainImageKey || (Array.isArray(normalized.recipe_image_keys) && normalized.recipe_image_keys[0]) || (Array.isArray(normalized.recipeImageKeys) && normalized.recipeImageKeys[0]) || normalized.primaryImageKey || null
    if (mainKey) {
      try { normalized.imageUrl = getPublicImageUrl(mainKey) || null } catch { normalized.imageUrl = null }
    }
  }
  // ensure booleans/defaults
  if (typeof normalized.published !== 'boolean') normalized.published = !!normalized.published
  normalized.title = normalized.title || "無題のレシピ"
  normalized.body = normalized.body || ""
  return normalized
}

function normalizeRecipes(list: any[]) {
  if (!Array.isArray(list)) return []
  return list.map(normalizeRecipe)
}
/**
 * レシピ管理ページ
 *
 * 【機能】
 * - レシピ一覧表示（公開/非公開ステータス表示）
 * - 新規作成ボタン
 * - 編集・削除・公開切り替え
 * - レシピ名のインライン編集
 */

export default function RecipesManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<any[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showNewModal, setShowNewModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadRecipes() }, [])

  function loadRecipes() {
    setStatus("loading")
    const me = getCurrentUser()
    const userId = me?.id

    if (userId) {
      db.recipes
        .refresh(userId)
        .then((fresh: any) => {
          const normalizedFresh = normalizeRecipes(fresh || [])
          const visible = (normalizedFresh || []).filter((r: any) => r?.userId === userId)
          setRecipes(visible)
          try {
            ;(visible || []).forEach((r: any) => { try { db.recipePins.refresh(r.id).catch(() => {}) } catch {} })
          } catch {}
          setStatus("ready")
        })
        .catch(() => { setRecipes([]); setStatus("error") })
      return
    }

    // No signed-in user: show whatever is cached (no fake sample data).
    setRecipes(normalizeRecipes(db.recipes.getAll() || []))
    setStatus("ready")
  }

  async function handleDelete(id: string, title?: string) {
    const ok = await confirm({
      title: 'レシピを削除しますか？',
      description: `「${title || '無題のレシピ'}」と関連するピンをすべて削除します。この操作は取り消せません。`,
      confirmText: '削除する',
    })
    if (!ok) return
    const prev = recipes
    setRecipes((cur) => cur.filter((r) => r.id !== id)) // optimistic
    try {
      const success = await RecipesService.delete(id)
      if (!success) throw new Error('failed')
      try { db.recipes.delete(id); db.recipePins.deleteByRecipeId(id) } catch {}
      toast({ title: '削除しました' })
      try { window.dispatchEvent(new Event('recipes:changed')) } catch {}
    } catch {
      setRecipes(prev) // roll back
      toast({ title: '削除に失敗しました', variant: 'destructive' })
    }
  }

  function togglePublish(recipe: any) {
    const id = recipe.id
    const newPublished = !recipe.published
    try { db.recipes.update(id, { published: newPublished }) } catch {}
    setRecipes((prev) => prev.map((r: any) => (r.id === id ? normalizeRecipe({ ...r, published: newPublished }) : r)))
    ;(async () => {
      try {
        const res = await apiFetch(`/api/admin/recipes/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: newPublished }) })
        const json = await res.json().catch(() => null)
        if (!res.ok) throw new Error('failed')
        const updated = json?.data || null
        if (updated) {
          try { db.recipes.update(id, updated) } catch {}
          setRecipes((prev) => prev.map((r: any) => (r.id === id ? normalizeRecipe({ ...r, ...updated }) : r)))
        }
        toast({ title: newPublished ? '公開しました' : '非公開にしました' })
        try { window.dispatchEvent(new Event('recipes:changed')) } catch {}
      } catch {
        try { db.recipes.update(id, { published: !newPublished }) } catch {}
        setRecipes((prev) => prev.map((r: any) => (r.id === id ? normalizeRecipe({ ...r, published: !newPublished }) : r)))
        toast({ title: '公開状態の更新に失敗しました', variant: 'destructive' })
      }
    })()
  }

  async function handleSaveTitle(recipeId: string) {
    const title = editTitle.trim()
    setEditingId(null)
    if (!title) return
    const current = recipes.find((r) => r.id === recipeId)
    if (current && current.title === title) return
    setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, title } : r))) // optimistic
    try {
      const updated = await RecipesService.update(recipeId, { title })
      if (!updated) throw new Error('failed')
      try { db.recipes.update(recipeId, { title }) } catch {}
      toast({ title: 'レシピ名を更新しました' })
    } catch {
      setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, title: current?.title } : r)))
      toast({ title: 'レシピ名の更新に失敗しました', variant: 'destructive' })
    }
  }

  function createNew() {
    setNewTitle("")
    setShowNewModal(true)
  }

  async function handleCreateRecipe() {
    const title = (newTitle || '').trim()
    if (!title) return
    setCreating(true)
    try {
      const res = await apiFetch('/api/admin/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.data?.id) {
        try { await db.recipes.refresh(json.data.user_id || json.data.userId || undefined) } catch {}
        setShowNewModal(false)
        router.push(`/admin/recipes/edit?id=${json.data.id}`)
        return
      }
      toast({ title: 'レシピの作成に失敗しました', variant: 'destructive' })
    } catch {
      toast({ title: 'レシピ作成中にエラーが発生しました', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(MouseSensor)
  )

  async function handleReorder(e: DragEndEvent) {
    const { active, over } = e
    if (!over || String(active.id) === String(over.id)) return
    const oldIndex = recipes.findIndex((r) => String(r.id) === String(active.id))
    const newIndex = recipes.findIndex((r) => String(r.id) === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const prev = recipes
    const next = arrayMove(recipes, oldIndex, newIndex)
    setRecipes(next)
    try {
      const res = await apiFetch('/api/admin/recipes/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map((r, i) => ({ id: r.id, order: i })) }),
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setRecipes(prev)
      toast({ title: '並び順の保存に失敗しました', variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono mb-2 flex items-center gap-2"><StarMark size={12} className="text-primary" /> Recipes</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">レシピ管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">{recipes.length}件のレシピ</p>
        </div>
        <Button onClick={createNew}><Plus className="h-4 w-4" />新規作成</Button>
      </div>

      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新しいレシピを作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">レシピ名</label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="例: 私のデスクセットアップ 2025"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateRecipe() }} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>キャンセル</Button>
            <Button onClick={handleCreateRecipe} disabled={creating || !newTitle.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {creating ? '作成中…' : '画像選択へ進む'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {status === "loading" ? (
        <AdminLoading />
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">レシピの読み込みに失敗しました</p>
          <Button variant="outline" size="sm" onClick={loadRecipes}>再読み込み</Button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <Camera className="h-10 w-10 text-muted-foreground/60" />
          <div>
            <p className="font-medium">レシピがまだありません</p>
            <p className="mt-1 text-sm text-muted-foreground">最初のレシピを作成しましょう。</p>
          </div>
          <Button onClick={createNew}><Plus className="h-4 w-4" />最初のレシピを作成</Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
          <SortableContext items={recipes.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <SortableRecipe key={recipe.id} id={recipe.id}>
                  {({ attributes, listeners }) => (
                    <Card className="group gap-0 overflow-hidden py-0 transition-colors hover:border-primary/30">
                      <CardContent className="p-3">
                        <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-muted">
                          {(() => {
                            try {
                              const keys = Array.isArray(recipe.recipe_image_keys) ? recipe.recipe_image_keys : (Array.isArray(recipe.recipeImageKeys) ? recipe.recipeImageKeys : [])
                              const firstKey = keys && keys.length > 0 ? keys[0] : null
                              const imgs = Array.isArray(recipe.images) ? recipe.images : []
                              const firstImg = imgs.length > 0 ? imgs[0] : null
                              const primaryCandidate = firstKey || (firstImg && (firstImg.key || firstImg.url || firstImg.imageUrl || firstImg.src)) || recipe.imageUrl || recipe.imageDataUrl || null
                              if (!primaryCandidate) return (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">画像未設定</div>)
                              if (typeof primaryCandidate === 'string' && primaryCandidate.startsWith('data:')) {
                                return (<img src={primaryCandidate} alt={recipe.title || 'レシピ画像'} className="h-full w-full object-cover" />)
                              }
                              const src = getPublicImageUrl(primaryCandidate) || primaryCandidate || '/placeholder.svg'
                              return (<img src={src} alt={recipe.title || 'レシピ画像'} className="h-full w-full object-cover" />)
                            } catch {
                              return (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">画像未設定</div>)
                            }
                          })()}
                          <div className="absolute right-2 top-2">
                            <Badge variant={recipe.published ? "default" : "secondary"} className={recipe.published ? "" : "text-muted-foreground"}>
                              {recipe.published ? "公開中" : "非公開"}
                            </Badge>
                          </div>
                          <button
                            {...attributes}
                            {...listeners}
                            aria-label="ドラッグして並べ替え"
                            className="absolute left-2 top-2 hidden h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md bg-background/80 text-muted-foreground backdrop-blur group-hover:flex active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>
                        {editingId === recipe.id ? (
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(recipe.id); if (e.key === 'Escape') setEditingId(null) }}
                            onBlur={() => handleSaveTitle(recipe.id)} className="mb-3 h-8 text-sm" autoFocus />
                        ) : (
                          <h3 className="mb-3 flex items-center gap-1 truncate text-sm font-medium" title="クリックして編集">
                            <button className="truncate text-left hover:text-primary" onClick={() => { setEditingId(recipe.id); setEditTitle(recipe.title || "") }}>
                              {recipe.title || "無題のレシピ"}
                            </button>
                            <Edit className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </h3>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/admin/recipes/edit?id=${recipe.id}`)} className="flex-1">
                            <Edit className="h-3 w-3" /> 編集
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => togglePublish(recipe)} title={recipe.published ? "非公開にする" : "公開する"}>
                            {recipe.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(recipe.id, recipe.title)} title="削除">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </SortableRecipe>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

// Sortable wrapper for recipe cards — exposes attributes/listeners to a handle.
function SortableRecipe({ id, children }: { id: string; children: (props: { attributes: any; listeners: any }) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: any = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined }
  return (
    <div ref={setNodeRef as any} style={style} className="w-full">
      {children({ attributes, listeners })}
    </div>
  )
}
