"use client"

import { useEffect, useState } from "react"
import AdminLoading from '@/components/admin-loading'
import { db } from "@/lib/db/storage"
import { Button } from "@/components/ui/button"
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
  // legacy image fields normalization
  if (!normalized.imageUrl && (normalized.base_image_id || normalized.image_data_url || normalized.image_data_url)) {
    normalized.imageUrl = normalized.image_data_url || normalized.base_image_id || null
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
    // Prompt for a recipe title first, then create a draft and go to the
    // upload/creation screen with the draft id so the uploaded image can
    // be attached to the draft before editing.
    try {
      const title = String(prompt('新しいレシピ名を入力してください（例: 私のデスクセットアップ）') || '').trim()
      if (!title) return
      // create a draft in local cache and persist to server (best-effort)
      const currentUser = getCurrentUser()
      const draft = db.recipes.create({ title, published: false, pins: [], images: [] , userId: currentUser?.id })
      // navigate to the new recipe flow with draft id
      router.push(`/admin/recipes/new?draft=${encodeURIComponent(draft.id)}`)
    } catch (e) {
      console.error('[v0] createNew prompt/create failed', e)
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
                  {(
                    // prefer recipes.images jsonb if available, fallback to legacy fields
                    (() => {
                      try {
                        const imgs = recipe.images || []
                        if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]?.url || imgs[0]?.imageUrl || imgs[0]?.src || null
                      } catch (e) {
                        // ignore
                      }
                      return recipe.imageUrl || recipe.imageDataUrl || null
                    })()
                  ) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(() => {
                        const primary = (() => {
                          try {
                            const imgs = recipe.images || []
                            if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]?.url || imgs[0]?.imageUrl || imgs[0]?.src || null
                          } catch (e) {}
                          return recipe.imageUrl || recipe.imageDataUrl || null
                        })()
                        if (!primary) return "/placeholder.svg"
                        // data URLs should be used as-is; otherwise map via getPublicImageUrl (R2)
                        try {
                          if (typeof primary === 'string' && primary.startsWith('data:')) return primary
                        } catch (e) {}
                        return getPublicImageUrl(primary) || primary || "/placeholder.svg"
                      })()}
                      alt={recipe.title || "レシピ画像"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      画像未設定
                    </div>
                  )}
                  
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
                    onClick={() => router.push(`/admin/recipes/${recipe.id}/edit`) }
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
