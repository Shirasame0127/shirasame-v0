"use client"

import { useEffect, useState } from "react"
import AdminLoading from '@/components/admin-loading'
import { db } from "@/lib/db/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getPublicImageUrl } from "@/lib/image-url"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import apiFetch from '@/lib/api-client'

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
    const mainKey = normalized.main_image_key || normalized.mainImageKey || (Array.isArray(normalized.recipe_image_keys) && normalized.recipe_image_keys[0]) || null
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
  // recipePins: defer per-recipe refresh after recipes are loaded
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showNewModal, setShowNewModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadRecipes()
  }, [])

  function loadRecipes() {
    setLoading(true)
    const me = getCurrentUser()
    const userId = me?.id

    // If we have a signed-in user, always refresh from server to ensure we
    // show that user's recipes (avoid stale cache containing other users')
    if (userId) {
      db.recipes
        .refresh(userId)
        .then((fresh: any) => {
          const normalizedFresh = normalizeRecipes(fresh || [])
          console.log("[v0] Refreshed recipes from server:", normalizedFresh.length)
          const visible = (normalizedFresh || []).filter((r: any) => r?.userId === userId)
          setRecipes(visible)
          // Refresh recipe pins for the user's recipes
          try {
            ;(visible || []).forEach((r: any) => {
              try { db.recipePins.refresh(r.id).catch(() => {}) } catch (e) {}
            })
          } catch (e) {}
        })
        .catch((e) => {
          console.warn('[v0] recipes.refresh failed', e)
          setRecipes([])
        })
        .finally(() => setLoading(false))
      return
    }

    // No signed-in user: fall back to cache or local sample data
    const data = db.recipes.getAll()
    const normalized = normalizeRecipes(data || [])
    console.log("[v0] Loaded recipes (no user):", normalized.length)
    if ((normalized || []).length === 0) {
      const fallback = [{
        idx: 0,
        id: 'recipe-1764910964954',
        user_id: '7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4',
        title: 'テストデータ',
        base_image_id: null,
        image_data_url: null,
        image_width: null,
        image_height: null,
        aspect_ratio: null,
        pins: null,
        published: false,
        created_at: '2025-12-05 05:03:22.029+00',
        updated_at: '2025-12-05 07:58:44.851+00',
        body: null,
        slug: null,
        images: '[]',
        items: '[]'
      }]
      setRecipes(normalizeRecipes(fallback))
    } else {
      setRecipes(normalized)
    }
    setLoading(false)
  }

  function handleDelete(id: string) {
    if (!confirm("このレシピを削除しますか？関連するピンもすべて削除されます。")) return
    
    db.recipes.delete(id)
    db.recipePins.deleteByRecipeId(id)
    console.log("[v0] Deleted recipe:", id)
    
    loadRecipes()
  }

  function togglePublish(recipe: any) {
    db.recipes.update(recipe.id, { 
      published: !recipe.published
    })
    console.log("[v0] Toggled publish status:", recipe.id, !recipe.published)
    loadRecipes()
  }

  function handleSaveTitle(recipeId: string) {
    if (editTitle.trim()) {
      db.recipes.update(recipeId, { title: editTitle.trim() })
      console.log("[v0] Updated recipe title:", recipeId, editTitle)
      loadRecipes()
    }
    setEditingId(null)
  }

  function createNew() {
    // Open modal to accept a title (server will persist)
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
      if (res.ok && json && json.data && json.data.id) {
        // refresh local cache and navigate to edit page
        try { await db.recipes.refresh(json.data.user_id || json.data.userId || undefined) } catch (e) {}
        setShowNewModal(false)
        router.push(`/admin/recipes/edit?id=${json.data.id}`)
        return
      }
      // fallback: log error
      console.warn('[v0] create recipe failed', res.status, json)
      alert('レシピの作成に失敗しました。詳細はコンソールを確認してください。')
    } catch (e) {
      console.error('[v0] create recipe exception', e)
      alert('レシピ作成中にエラーが発生しました')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <AdminLoading />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">レシピ管理</h1>
          <p className="text-sm md:text-base text-muted-foreground">{recipes.length}件のレシピ</p>
        </div>
        <Button size="lg" className="gap-2" onClick={createNew}>
          <Plus className="w-4 h-4" />
          新規作成
        </Button>
      </div>

      {/* 新規レシピ名入力モーダル */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新しいレシピを作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">レシピ名</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例: 私のデスクセットアップ 2025"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateRecipe() }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewModal(false)}>キャンセル</Button>
            <Button onClick={handleCreateRecipe} disabled={creating}>{creating ? '作成中…' : '画像選択へ進む'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* レシピ一覧 */}
      {recipes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">レシピがまだありません</p>
            <Button onClick={createNew} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              最初のレシピを作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* レシピ画像プレビュー */}
                <div className="aspect-video relative mb-3 bg-muted rounded-lg overflow-hidden">
                  {(() => {
                    // Prefer canonical recipe_image_keys if present (key-only policy)
                    try {
                      const keys = Array.isArray(recipe.recipe_image_keys) ? recipe.recipe_image_keys : (Array.isArray(recipe.recipeImageKeys) ? recipe.recipeImageKeys : [])
                      const firstKey = keys && keys.length > 0 ? keys[0] : null
                      // fallback to images[] entries (may contain url or key)
                      const imgs = Array.isArray(recipe.images) ? recipe.images : []
                      const firstImg = imgs.length > 0 ? imgs[0] : null
                      const primaryCandidate = firstKey || (firstImg && (firstImg.key || firstImg.url || firstImg.imageUrl || firstImg.src)) || recipe.imageUrl || recipe.imageDataUrl || null
                      if (!primaryCandidate) return (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">画像未設定</div>
                      )

                      // data URLs are used as-is
                      if (typeof primaryCandidate === 'string' && primaryCandidate.startsWith('data:')) {
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={primaryCandidate} alt={recipe.title || 'レシピ画像'} className="w-full h-full object-cover" />
                        )
                      }

                      // Use responsiveImageForUsage to generate src/srcSet matching public site
                      try {
                        const { responsiveImageForUsage } = require('@/lib/image-url')
                        const resp = responsiveImageForUsage(primaryCandidate, 'list')
                        const src = resp?.src || getPublicImageUrl(primaryCandidate) || primaryCandidate || '/placeholder.svg'
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} srcSet={resp?.srcSet || undefined} sizes={resp?.sizes} alt={recipe.title || 'レシピ画像'} className="w-full h-full object-cover" />
                        )
                      } catch (e) {
                        // fallback to getPublicImageUrl
                        const src = getPublicImageUrl(primaryCandidate) || primaryCandidate || '/placeholder.svg'
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt={recipe.title || 'レシピ画像'} className="w-full h-full object-cover" />
                        )
                      }
                    } catch (err) {
                      return (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">画像未設定</div>
                      )
                    }
                  })()}
                  
                  {/* 公開ステータスバッジ */}
                  <div className="absolute top-2 right-2">
                    {recipe.published ? (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        公開中
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        非公開
                      </div>
                    )}
                  </div>
                </div>

                {/* 管理画面では詳細情報を非表示にする（タイトル・画像・公開バッジのみ表示） */}

                {/* レシピタイトル - インライン編集可能 */}
                {editingId === recipe.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(recipe.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => handleSaveTitle(recipe.id)}
                    className="mb-3 h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-semibold mb-3 truncate text-sm cursor-pointer hover:text-primary"
                    onClick={() => {
                      setEditingId(recipe.id)
                      setEditTitle(recipe.title || "")
                    }}
                    title="クリックして編集"
                  >
                    {recipe.title || "無題のレシピ"}
                  </h3>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/recipes/edit?id=${recipe.id}`) }
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublish(recipe)}
                    title={recipe.published ? "非公開にする" : "公開する"}
                  >
                    {recipe.published ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(recipe.id)}
                    title="削除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
