"use client"

import { useState } from "react"
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

export default function RecipeNewPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const { toast } = useToast()

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

    const recipeId = `recipe-${Date.now()}`

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

        const uploadResp = await fetch('/api/images/upload', { method: 'POST', body: form })
        const uploadJson = await uploadResp.json().catch(() => null)
        if (uploadJson && uploadJson.ok && uploadJson.result) {
          if (typeof uploadJson.result === 'object') {
            finalKey = uploadJson.result.key || null
            finalUrl = finalKey ? (getPublicImageUrl(finalKey) || finalUrl) : (uploadJson.result.url || (Array.isArray(uploadJson.result.variants) ? uploadJson.result.variants[0] : finalUrl))
          } else if (typeof uploadJson.result === 'string') {
            finalUrl = uploadJson.result
          }
        }
      }
    } catch (e) {
      console.warn('[v0] new recipe image upload failed, keeping inline image', e)
    }

    const imageObj: any = { id: recipeId, width: 1920, height: 1080, uploadedAt: new Date().toISOString() }
    if (finalKey) imageObj.key = finalKey
    else imageObj.url = finalUrl

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

    const created = db.recipes.create(recipe)

    try {
      const body: any = { recipeId, id: recipeId, width: 1920, height: 1080 }
      if (finalKey) body.key = finalKey
      else {
        // CASE A: do not persist full URLs to the server DB. Skip server upsert when no key available.
        console.warn('[v0] no finalKey obtained; skipping server persist to avoid storing URLs in DB')
      }
      await fetch('/api/admin/recipe-images/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (e) {
      console.warn('[v0] failed to persist new recipe image to server', e)
    }

    toast({
      title: "作成完了",
      description: "レシピを作成しました"
    })
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
