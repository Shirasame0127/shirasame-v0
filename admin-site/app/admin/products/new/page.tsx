"use client"

import { useEffect, useMemo, useState } from "react"
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
import { auth } from "@/lib/auth"
import type { Product } from "@/lib/db/schema"
import { fileToBase64 } from "@/lib/utils/image-utils"
import { useToast } from "@/hooks/use-toast"

import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { getPublicImageUrl } from "@/lib/image-url"

// (省略せずに元実装をそのまま移植しました)

type AffiliateTemplateId = 'amazon' | 'rakuten' | 'yahoo' | 'official'

const AFFILIATE_LINK_TEMPLATES: Array<{
  id: AffiliateTemplateId
  name: string
  defaultLabel: string
  defaultUrl: string
  linkTag: string
}> = [
  { id: 'amazon', name: 'Amazon', defaultLabel: 'Amazonで見る', defaultUrl: 'https://www.amazon.co.jp/dp/', linkTag: 'Amazon' },
  { id: 'rakuten', name: '楽天', defaultLabel: '楽天で見る', defaultUrl: 'https://item.rakuten.co.jp/', linkTag: '楽天' },
  { id: 'yahoo', name: 'ヤフー', defaultLabel: 'ヤフーショッピングで見る', defaultUrl: 'https://store.shopping.yahoo.co.jp/', linkTag: 'Yahoo' },
  { id: 'official', name: '公式サイト', defaultLabel: '公式サイトで見る', defaultUrl: 'https://example.com/', linkTag: '公式サイト' },
]

type AttachmentSlot = {
  file: File | null
  key: string
}

export default function ProductNewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser] = useState(() => auth.getCurrentUser())
  const [productId, setProductId] = useState(() => `prod-${Date.now()}`)
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [body, setBody] = useState("")
  const [notes, setNotes] = useState("")
  const [attachmentSlots, setAttachmentSlots] = useState<AttachmentSlot[]>([])
  const [relatedLinks, setRelatedLinks] = useState<string[]>([""])
  const [price, setPrice] = useState("")
  const [showPrice, setShowPrice] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [published, setPublished] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  // store canonical image KEY only
  const [mainImageKey, setMainImageKey] = useState<string | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState("")
  const [affiliateLinks, setAffiliateLinks] = useState<Array<{ provider: string; url: string; label: string }>>([
    { provider: "", url: "", label: "" },
  ])
  const [draftInitialized, setDraftInitialized] = useState(false)

  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [availableTags, setAvailableTags] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const [tagsRes, groupsRes] = await Promise.all([apiFetch('/api/tags'), apiFetch('/api/tag-groups')])
        const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
        const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
        const serverTags = Array.isArray(tagsJson) ? tagsJson : tagsJson.data || []
        const serverGroups = Array.isArray(groupsJson) ? groupsJson : groupsJson.data || []
        const finalTags = tagsRes.ok && Array.isArray(serverTags) && serverTags.length > 0 ? serverTags : db.tags.getAllWithPlaceholders()
        setAvailableTags(finalTags)
        const groupNames: string[] = serverGroups && serverGroups.length > 0 ? serverGroups.map((g: any) => g.name).filter(Boolean) : []
        if (groupNames.length === 0) {
          const inferred = Array.from(new Set((finalTags || []).map((t: any) => t.group).filter(Boolean))) as string[]
          inferred.forEach((g: string) => groupNames.push(g))
        }
        const map: Record<string, string[]> = {}
        const linkTags = (finalTags || [])
          .filter((t: any) => (t.group || '未分類') === 'リンク先')
          .map((t: any) => t.name)
          .filter(Boolean)
        if (linkTags.length > 0) {
          map['リンク先'] = linkTags
        } else {
          map['リンク先'] = AFFILIATE_LINK_TEMPLATES.map((t) => t.name)
        }
        groupNames.forEach((name) => {
          map[name] = (finalTags || []).filter((t: any) => (t.group || '未分類') === name).map((t: any) => t.name)
        })
        setTagGroups(map)
      } catch (e) {
        const fallback = db.tags.getAllWithPlaceholders()
        const inferred = Array.from(new Set((fallback || []).map((t: any) => t.group).filter(Boolean))) as string[]
        const map: Record<string, string[]> = {}
        const linkTags = (fallback || [])
          .filter((t: any) => (t.group || '未分類') === 'リンク先')
          .map((t: any) => t.name)
          .filter(Boolean)
        map['リンク先'] = linkTags.length > 0 ? linkTags : AFFILIATE_LINK_TEMPLATES.map((t) => t.name)
        inferred.forEach((name: string) => {
          map[name] = (fallback || []).filter((t: any) => (t.group || '未分類') === name).map((t: any) => t.name)
        })
        setTagGroups(map)
        console.warn('failed to load tags/groups, falling back to cache', e)
      }
    })()

    // Drafts disabled: do not load server-side saved drafts.
    if (!currentUser?.id || draftInitialized) return
    setDraftInitialized(true)
  }, [currentUser?.id, draftInitialized])

  const draftState = useMemo(
    () => ({
      productId,
      title,
      shortDescription,
      body,
      notes,
      relatedLinks,
      price,
      showPrice,
      tags,
      published,
      affiliateLinks,
      mainImageKey,
      attachmentKeys: attachmentSlots.map((slot) => slot.key).filter(Boolean),
    }),
    [productId, title, shortDescription, body, notes, relatedLinks, price, showPrice, tags, published, affiliateLinks, mainImageKey, attachmentSlots],
  )

  // Draft auto-save disabled.

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

  const ensureLinkTag = (linkTag: string) => {
    if (!linkTag) return
    setTags((prev) => (prev.includes(linkTag) ? prev : [...prev, linkTag]))
  }

  const applyAffiliateTemplate = (index: number, templateId: AffiliateTemplateId) => {
    const template = AFFILIATE_LINK_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    const updated = [...affiliateLinks]
    updated[index] = {
      ...updated[index],
      provider: template.name,
      label: template.defaultLabel,
      url: updated[index].url || template.defaultUrl,
    }
    setAffiliateLinks(updated)
    ensureLinkTag(template.linkTag)
  }

  const applyLinkTagTemplate = (index: number, tagName: string) => {
    if (!tagName) return
    const tagObj = (availableTags || []).find((t: any) => t.name === tagName)
    const updated = [...affiliateLinks]
    updated[index] = {
      ...updated[index],
      provider: tagName,
      label: (tagObj && (tagObj.linkLabel || tagObj.link_label)) || updated[index].label || "",
      url: (tagObj && (tagObj.linkUrl || tagObj.link_url)) || updated[index].url || "",
    }
    setAffiliateLinks(updated)
    ensureLinkTag(tagName)
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
      toast({
        variant: "destructive",
        title: "エラー",
        description: "クリップボードへのアクセスが許可されていません"
      })
    }
  }

  const handleAttachmentChange = (index: number, file: File | null) => {
    setAttachmentSlots((prev) => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], file }
      }
      return next
    })
  }

  const addAttachmentSlot = () => {
    if (attachmentSlots.length < 4) {
      setAttachmentSlots([...attachmentSlots, { file: null, key: "" }])
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
    const user = currentUser || auth.getCurrentUser()
    if (!user) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログインが必要です"
      })
      router.push('/admin/login')
      return
    }

    if (!title || (!imageFile && !mainImageKey)) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タイトルと画像は必須です"
      })
      return
    }

    const generatedProductId = productId || `prod-${Date.now()}`

    // Ensure we have canonical keys for main image and attachments.
    let finalMainKey = mainImageKey
    if (!finalMainKey && imageFile) {
      // upload via local cache helper which will call /api/images/save and return a key
      const base64 = await fileToBase64(imageFile)
      const genKey = `prod-${generatedProductId}-main-${Date.now()}`
      try {
        const returned = await db.images.saveUpload(genKey, base64)
        finalMainKey = returned || genKey
        setMainImageKey(finalMainKey)
      } catch (e) {
        console.error('main image save failed', e)
      }
    }
    if (!finalMainKey) {
      toast({ variant: "destructive", title: "エラー", description: "画像のアップロードに失敗しました" })
      return
    }

    const attachmentImages = await Promise.all(
      attachmentSlots
        .map((slot, idx) => ({ slot, idx }))
        .filter(({ slot }) => slot.file || slot.key)
        .map(async ({ slot, idx }) => ({
          id: `img-attachment-${Date.now()}-${idx}`,
            productId: generatedProductId,
            // persist attachment as key-only; if only file present, upload to obtain key
            key: slot.key || (slot.file ? await db.images.saveUpload(`prod-${generatedProductId}-att-${idx}-${Date.now()}`, await fileToBase64(slot.file)) : ""),
            aspect: "1:1",
            role: "attachment" as const,
        })),
    )

    // Guard: do not allow URL-shaped keys to be persisted
    if (attachmentImages.some((a) => typeof a.key === 'string' && a.key.startsWith('http'))) {
      toast({ variant: 'destructive', title: '保存中止', description: '添付画像のキーがURLになっています。キーのみを保存してください。' })
      return
    }

    const newProduct: Product = {
      id: generatedProductId,
      userId: user.id,
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      shortDescription,
      body,
      notes: notes.trim() || undefined,
      relatedLinks: relatedLinks.filter((link) => link.trim()),
      images: [
        {
          id: `img-${Date.now()}`,
          productId: generatedProductId,
          key: finalMainKey,
          aspect: "1:1",
          role: "main" as const,
        },
        ...attachmentImages,
      ],
      affiliateLinks: affiliateLinks.filter((link) => link.url),
      tags,
      price: price ? Number(price) : undefined,
      showPrice,
      published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const res = await apiFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '保存に失敗しました' }))
        toast({ variant: 'destructive', title: 'エラー', description: err.error || '商品保存に失敗しました' })
        return
      }

      const json = await res.json()
      if (json.errors) {
        const messages = Object.entries(json.errors)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join('\n')
        toast({ variant: 'destructive', title: '一部保存に失敗しました', description: messages })
      }

      const created = json.data || json

      // Draft cleanup disabled: no server-side draft endpoint call.

      toast({ title: '作成完了', description: '商品を追加しました' })
      router.push('/admin/products')
    } catch (e) {
      console.error('product create error', e)
      toast({ variant: 'destructive', title: 'エラー', description: '商品作成中にエラーが発生しました' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products" prefetch={false}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">商品を追加</h1>
            <p className="text-sm text-muted-foreground">新しい商品情報を登録</p>
          </div>
        </div>
        <Button onClick={handleSave} size="lg" disabled={!title || !(imageFile || mainImageKey)}>
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="space-y-6">
        {/* 省略せず元実装のフォームをそのまま移植 */}
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
                <Label>価格を表示する</Label>
                <Switch checked={showPrice} onCheckedChange={setShowPrice} />
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
              <div className="flex flex-wrap gap-2 min-h-10 p-3 border rounded-md bg-muted/30">
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
              {Object.entries(tagGroups).map(([category, categoryTags]) => (
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
            <ImageUpload
                  value={mainImagePreview || getPublicImageUrl(mainImageKey || '') || ""}
                  onChange={setImageFile}
                  aspectRatioType="product"
                  onUploadComplete={(key) => {
                    if (!key) return
                    setMainImageKey(key)
                    try { setMainImagePreview(getPublicImageUrl(key) || '') } catch (e) {}
                  }}
                />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>添付画像（最大4枚）</CardTitle>
              {attachmentSlots.length < 4 && (
                <Button type="button" size="sm" variant="outline" onClick={addAttachmentSlot}>
                  <Plus className="w-4 h-4 mr-1" />
                  追加
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {attachmentSlots.map((slot, index) => (
              <div key={index} className="relative">
                <ImageUpload
                  value={getPublicImageUrl(slot.key) || ""}
                  onChange={(f) => handleAttachmentChange(index, f)}
                  aspectRatioType="product"
                  onUploadComplete={(key) => {
                      if (!key) return
                      if (typeof key === 'string' && key.startsWith('http')) {
                        toast({ variant: 'destructive', title: '無効な画像キー', description: 'アップロード結果がURLでした。管理画面はキーのみを保存します。' })
                        return
                      }
                      setAttachmentSlots((prev) => {
                        const next = [...prev]
                        if (next[index]) next[index] = { ...next[index], key: key }
                        return next
                      })
                    }}
                />
              </div>
            ))}
            {attachmentSlots.length === 0 && <p className="text-sm text-muted-foreground">添付画像はありません</p>}
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
                    <Label>リンク先テンプレート</Label>
                    <Select
                      value={link.provider || ""}
                      onValueChange={(value) => applyLinkTagTemplate(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tagGroups['リンク先'] || []).map((tagName) => {
                          const tagObj = (availableTags || []).find((t: any) => t.name === tagName)
                          const display = tagObj ? (tagObj.linkLabel || tagObj.link_label || tagName) : tagName
                          return (
                            <SelectItem key={tagName} value={tagName}>
                              {display}
                            </SelectItem>
                          )
                        })}
                        {(tagGroups['リンク先'] || []).length === 0 &&
                          AFFILIATE_LINK_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">タグで管理されたリンク先を選択できます</p>
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
                      テンプレート選択時に自動入力されます
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
