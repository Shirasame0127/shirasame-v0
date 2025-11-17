"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, Save } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { db } from "@/lib/db/storage"
import { convertImageToBase64 } from "@/lib/utils/image-utils"
import type { Recipe, RecipeImage } from "@/lib/mock-data/recipes"
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
    if (!title) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タイトルを入力してください"
      })
      return
    }
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "画像を選択してください"
      })
      return
    }

    const recipeId = `recipe-${Date.now()}`
    const recipe: Recipe = {
      id: recipeId,
      userId: "user-shirasame",
      title,
      baseImageId: recipeId,
      width: 1920,
      height: 1080,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const recipeImage: RecipeImage = {
      id: recipeId,
      recipeId,
      url: imageUrl,
      width: 1920,
      height: 1080,
    }

    db.recipes.create(recipe)
    db.recipeImages.upsert(recipeImage)

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
