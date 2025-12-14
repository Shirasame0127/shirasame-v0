"use client"

import { useEffect, useState } from "react"
import AdminLoading from '@/components/admin-loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Plus, Trash2, X, Clipboard } from 'lucide-react'
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { getPublicImageUrl, responsiveImageForUsage } from "@/lib/image-url"

type AffiliateTemplate = {
  id: string
  name: string
  defaultLabel: string
  defaultUrl: string
  linkTag: string
}

const KNOWN_AFFILIATE_TEMPLATES: Record<string, Partial<AffiliateTemplate>> = {
  Amazon: { name: 'Amazon', defaultLabel: 'Amazonで見る', defaultUrl: 'https://www.amazon.co.jp/dp/' },
  楽天: { name: '楽天', defaultLabel: '楽天で見る', defaultUrl: 'https://item.rakuten.co.jp/' },
  Yahoo: { name: 'Yahoo', defaultLabel: 'ヤフーショッピングで見る', defaultUrl: 'https://store.shopping.yahoo.co.jp/' },
  '公式サイト': { name: '公式サイト', defaultLabel: '公式サイトで見る', defaultUrl: 'https://example.com/' },
}

type AttachmentSlot = {
  file: File | null
  key: string
}

export default function ProductEditPage({ params }: { params: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // `params` is provided by Next.js as a plain object in client pages.
  // Avoid using the server-only `use()` utility here — read `params` directly.
  const id = params?.id
  const search = useSearchParams()
  const maybeUserId = (() => {
    try {
      const s = search?.get ? search.get('user_id') : null
      return s || null
    } catch (e) { return null }
  })()
  
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
  const [mainImageKey, setMainImageKey] = useState("")
  const [mainImagePreview, setMainImagePreview] = useState("")
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [affiliateLinks, setAffiliateLinks] = useState<Array<{ provider: string; url: string; label: string }>>([
    { provider: "", url: "", label: "" },
  ])

  const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({})
  const [availableTags, setAvailableTags] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('Invalid product id')
        // Only call the authoritative admin API. Authentication is provided
        // by HttpOnly cookies and validated server-side. Do NOT include
        // user_id in the query string.
        const res = await apiFetch(`/api/admin/products/${id}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const json = await res.json().catch(() => null)
        const data = json && typeof json === 'object' && 'data' in json ? json.data : json

        setTitle(data.title || "")
        setShortDescription(data.shortDescription || "")
        setBody(data.body || "")
        setNotes(data.notes || "")
        setRelatedLinks(data.relatedLinks?.length ? data.relatedLinks : [""])
        setPrice(data.price || "")
        setShowPrice(typeof data.showPrice === "boolean" ? data.showPrice : true)
        setTags(Array.isArray(data.tags) ? data.tags : [])
        setPublished(typeof data.published === "boolean" ? data.published : true)
        
        if (Array.isArray(data.affiliateLinks) && data.affiliateLinks.length > 0) {
          setAffiliateLinks(data.affiliateLinks)
        }

        // Prefer new product columns `main_image_key` / `attachment_image_keys` when present.
        if (data.main_image_key) {
          const k = data.main_image_key || ''
          setMainImageKey(k)
          try { setMainImagePreview(getPublicImageUrl(k) || '') } catch (e) {}
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          const main = data.images.find((img: any) => img.role === 'main') || data.images[0]
          if (main && (main.key || main.basePath)) {
            const key = main.key || main.basePath || ''
            setMainImageKey(key)
            try { setMainImagePreview(getPublicImageUrl(key) || '') } catch (e) {}
          }
        }

        if (Array.isArray(data.attachment_image_keys) && data.attachment_image_keys.length > 0) {
          setAttachmentSlots((data.attachment_image_keys || []).slice(0,4).map((k: any) => ({ file: null, key: k || '' })))
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          const main = data.images.find((img: any) => img.role === 'main') || data.images[0]
          const attachmentsByRole = data.images.filter((img: any) => img.role === 'attachment')
          let attachments: any[] = []
          if (attachmentsByRole.length > 0) {
            attachments = attachmentsByRole
          } else {
            attachments = data.images.filter((img: any) => img !== main)
          }
          setAttachmentSlots(attachments.slice(0, 4).map((img: any) => ({ file: null, key: img.key || img.basePath || '' })))
        }
        // No fallback to public API: admin UI must rely on admin API only.

      } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "エラー", description: "商品データの読み込みに失敗しました" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, toast])

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
          const inferred = Array.from(new Set((finalTags || []).map((t: any) => String(t.group)).filter(Boolean))) as string[]
          inferred.forEach((g: string) => groupNames.push(g))
        }
        const map: Record<string, string[]> = {}
        groupNames.forEach((name) => {
          map[name] = (finalTags || []).filter((t: any) => (t.group || '未分類') === name).map((t: any) => t.name)
        })
        if (!map['リンク先']) {
          map['リンク先'] = (finalTags || []).filter((t: any) => (t.group || '未分類') === 'リンク先').map((t: any) => t.name)
        }
        setTagGroups(map)
      } catch (e) {
        const fallback: any[] = db.tags.getAllWithPlaceholders() || []
        const inferred = Array.from(new Set(fallback.map((t: any) => String(t.group)).filter(Boolean))) as string[]
        const map: Record<string, string[]> = {}
        inferred.forEach((name) => {
          map[name] = fallback.filter((t: any) => (t.group || '未分類') === name).map((t: any) => t.name)
        })
        if (!map['リンク先']) {
          map['リンク先'] = fallback.filter((t: any) => (t.group || '未分類') === 'リンク先').map((t: any) => t.name)
        }
        setTagGroups(map)
        console.warn('failed to load tags/groups, falling back to cache', e)
      }
    })()
  }, [])

  const affiliateTemplateOptions: AffiliateTemplate[] = (tagGroups['リンク先'] || []).map((tag) => {
    const known = KNOWN_AFFILIATE_TEMPLATES[tag]
    return {
      id: tag,
      name: known?.name || tag,
      defaultLabel: known?.defaultLabel || `${tag}で見る`,
      defaultUrl: known?.defaultUrl || '',
      linkTag: tag,
    }
  })

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    const linkGroup = tagGroups['リンク先'] || []
    if (linkGroup.includes(trimmedTag)) {
      const hasLabel = affiliateLinks.some((l) => (l.provider === trimmedTag || l.provider === KNOWN_AFFILIATE_TEMPLATES[trimmedTag]?.name) && (l.label || '').trim().length > 0)
      if (!hasLabel) {
        toast({ variant: 'destructive', title: '入力エラー', description: `"${trimmedTag}" タグを追加する前に、アフィリエイトリンクのラベルを入力してください` })
        setTagInput("")
        return
      }
    }
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

  const applyAffiliateTemplate = (index: number, templateTag: string) => {
    if (!templateTag) return
    const known = KNOWN_AFFILIATE_TEMPLATES[templateTag]
    const template: AffiliateTemplate = {
      id: templateTag,
      name: known?.name || templateTag,
      defaultLabel: known?.defaultLabel || `${templateTag}で見る`,
      defaultUrl: known?.defaultUrl || '',
      linkTag: templateTag,
    }
    const updated = [...affiliateLinks]
    updated[index] = {
      ...updated[index],
      provider: template.name,
      label: updated[index].label || template.defaultLabel,
      url: updated[index].url || template.defaultUrl,
    }
    setAffiliateLinks(updated)
    ensureLinkTag(template.linkTag)
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

    const uploadFile = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd })
    if (!res.ok) {
      let errData: any = null
      try { errData = await res.json() } catch (e) { try { const txt = await res.text(); errData = { error: txt } } catch (e2) { errData = { error: 'unknown' } } }
      throw new Error(errData?.error || `upload failed (${res.status})`)
    }
    const json = await res.json().catch(() => ({}))
    // Prefer canonical key. If only a Cloudflare id is returned, ask server to resolve it.
    let uploadedKey = json?.result?.key || json?.key || undefined
    const cfId = json?.result?.id || undefined
    if (!uploadedKey && cfId) {
      try {
        // Resolve Cloudflare Images id -> canonical key via images/complete
        const saveRes = await apiFetch('/api/images/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cf_id: cfId, filename: file.name }),
        })
        if (saveRes.ok) {
          const saveJson = await saveRes.json().catch(() => ({}))
          uploadedKey = saveJson?.key || uploadedKey
        }
      } catch (e) {
        console.warn('images/complete (cf_id) resolution failed', e)
      }
    }
    if (!uploadedKey) throw new Error('upload did not return a canonical key')
    return { key: uploadedKey }
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
    if (!title || !mainImageKey) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タイトルとメイン画像は必須です"
      })
      return
    }

    const images: any[] = []

    let finalMainKey: string | undefined = undefined
    let finalAttachmentSlots = attachmentSlots
    try {
      if (mainFile) {
        const u = await uploadFile(mainFile)
        finalMainKey = (u as any)?.key || undefined
        if (!finalMainKey) {
          toast({ variant: 'destructive', title: 'アップロードエラー', description: '画像アップロードがキーを返しませんでした。管理画面はキーのみを保存します。' })
          return
        }
        try {
          const usage = 'list'
          const resp = responsiveImageForUsage(finalMainKey || '', usage as any)
          if (resp?.src) setMainImagePreview(resp.src)
        } catch (e) {}
        setMainFile(null)
      }

      const newAttachmentSlots = await Promise.all(
        attachmentSlots.map(async (slot) => {
              if (slot.file && !slot.key) {
            try {
                  const u = await uploadFile(slot.file)
                  const k = (u as any)?.key
                  if (!k) {
                    console.error('attachment upload did not return a key', u)
                    return { ...slot }
                  }
                  return { file: null, key: k }
            } catch (e) {
              console.error('attachment upload failed', e)
              return { ...slot }
            }
          }
          return slot
        })
      )
      finalAttachmentSlots = newAttachmentSlots
      setAttachmentSlots(newAttachmentSlots)
    } catch (e) {
      console.error('upload before save failed', e)
      toast({ variant: 'destructive', title: 'アップロードエラー', description: '画像アップロード中にエラーが発生しました。' })
      return
    }

    images.push({
      key: finalMainKey || mainImageKey,
      role: "main",
      aspect: "1:1",
    })

    // Guard: ensure no URL-shaped keys are persisted
    if (images.some((img) => typeof img.key === 'string' && img.key.startsWith('http'))) {
      toast({ variant: 'destructive', title: '保存中止', description: '画像のキーにURLが含まれています。キーのみ保存してください。' })
      return
    }

    finalAttachmentSlots.forEach((slot) => {
      if (slot.key) {
        images.push({
          key: slot.key,
          role: "attachment",
          aspect: "1:1"
        })
      }
    })

    const productData = {
      title,
      shortDescription,
      body,
      notes: notes.trim() || undefined,
      relatedLinks: relatedLinks.filter((link) => link.trim()),
      images,
      // Set authoritative product-level columns when available
      main_image_key: images && images.length > 0 ? (images[0].key || mainImageKey) : mainImageKey,
      attachment_image_keys: attachmentSlots.map((s) => s.key).filter(Boolean),
      affiliateLinks: affiliateLinks.filter((link) => link.url),
      tags,
      price: price ? Number(price) : undefined,
      showPrice,
      published,
    }

    try {
      if (!id) throw new Error('Invalid product id')
      const res = await apiFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '保存に失敗しました' }))
        throw new Error(err.error)
      }

      toast({ title: '更新完了', description: '商品情報を更新しました' })
      router.push('/admin/products')
      router.refresh()
    } catch (e: any) {
      console.error('product update error', e)
      toast({ variant: 'destructive', title: 'エラー', description: e.message || '商品更新中にエラーが発生しました' })
    }
  }

  // NOTE:
  // Do not block the entire page render while loading product data.
  // Render the edit UI immediately (with empty state / disabled actions)
  // and let the client-side effect populate the form when the API
  // call completes. This prevents the dashboard-only shell from
  // appearing and ensures the AdminLayout (whoami) controls only
  // authentication, not individual page data fetching.

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
            <h1 className="text-2xl font-bold">商品を編集</h1>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
        <Button onClick={handleSave} size="lg" disabled={!title || !mainImageKey}>
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="space-y-6">
        {/* フォーム（元実装と同じ） */}
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
                onChange={(f) => setMainFile(f)}
                aspectRatioType="product"
                onUploadComplete={(key) => {
                  if (key) {
                    setMainImageKey(key)
                    try { setMainImagePreview(getPublicImageUrl(key) || '') } catch (e) {}
                    setMainFile(null)
                  }
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
                      if (next[index]) next[index] = { ...next[index], key }
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
                      value={affiliateTemplateOptions.find((t) => t.name === link.provider)?.id || ""}
                      onValueChange={(value) => applyAffiliateTemplate(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {affiliateTemplateOptions.length === 0 ? (
                          <SelectItem value="__no-template__" disabled>テンプレートがありません</SelectItem>
                        ) : (
                          affiliateTemplateOptions.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                  </div>
                </div>
                {affiliateLinks.length > 0 && (
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
