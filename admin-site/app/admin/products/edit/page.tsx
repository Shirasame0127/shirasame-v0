"use client"

import { useEffect, useState, useRef } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

// Extract canonical key from various possible server values (full URL, /cdn-cgi/image/... prefixed URL, or raw key)
function extractKeyFromUrl(u: any): string | null {
  if (!u || typeof u !== 'string') return null
  try {
    const url = new URL(u)
    let p = url.pathname.replace(/^\/+/, '')
    // strip possible /cdn-cgi/image/.../ prefix
    p = p.replace(/^cdn-cgi\/image\/[^\/]+\//, '')
    return p || null
  } catch (e) {
    // not a URL — maybe it's already a key
    if (typeof u === 'string' && u.length > 0) return u
    return null
  }
}

export default function ProductEditPageQuery() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  const search = useSearchParams()
  const id = search?.get ? search.get('id') : null

  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [body, setBody] = useState("")
  const [notes, setNotes] = useState("")
  const [attachmentSlots, setAttachmentSlots] = useState<AttachmentSlot[]>(() =>
    Array.from({ length: 4 }).map(() => ({ file: null, key: "" }))
  )

  const addInputRef = useRef<HTMLInputElement | null>(null)
  const replaceInputRef = useRef<HTMLInputElement | null>(null)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  const ensureSlotsLength = (slots: AttachmentSlot[] | any[]) => {
    const next = (slots || []).slice(0, 4).map((s: any) => ({ file: s.file || null, key: s.key || "" }))
    while (next.length < 4) next.push({ file: null, key: "" })
    return next
  }
  const [relatedLinks, setRelatedLinks] = useState<string[]>([""])
  const [price, setPrice] = useState("")
  const [showPrice, setShowPrice] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagGroup, setNewTagGroup] = useState("")
  const [newTagLinkUrl, setNewTagLinkUrl] = useState("")
  const [newTagLinkLabel, setNewTagLinkLabel] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
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
        // Prefer new product-level column when present
        if (data && data.main_image_key) {
          const raw = data.main_image_key || ''
          const normalized = extractKeyFromUrl(raw) || String(raw || '')
          setMainImageKey(normalized)
          try { setMainImagePreview(getPublicImageUrl(db.images.getUpload(normalized) || normalized) || '') } catch (e) {}
        }
        
        if (Array.isArray(data.affiliateLinks) && data.affiliateLinks.length > 0) {
          // Normalize provider to template id when possible (store id instead of display name)
          const normalized = (data.affiliateLinks || []).map((l: any) => {
            const prov = l.provider || ''
            const matchedKey = Object.keys(KNOWN_AFFILIATE_TEMPLATES).find((k) => KNOWN_AFFILIATE_TEMPLATES[k].name === prov || k === prov)
            return { provider: matchedKey || prov || '', url: l.url || '', label: l.label || '' }
          })
          setAffiliateLinks(normalized)
        }

        if (Array.isArray(data.images) && data.images.length > 0) {
          const main = data.images.find((img: any) => img.role === 'main') || data.images[0]
          if (main && (main.key || main.basePath || main.url)) {
            // Persisted key resolution: prefer `key` then `basePath` then fall back to url.
            // Normalize any URL (strip domain and possible /cdn-cgi/image/... prefix)
            const rawCandidate = main.key || main.basePath || main.url || ''
            const normalized = extractKeyFromUrl(rawCandidate) || String(rawCandidate || '')
            // only set if main_image_key wasn't already preferred above
            if (!data || !data.main_image_key) {
              setMainImageKey(normalized)
              try { setMainImagePreview(getPublicImageUrl(db.images.getUpload(normalized) || normalized) || '') } catch (e) {}
            }
          }
          const attachmentsByRole = data.images.filter((img: any) => img.role === 'attachment')
          let attachments: any[] = []
          if (attachmentsByRole.length > 0) {
            attachments = attachmentsByRole
          } else {
            attachments = data.images.filter((img: any) => img !== main)
          }
          // Persist attachments as key-only. Normalize keys/URLs to canonical key form.
          setAttachmentSlots(ensureSlotsLength(
            attachments
              .slice(0, 4)
              .map((img: any) => {
                const raw = img.key || img.basePath || img.url || ''
                const normalized = extractKeyFromUrl(raw) || String(raw || '')
                return { file: null, key: normalized }
              })
          ))
          try { console.log('[product-edit] attachments resolved from images[]', attachments.map((a:any) => a.key || a.basePath || null)) } catch (e) {}
        }
        // If product exposes attachment_image_keys use them as authoritative
        if (data && Array.isArray(data.attachment_image_keys) && data.attachment_image_keys.length > 0) {
          setAttachmentSlots(ensureSlotsLength(
            (data.attachment_image_keys || [])
              .slice(0, 4)
              .map((k: any) => ({ file: null, key: extractKeyFromUrl(k) || String(k || '') }))
          ))
          try { console.log('[product-edit] attachment_image_keys from server', data.attachment_image_keys) } catch (e) {}
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

  const addNewTag = async () => {
    const trimmedName = newTagName.trim()
    if (!trimmedName) {
      toast({ variant: 'destructive', title: 'エラー', description: 'タグ名を入力してください' })
      return
    }

    // Prevent duplicates
    const existing = Object.values(tagGroups || {}).flat()
    if (existing.includes(trimmedName)) {
      toast({ variant: 'destructive', title: 'エラー', description: '同じ名前のタグが既に存在します' })
      return
    }

    if (newTagGroup === 'リンク先' && !newTagLinkLabel.trim()) {
      toast({ variant: 'destructive', title: 'エラー', description: 'リンク先グループに追加する場合は、リンクボタンのテキストを必ず入力してください' })
      return
    }

    const payload = {
      name: trimmedName,
      group: newTagGroup && newTagGroup !== '__uncategorized__' ? newTagGroup : undefined,
      linkUrl: newTagLinkUrl && newTagLinkUrl.trim() ? newTagLinkUrl.trim() : undefined,
      linkLabel: newTagLinkLabel && newTagLinkLabel.trim() ? newTagLinkLabel.trim() : undefined,
    }

    try {
      const res = await apiFetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('save failed')

      // refresh tags and groups
      const tagsRes = await apiFetch('/api/tags')
      const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
      const serverTags = Array.isArray(tagsJson) ? tagsJson : tagsJson.data || []

      const groupsRes = await apiFetch('/api/tag-groups')
      const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))
      const serverGroups = Array.isArray(groupsJson) ? groupsJson : groupsJson.data || []

      const finalTags = Array.isArray(serverTags) && serverTags.length > 0 ? serverTags : db.tags.getAllWithPlaceholders()
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

      setNewTagName('')
      setNewTagGroup('')
      setNewTagLinkUrl('')
      setNewTagLinkLabel('')
      setIsAddDialogOpen(false)

      toast({ title: '追加完了', description: `タグ「${trimmedName}」を追加しました` })
    } catch (e) {
      console.error('addNewTag failed', e)
      // fallback: add locally so user can continue
      setAvailableTags((prev) => [...prev, { name: trimmedName, group: newTagGroup }])
      setTagGroups((prev) => {
        const g = newTagGroup || '未分類'
        const next = { ...prev }
        next[g] = [...(next[g] || []), trimmedName]
        return next
      })
      setNewTagName('')
      setNewTagGroup('')
      setNewTagLinkUrl('')
      setNewTagLinkLabel('')
      setIsAddDialogOpen(false)
      toast({ variant: 'destructive', title: 'サーバ同期失敗', description: 'タグはローカルに保存されました' })
    }
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
    // allow clearing selection (empty string) which unsets provider
    if (templateTag === "") {
      const updated = [...affiliateLinks]
      updated[index] = { ...updated[index], provider: "" }
      setAffiliateLinks(updated)
      return
    }
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
    // Store the template id (tag) as provider so Select value can bind directly to it
    // Overwrite URL and label with the template values on selection
    updated[index] = {
      ...updated[index],
      provider: template.id,
      label: template.defaultLabel,
      url: template.defaultUrl,
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
      const next = [...(prev || [])]
      while (next.length < index + 1) next.push({ file: null, key: "" })
      next[index] = { ...(next[index] || { file: null, key: "" }), file }
      return ensureSlotsLength(next)
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
    setAttachmentSlots((prev) => ensureSlotsLength([...(prev || []), { file: null, key: "" }]))
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
        // update preview to use responsive helper when possible
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
      setAttachmentSlots(ensureSlotsLength(newAttachmentSlots))
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
      affiliateLinks: affiliateLinks
        .filter((link) => link.url)
        .map((l) => ({
          ...l,
          provider: affiliateTemplateOptions.find((t) => t.id === l.provider)?.name || l.provider,
        })),
      tags,
      price: price ? Number(price) : undefined,
      showPrice,
      published,
      // persist authoritative keys when available
      main_image_key: finalMainKey || mainImageKey,
      attachment_image_keys: finalAttachmentSlots.map((s: any) => s.key).filter(Boolean),
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

  const mainImageValue = getPublicImageUrl(db.images.getUpload(mainImageKey) || mainImageKey) || mainImagePreview || ""

  return (
    <div className="w-full px-4 py-6">
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
        <Card>
          <CardHeader>
            <CardTitle>商品画像 *</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
                value={mainImageValue}
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <div className="flex gap-2 items-center">
                  <DialogTrigger asChild>
                    <Button type="button">カスタムタグを追加</Button>
                  </DialogTrigger>
                </div>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新しいタグを追加</DialogTitle>
                    <DialogDescription>タグ名、グループ、リンク情報を入力してください</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>タグ名 *</Label>
                      <Input placeholder="例: プログラミング" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>グループ名（任意）</Label>
                      <Select value={newTagGroup || "__uncategorized__"} onValueChange={setNewTagGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder="未分類" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__uncategorized__">未分類</SelectItem>
                          {Object.keys(tagGroups || {}).map((name) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="または新しいグループ名を入力" value={newTagGroup} onChange={(e) => setNewTagGroup(e.target.value)} className="mt-2" />
                      <p className="text-xs text-muted-foreground">同じグループのタグをまとめて表示できます</p>
                    </div>

                    <div className="space-y-2">
                      <Label>リンク先URL（任意）</Label>
                      <Input placeholder="https://amazon.co.jp" value={newTagLinkUrl} onChange={(e) => setNewTagLinkUrl(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>リンクボタンのテキスト{newTagLinkUrl.trim() && " *"}</Label>
                      <Input placeholder="例: Amazonで見る" value={newTagLinkLabel} onChange={(e) => setNewTagLinkLabel(e.target.value)} />
                      <p className="text-xs text-muted-foreground">商品編集時にアフィリエイトリンクのラベルとして自動入力されます</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
                      <Button onClick={addNewTag}><Plus className="w-4 h-4 mr-1" />追加</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <div className="flex items-center justify-between">
                <CardTitle>添付画像（最大4枚）</CardTitle>
              </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
              <input ref={addInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                try {
                  const u = await uploadFile(f)
                  const k = (u as any)?.key
                  if (!k) throw new Error('upload failed')
                  // put into first empty slot
                  setAttachmentSlots((prev) => {
                    const next = ensureSlotsLength([...(prev || [])])
                    const idx = next.findIndex((s) => !s.key)
                    const useIdx = idx === -1 ? next.length : idx
                    while (next.length < useIdx + 1) next.push({ file: null, key: "" })
                    next[useIdx] = { file: null, key: k }
                    return ensureSlotsLength(next)
                  })
                } catch (err) {
                  console.error('add attachment upload failed', err)
                  toast({ variant: 'destructive', title: 'アップロード失敗' })
                } finally { if (addInputRef.current) addInputRef.current.value = '' }
              }} />

              <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f || replaceIndex === null) return
                const idx = replaceIndex
                try {
                  const u = await uploadFile(f)
                  const k = (u as any)?.key
                  if (!k) throw new Error('upload failed')
                  setAttachmentSlots((prev) => {
                    const next = ensureSlotsLength([...(prev || [])])
                    while (next.length < idx + 1) next.push({ file: null, key: "" })
                    next[idx] = { file: null, key: k }
                    return ensureSlotsLength(next)
                  })
                } catch (err) {
                  console.error('replace attachment upload failed', err)
                  toast({ variant: 'destructive', title: 'アップロード失敗' })
                } finally { setReplaceIndex(null); if (replaceInputRef.current) replaceInputRef.current.value = '' }
              }} />

              {/* Existing attachments thumbnails */}
              {attachmentSlots.filter(s => s.key).map((slot, idx) => (
                <div key={idx} className="relative w-full sm:w-1/2 lg:w-1/4 border rounded overflow-hidden">
                  <img src={getPublicImageUrl(db.images.getUpload(slot.key) || slot.key) || ''} alt={`attachment-${idx}`} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button type="button" className="bg-white/90 rounded p-1" onClick={() => { setReplaceIndex(idx); replaceInputRef.current?.click() }} title="入れ替え">
                      置換
                    </button>
                    <button type="button" className="bg-white/90 rounded p-1" onClick={() => {
                      setAttachmentSlots((prev) => {
                        const next = (prev || []).slice()
                        if (idx >= 0 && idx < next.length) next.splice(idx, 1)
                        return ensureSlotsLength(next)
                      })
                    }} title="削除">
                      削除
                    </button>
                  </div>
                </div>
              ))}

              {/* Single add button when less than 4 attachments */}
              {attachmentSlots.filter(s => s.key).length < 4 && (
                <div className="w-full sm:w-1/2 lg:w-1/4 flex items-center justify-center border rounded p-4">
                  <Button onClick={() => addInputRef.current?.click()} variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> 追加
                  </Button>
                </div>
              )}
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
                      onValueChange={(value) => applyAffiliateTemplate(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                          {/* explicit empty option to represent "選択なし" */}
                          <SelectItem value="">選択なし</SelectItem>
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
