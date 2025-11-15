"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Plus, Trash2, X, Clipboard } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db/storage"
import type { Product } from "@/lib/db/schema"
import { fileToBase64 } from "@/lib/utils/image-utils"

const TAG_CATEGORIES = {
  ジャンル: ["マウス", "キーボード", "照明", "オーディオ", "カメラ", "モニターアーム", "デスク", "チェア"],
  カテゴリ: ["デスク周り", "生産性", "リモートワーク", "集中力", "エルゴノミクス", "目に優しい"],
  リンク先: ["Amazon", "楽天", "Yahoo", "公式サイト"],
}

export default function ProductNewPage() {
  const router = useRouter()
  const linkTags = db.tags.getAll().filter((t: any) => t.linkUrl)
  
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [body, setBody] = useState("")
  const [notes, setNotes] = useState("")
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [relatedLinks, setRelatedLinks] = useState<string[]>([""])
  const [price, setPrice] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [published, setPublished] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [affiliateLinks, setAffiliateLinks] = useState<Array<{ provider: string; url: string; label: string }>>([
    { provider: "", url: "", label: "" },
  ])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const addAffiliateLink = () => {
    setAffiliateLinks([...affiliateLinks, { provider: "", url: "", label: "" }])
  }

  const removeAffiliateLink = (index: number) => {
    setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index))
  }

  const updateAffiliateLinkFromTag = (index: number, tagName: string) => {
    const tag = linkTags.find((t: any) => t.name === tagName)
    if (tag) {
      const updated = [...affiliateLinks]
      updated[index] = { 
        provider: tag.name,
        url: tag.linkUrl || "",
        label: tag.linkLabel || ""
      }
      setAffiliateLinks(updated)
    }
  }

  const updateAffiliateLink = (index: number, field: string, value: string) => {
    const updated = [...affiliateLinks]
    updated[index] = { ...updated[index], [field]: value }
    setAffiliateLinks(updated)
  }

  const pasteFromClipboard = async (index: number) => {
    try {
      const text = await navigator.clipboard.readText()
      updateAffiliateLink(index, "url", text)
    } catch (err) {
      alert("クリップボードへのアクセスが許可されていません")
    }
  }

  const handleAttachmentChange = (index: number, file: File | null) => {
    const updated = [...attachmentFiles]
    if (file) {
      updated[index] = file
    } else {
      updated.splice(index, 1)
    }
    setAttachmentFiles(updated)
  }

  const addAttachmentSlot = () => {
    if (attachmentFiles.length < 4) {
      setAttachmentFiles([...attachmentFiles, null as any])
    }
  }

  const addRelatedLink = () => {
    setRelatedLinks([...relatedLinks, ""])
  }

  const updateRelatedLink = (index: number, value: string) => {
    const updated = [...relatedLinks]
    updated[index] = value
    setRelatedLinks(updated)
  }

  const removeRelatedLink = (index: number) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title || !imageFile) {
      alert("タイトルと画像は必須です")
      return
    }

    const imageBase64 = await fileToBase64(imageFile)
    const attachmentImages = await Promise.all(
      attachmentFiles
        .filter((f) => f)
        .map(async (file, idx) => ({
          id: `img-attachment-${Date.now()}-${idx}`,
          productId: `prod-${Date.now()}`,
          url: await fileToBase64(file),
          width: 400,
          height: 400,
          aspect: "1:1",
          role: "attachment" as const,
        })),
    )

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      userId: "user-shirasame",
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      shortDescription,
      body,
      notes: notes.trim() || undefined,
      relatedLinks: relatedLinks.filter((link) => link.trim()),
      images: [
        {
          id: `img-${Date.now()}`,
          productId: `prod-${Date.now()}`,
          url: imageBase64,
          width: 400,
          height: 400,
          aspect: "1:1",
          role: "main" as const,
        },
        ...attachmentImages,
      ],
      affiliateLinks: affiliateLinks.filter((link) => link.url),
      tags,
      price: price ? Number(price) : undefined,
      published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.products.create(newProduct)

    alert("商品を追加しました！")
    router.push("/admin/products")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">商品を追加</h1>
            <p className="text-sm text-muted-foreground">新しい商品情報を登録</p>
          </div>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>商品名 *</Label>
              <Input
                placeholder="例: ロジクール MX Master 3S"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>短い説明</Label>
              <Input
                placeholder="カードに表示される簡単な説明"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>詳細説明</Label>
              <Textarea
                placeholder="商品の詳しい説明を入力してください"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>備考</Label>
              <Textarea
                placeholder="その他の情報や注意事項など"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>価格（円）</Label>
                <Input type="number" placeholder="15800" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>公開する</Label>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>タグ管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>選択中のタグ</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/30">
                {tags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">タグを追加してください</span>
                ) : (
                  tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:bg-destructive/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>カスタムタグを追加</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="タグを入力"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                />
                <Button type="button" onClick={() => addTag(tagInput)}>
                  追加
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(TAG_CATEGORIES).map(([category, categoryTags]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{category}</Label>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          if (tags.includes(tag)) {
                            removeTag(tag)
                          } else {
                            addTag(tag)
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>商品画像 *</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value="" onChange={setImageFile} aspectRatioType="product" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>添付画像（最大4枚）</CardTitle>
              {attachmentFiles.length < 4 && (
                <Button type="button" size="sm" variant="outline" onClick={addAttachmentSlot}>
                  <Plus className="w-4 h-4 mr-1" />
                  追加
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {attachmentFiles.map((file, index) => (
              <div key={index} className="relative">
                <ImageUpload value="" onChange={(f) => handleAttachmentChange(index, f)} aspectRatioType="product" />
              </div>
            ))}
            {attachmentFiles.length === 0 && <p className="text-sm text-muted-foreground">添付画像はありません</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>アフィリエイトリンク</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addAffiliateLink}>
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {affiliateLinks.map((link, index) => (
              <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Label>リンク先</Label>
                    <Select
                      value={link.provider}
                      onValueChange={(value) => {
                        updateAffiliateLink(index, "provider", value)
                        updateAffiliateLinkFromTag(index, value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {linkTags.map((tag: any) => (
                          <SelectItem key={tag.id} value={tag.name}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      タグ管理で登録したリンク先から選択できます
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateAffiliateLink(index, "url", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => pasteFromClipboard(index)}
                        title="クリップボードから貼り付け"
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ラベル</Label>
                    <Input
                      placeholder="例: Amazonで見る"
                      value={link.label}
                      onChange={(e) => updateAffiliateLink(index, "label", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      リンク先タグから自動入力されます
                    </p>
                  </div>
                </div>
                {affiliateLinks.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAffiliateLink(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>関連リンク</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addRelatedLink}>
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={link}
                  onChange={(e) => updateRelatedLink(index, e.target.value)}
                />
                {relatedLinks.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRelatedLink(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
