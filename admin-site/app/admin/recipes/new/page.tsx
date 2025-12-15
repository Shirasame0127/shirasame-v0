"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db } from "@/lib/db/storage"
import { auth } from "@/lib/auth"
import { getPublicImageUrl } from "@/lib/image-url"
import { convertImageToBase64 } from "@/lib/utils/image-utils"
import type { Recipe } from "@/lib/db/schema"
import { useToast } from "@/hooks/use-toast"
import apiFetch from '@/lib/api-client'

// Helper: try to extract a key-like ID from a public URL path
function extractKeyFromUrl(raw?: string | null) {
  if (!raw) return null
  try {
    if (raw.startsWith('http')) {
      const u = new URL(raw)
      return (u.pathname || '').split('/').filter(Boolean).pop() || null
    }
  } catch (e) {
    // fallback naive
    return String(raw).split('/').filter(Boolean).pop() || null
  }
  return null
}

export default function RecipeNewPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [draftId, setDraftId] = useState<string | null>(null)
  const { toast } = useToast()

  // If navigated here with ?draft=<id>, load draft info and prefill
  // (skip creating a new recipe on save; instead attach uploaded image)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const qp = new URLSearchParams(window.location.search)
      const d = qp.get('draft')
      if (d) {
        setDraftId(d)
        // Try to fill title from local cache if available
        try {
          const cached = db.recipes.getById(d)
          if (cached) {
            setTitle(cached.title || '')
            // try to show existing primary image if present
            try {
              const imgs = Array.isArray((cached as any).images) ? (cached as any).images : []
              if (imgs.length > 0) {
                const k = imgs[0]?.key || imgs[0]?.id || null
                if (k) setImageUrl(getPublicImageUrl(k) || '')
              }
            } catch (e) {}
          }
        } catch (e) {}
      }
    } catch (e) {}
  }, [])

  const handleImageChange = async (file: File | null) => {
    setImageFile(file)
    if (file) {
      const base64 = await convertImageToBase64(file)
      setImageUrl(base64)
    }
  }

  const handleSave = async () => {
    const currentUser = auth.getCurrentUser()
    if (!currentUser) {
      toast({ variant: "destructive", title: "エラー", description: "ログインが必要です" })
      router.push('/admin/login')
      return
    }

    if (!title) {
      toast({ variant: "destructive", title: "エラー", description: "タイトルを入力してください" })
      return
    }
    if (!imageUrl) {
      toast({ variant: "destructive", title: "エラー", description: "画像を選択してください" })
      return
    }

    // If we were given a draft id, reuse it; otherwise create new id
    const recipeId = draftId || `recipe-${Date.now()}`

    let finalUrl = imageUrl
    let finalKey: string | null = null
    try {
      if (imageUrl && imageUrl.startsWith('data:')) {
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        const fileName = `recipe-${Date.now()}.png`
        const form = new FormData()
        form.append('file', new File([blob], fileName, { type: blob.type || 'image/png' }))
        form.append('target', 'recipe')

        const uploadResp = await apiFetch('/api/images/upload', { method: 'POST', body: form })
        const uploadJson = await uploadResp.json().catch(() => null)
        if (uploadJson && uploadJson.ok && uploadJson.result) {
          if (typeof uploadJson.result === 'object') {
            finalKey = uploadJson.result.key || null
            finalUrl = finalKey ? (getPublicImageUrl(finalKey) || finalUrl) : (uploadJson.result.url || (Array.isArray(uploadJson.result.variants) ? uploadJson.result.variants[0] : finalUrl))
          } else if (typeof uploadJson.result === 'string') {
            finalUrl = uploadJson.result
          }
        }
      } else if (imageUrl && imageUrl.startsWith('http')) {
        // Try to derive a key from a provided public URL (best-effort).
        const derived = extractKeyFromUrl(imageUrl)
        if (derived) finalKey = derived
      }
    } catch (e) {
      console.warn('[v0] new recipe image upload failed, keeping inline image', e)
    }

    // Enforce key-only persistence: require a key (either uploaded or derived)
    if (!finalKey) {
      toast({ variant: 'destructive', title: 'エラー', description: '画像はキー形式で管理されます。アップロードしてキーを取得してください。' })
      return
    }

    const imageObj: any = { id: recipeId, width: 1920, height: 1080, uploadedAt: new Date().toISOString(), key: finalKey }

    const recipe: Recipe = {
      id: recipeId,
      userId: currentUser.id,
      title,
      baseImageId: recipeId,
      width: 1920,
      height: 1080,
      pins: [],
      images: [ imageObj ],
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const safeForServer = {
      ...recipe,
      images: recipe.images.map((img: any) =>
        img.key
          ? { id: img.id, key: img.key, width: img.width, height: img.height, uploadedAt: img.uploadedAt }
          : { id: img.id, width: img.width, height: img.height, uploadedAt: img.uploadedAt }
      ),
    }
    // If draftId exists, update the draft in cache/server; otherwise create
    let created: any = null
    if (draftId) {
      db.recipes.update(recipeId, safeForServer)
      created = db.recipes.getById(recipeId)
    } else {
      created = db.recipes.create(safeForServer)
    }

    try {
      const body: any = { recipeId, id: recipeId, width: 1920, height: 1080 }
      if (finalKey) body.key = finalKey
      await apiFetch('/api/admin/recipe-images/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      // also update recipe row to include image key in images[]
      try {
        const imageEntry = { id: recipeId, key: finalKey, width: 1920, height: 1080, uploadedAt: new Date().toISOString() }
        await db.recipes.update(recipeId, { images: [imageEntry], baseImageId: recipeId })
      } catch (e) {
        console.warn('[v0] failed to attach image to recipe draft in cache/server', e)
      }
    } catch (e) {
      console.warn('[v0] failed to persist new recipe image to server', e)
    }

    toast({
      title: "作成完了",
      description: "レシピを作成しました"
    })
    // After attaching image, navigate to edit page for the draft
    router.push(`/admin/recipes/${recipeId}/edit`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">新しいレシピを作成</h1>
            <p className="text-sm text-muted-foreground">デスクセットアップ画像をアップロード</p>
          </div>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          作成
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>タイトル *</Label>
          <Input
            placeholder="例: 私のデスクセットアップ 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>デスク画像 *</Label>
          <ImageUpload value={imageUrl} onChange={handleImageChange} aspectRatioType="recipe" />
          <p className="text-sm text-muted-foreground">4:3の比率でトリミングされます。作成後にピンを追加できます。</p>
        </div>
      </div>
    </div>
  )
}
