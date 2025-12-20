"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db/storage"
import { getPublicImageUrl, buildResizedImageUrl } from "@/lib/image-url"
import type { SocialLink } from "@/lib/db/schema"
import { Save, Plus, Trash2, CheckCircle2, XCircle, Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useToast } from "@/hooks/use-toast"
import { fileToBase64 } from "@/lib/utils/image-utils"
import apiFetch from '@/lib/api-client'

const generateSocialUrl = (platform: string, username: string): string => {
  const cleanUsername = username.replace(/^@/, "")
  const urlMap: Record<string, string> = {
    x: `https://x.com/${cleanUsername}`,
    tiktok: `https://www.tiktok.com/@${cleanUsername}`,
    youtube: `https://www.youtube.com/@${cleanUsername}`,
    instagram: `https://www.instagram.com/${cleanUsername}`,
    twitch: `https://www.twitch.tv/${cleanUsername}`,
    discord: `https://discord.gg/${cleanUsername}`,
    note: `https://note.com/${cleanUsername}`,
  }
  return urlMap[platform] || ""
}

const validateSocialUrl = (platform: string, url: string): boolean => {
  const patterns: Record<string, RegExp> = {
    x: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/?$/,
    tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[A-Za-z0-9_.]+\/?$/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/@[A-Za-z0-9_-]+\/?$/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/,
    twitch: /^https?:\/\/(www\.)?twitch\.tv\/[A-Za-z0-9_]+\/?$/,
    discord: /^https?:\/\/(www\.)?discord\.gg\/[A-Za-z0-9_-]+\/?$/,
    note: /^https?:\/\/(www\.)?note\.com\/[A-Za-z0-9_]+\/?$/,
    email: /^mailto:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/,
    form: /^https?:\/\/.+$/,
  }
  return patterns[platform]?.test(url) ?? false
}

const checkAccountExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD", mode: "no-cors" })
    return true
  } catch {
    return false
  }
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  // store uploaded image KEY (R2/Supabase key), not a full URL
  const [avatarUploadedKey, setAvatarUploadedKey] = useState<string | null>(null)
  const [headerImageKeys, setHeaderImageKeys] = useState<string[]>([]) // キー配列で管理
  const [newHeaderImageFile, setNewHeaderImageFile] = useState<File | null>(null)
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [verificationStatus, setVerificationStatus] = useState<
    Record<number, "idle" | "checking" | "valid" | "invalid">
  >({})
  const [amazonAccessKey, setAmazonAccessKey] = useState("")
  const [amazonSecretKey, setAmazonSecretKey] = useState("")
  const [amazonAssociateId, setAmazonAssociateId] = useState("")
  const { toast } = useToast()
  const [, setSiteSettingsTick] = useState(0)

  // Sanitize server-provided user row into a client-friendly updates object
  function sanitizeServerUserForCache(srv: any) {
    if (!srv) return {}
    // Only accept canonical key-based fields from server. Do not read legacy full-URL fields.
    const headerKeysRaw = srv.header_image_keys || srv.headerImageKeys || []
    function extractKeyFromUrl(u: any) {
      if (!u || typeof u !== 'string') return null
      try {
        const url = new URL(u)
        let p = url.pathname.replace(/^\/+/, '')
        p = p.replace(/^cdn-cgi\/image\/[^\/]+\//, '')
        return p || null
      } catch (e) {
        if (u.includes('/')) return u
        return null
      }
    }

    const headerKeys = Array.isArray(headerKeysRaw)
      ? headerKeysRaw.map(extractKeyFromUrl).filter(Boolean)
      : typeof headerKeysRaw === 'string'
      ? [extractKeyFromUrl(headerKeysRaw)].filter(Boolean)
      : []

    return {
      displayName: srv.display_name || srv.displayName || srv.name || null,
      bio: srv.bio || null,
      email: srv.email || null,
      backgroundType: srv.background_type || srv.backgroundType || null,
      backgroundValue: srv.background_value || srv.backgroundValue || null,
      // Do not read or expose full URL fields. Use keys only.
      profileImage: null,
      profileImageKey: srv.profile_image_key || srv.profileImageKey || null,
      avatarUrl: null,
      headerImageKeys: headerKeys,
      amazonAccessKey: srv.access_key || srv.amazon_access_key || srv.amazonAccessKey || null,
      amazonSecretKey: srv.secret_key || srv.amazon_secret_key || srv.amazonSecretKey || null,
      amazonAssociateId: srv.associate_id || srv.amazon_associate_id || srv.amazonAssociateId || null,
    }
  }

  // Helper used elsewhere in this module to convert CDN/full URLs into R2 keys when possible
  function extractKey(u: any) {
    if (!u) return null
    try {
      const url = new URL(u)
      let p = url.pathname.replace(/^\/+/, '')
      p = p.replace(/^cdn-cgi\/image\/[^\/]+\//, '')
      return p || null
    } catch (e) {
      return typeof u === 'string' && u.includes('/') ? u : null
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await apiFetch('/api/site-settings')
        const json = await res.json().catch(() => null)
        // Support responses like { data: {...} } or { data: { data: {...} } }
        let serverUser = json?.data ?? json
        if (serverUser && typeof serverUser === 'object' && 'data' in serverUser) serverUser = (serverUser as any).data
        if (serverUser && mounted) {
          try { console.log('[settings] serverUser loaded:', serverUser) } catch (e) {}
          setUser(serverUser)
          setDisplayName(serverUser.displayName || "")
          setBio(serverUser.bio || "")
          setEmail(serverUser.email || "")
          setBackgroundType(serverUser.backgroundType || "color")
          setBackgroundColor(serverUser.backgroundValue || "#ffffff")
          // socialLinks may be stored as a JSON string; parse when necessary
          try {
            const sl = serverUser.socialLinks
            if (typeof sl === 'string') {
              setSocialLinks(JSON.parse(sl))
            } else {
              setSocialLinks(sl || [])
            }
          } catch (e) {
            setSocialLinks([])
          }
          setAmazonAccessKey(serverUser.amazonAccessKey || "")
          setAmazonSecretKey(serverUser.amazonSecretKey || "")
          setAmazonAssociateId(serverUser.amazonAssociateId || "")
          // headerImageKeys may be a JSON string or array; normalize to string[] of keys
          let headerKeysFromServer: string[] = []
          try {
            const hk = serverUser.headerImageKeys || serverUser.header_image_keys || serverUser.headerImageKey || serverUser.header_image_key || serverUser.headerImages || serverUser.header_images || serverUser.headerImage || serverUser.header_image
            if (typeof hk === 'string') {
              try {
                const parsed = JSON.parse(hk)
                if (Array.isArray(parsed)) headerKeysFromServer = parsed.map(extractKey).filter(Boolean)
                else headerKeysFromServer = [String(extractKey(hk))].filter(Boolean)
              } catch {
                // treat as single key string
                const k = extractKey(hk)
                if (k) headerKeysFromServer = [k]
              }
            } else if (Array.isArray(hk)) {
              headerKeysFromServer = hk.map(extractKey).filter(Boolean)
            } else if (hk) {
              const k = extractKey(hk)
              if (k) headerKeysFromServer = [k]
            }
          } catch (e) {
            headerKeysFromServer = []
          }
          setHeaderImageKeys(headerKeysFromServer)

          // profile image may be provided as key or full URL. If it's a key (no '/'), keep as-is.
          try { console.log('[settings] profileImage/profileImageKey:', serverUser.profileImage, serverUser.profileImageKey, serverUser.profile_image_key) } catch (e) {}
          if (serverUser.profileImage) setAvatarUploadedKey(extractKey(serverUser.profileImage) || serverUser.profileImage)
          else if (serverUser.profileImageKey || serverUser.profile_image_key) setAvatarUploadedKey((serverUser.profileImageKey || serverUser.profile_image_key) as string)
          try {
            await db.siteSettings.refresh()
            if (mounted) setSiteSettingsTick((t) => t + 1)
          } catch (e) {}
          return
        }

        // fallback to local cache if server has no data or call failed
        const currentUser = db.user.get()
        if (currentUser && mounted) {
          setUser(currentUser)
          setDisplayName(currentUser.displayName)
          setBio(currentUser.bio || "")
          setEmail(currentUser.email || "")
          setBackgroundType(currentUser.backgroundType || "color")
          setBackgroundColor(currentUser.backgroundValue || "#ffffff")
          // normalize socialLinks stored as JSON string
          try {
            const csl = currentUser.socialLinks || currentUser.social_links
            if (typeof csl === 'string') setSocialLinks(JSON.parse(csl))
            else setSocialLinks(csl || [])
          } catch (e) {
            setSocialLinks([])
          }
          setAmazonAccessKey(currentUser.amazonAccessKey || "")
          setAmazonSecretKey(currentUser.amazonSecretKey || "")
          setAmazonAssociateId(currentUser.amazonAssociateId || "")
          // normalize headerImageKeys for cached user
          try {
            const chk = currentUser.headerImageKeys || currentUser.header_image_keys || currentUser.headerImageKey || currentUser.header_image_key || currentUser.headerImages || currentUser.header_images
            if (typeof chk === 'string') {
              try {
                const parsed = JSON.parse(chk)
                setHeaderImageKeys(Array.isArray(parsed) ? parsed.map(extractKey).filter(Boolean) : [extractKey(chk)].filter(Boolean))
              } catch {
                setHeaderImageKeys(chk ? [extractKey(chk)].filter(Boolean) : [])
              }
            } else if (Array.isArray(chk)) {
              setHeaderImageKeys(chk.map(extractKey).filter(Boolean))
            } else {
              setHeaderImageKeys(currentUser.headerImageKeys || (currentUser.headerImageKey ? [currentUser.headerImageKey] : []))
            }
          } catch (e) {
            setHeaderImageKeys(currentUser.headerImageKeys || (currentUser.headerImageKey ? [currentUser.headerImageKey] : []))
          }

          if (currentUser.profileImage) setAvatarUploadedKey(extractKey(currentUser.profileImage))
          else if (currentUser.profileImageKey || currentUser.profile_image_key) setAvatarUploadedKey(extractKey(currentUser.profileImageKey || currentUser.profile_image_key))
        }
      } catch (e) {
        const currentUser = db.user.get()
        if (currentUser && mounted) {
          setUser(currentUser)
          setDisplayName(currentUser.displayName)
          setBio(currentUser.bio || "")
          setEmail(currentUser.email || "")
          setBackgroundType(currentUser.backgroundType || "color")
          setBackgroundColor(currentUser.backgroundValue || "#ffffff")
            try {
              const csl = currentUser.socialLinks || currentUser.social_links
              if (typeof csl === 'string') setSocialLinks(JSON.parse(csl))
              else setSocialLinks(csl || [])
            } catch (e) {
              setSocialLinks([])
            }
          setAmazonAccessKey(currentUser.amazonAccessKey || "")
          setAmazonSecretKey(currentUser.amazonSecretKey || "")
          setAmazonAssociateId(currentUser.amazonAssociateId || "")
          try {
            const chk = currentUser.headerImageKeys || currentUser.header_image_keys || currentUser.headerImageKey || currentUser.header_image_key
            if (typeof chk === 'string') {
              try { const parsed = JSON.parse(chk); setHeaderImageKeys(Array.isArray(parsed) ? parsed.map(extractKey).filter(Boolean) : [extractKey(chk)].filter(Boolean)) } catch { setHeaderImageKeys(chk ? [extractKey(chk)].filter(Boolean) : []) }
            } else if (Array.isArray(chk)) {
              setHeaderImageKeys(chk.map(extractKey).filter(Boolean))
            } else {
              setHeaderImageKeys(currentUser.headerImageKeys || (currentUser.headerImageKey ? [currentUser.headerImageKey] : []))
            }
          } catch (e) {
            setHeaderImageKeys(currentUser.headerImageKeys || (currentUser.headerImageKey ? [currentUser.headerImageKey] : []))
          }
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "x", url: "", username: "" }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
    const newStatus = { ...verificationStatus }
    delete newStatus[index]
    setVerificationStatus(newStatus)
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value } as SocialLink

    if (field === "username" && value && !["email", "form"].includes(updated[index].platform)) {
      const generatedUrl = generateSocialUrl(updated[index].platform, value)
      updated[index].url = generatedUrl
    }

    setSocialLinks(updated)
    setVerificationStatus({ ...verificationStatus, [index]: "idle" })
  }

  const verifySocialLink = async (index: number) => {
    const link = socialLinks[index]
    if (!link.url) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "URLを入力してください",
      })
      return
    }

    setVerificationStatus({ ...verificationStatus, [index]: "checking" })

    const isValidFormat = validateSocialUrl(link.platform, link.url)

    if (!isValidFormat) {
      setVerificationStatus({ ...verificationStatus, [index]: "invalid" })
      toast({
        variant: "destructive",
        title: "エラー",
        description: `${link.platform}の正しいURL形式ではありません`,
      })
      return
    }

    const exists = await checkAccountExists(link.url)

    if (exists) {
      setVerificationStatus({ ...verificationStatus, [index]: "valid" })
      toast({
        title: "確認完了",
        description: "アカウントの形式が正しいことを確認しました！",
      })
    } else {
      setVerificationStatus({ ...verificationStatus, [index]: "invalid" })
      toast({
        variant: "destructive",
        title: "エラー",
        description: "アカウントの確認ができませんでした",
      })
    }
  }

  const addHeaderImage = async () => {
    if (newHeaderImageFile) {
      try {
        const fd = new FormData()
        fd.append('file', newHeaderImageFile)
        const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd })
        const json = await res.json().catch(() => null)
        const uploadedKey = json?.result?.key || json?.key || null
        if (uploadedKey) {
          const newKeys = [...headerImageKeys, uploadedKey]
          setHeaderImageKeys(newKeys)
          setNewHeaderImageFile(null)
          // Persist keys immediately
          try {
            const payload: any = { headerImageKeys: newKeys }
            const saveRes = await apiFetch('/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (saveRes.ok) {
              const saved = await saveRes.json().catch(() => null)
              if (saved?.data) {
                setUser(saved.data)
                try { db.user.update(saved.data.id || user?.id || 'local', sanitizeServerUserForCache(saved.data)) } catch (e) {}
              }
            }
          } catch (e) {}

          toast({ title: '追加完了', description: 'ヘッダー画像を追加しました' })
        } else {
          toast({ variant: 'destructive', title: 'アップロード失敗', description: '画像アップロードに失敗しました' })
        }
      } catch (e) {
        console.error(e)
        toast({ variant: 'destructive', title: 'エラー', description: '画像アップロード中にエラーが発生しました' })
      }
    }
  }

  // 新しい画像を選択したら自動で追加するハンドラ（ユーザーの追加操作を簡単にする）
  const handleNewHeaderFile = async (file: File | null) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await apiFetch("/api/images/upload", { method: "POST", body: fd })
      const json = await res.json()
      // prefer a returned key from the upload API
      const uploadedKey = json?.result?.key || null
      if (uploadedKey) {
        // Store the key in headerImageKeys
        const newKeys = [...headerImageKeys, uploadedKey]
        setHeaderImageKeys(newKeys)

        // Persist immediately to server so refresh retains images
        try {
          const payload: any = { headerImageKeys: newKeys }
          const saveRes = await apiFetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (saveRes.ok) {
            const saved = await saveRes.json().catch(() => null)
            if (saved?.data) {
              setUser(saved.data)
              try { db.user.update(saved.data.id || user?.id || 'local', sanitizeServerUserForCache(saved.data)) } catch (e) {}
            }
          } else {
            console.warn('[settings] failed to persist header images to server')
          }
        } catch (e) {
          console.error('[settings] error persisting header images', e)
        }

        toast({ title: '追加完了', description: 'ヘッダー画像を追加しました' })
      } else {
        toast({ variant: "destructive", title: "アップロード失敗", description: "画像アップロードに失敗しました" })
      }
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "エラー", description: "画像アップロード中にエラーが発生しました" })
    }
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const keys = [...headerImageKeys]
    const [moved] = keys.splice(fromIndex, 1)
    keys.splice(toIndex, 0, moved)
    setHeaderImageKeys(keys)

    // Persist order immediately
    ;(async () => {
      try {
        const payload: any = { headerImageKeys: keys }
        const res = await apiFetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const json = await res.json().catch(() => null)
          if (json?.data) {
            setUser(json.data)
            try { db.user.update(json.data.id || user?.id || 'local', sanitizeServerUserForCache(json.data)) } catch (e) {}
          }
        }
      } catch (e) {
        console.error('[settings] reorder persist failed', e)
      }
    })()
  }

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // active.id / over.id are numeric string indices (we render items by index)
    const from = Number(String(active.id))
    const to = Number(String(over.id))
    if (Number.isNaN(from) || Number.isNaN(to)) return
    const newKeys = arrayMove(headerImageKeys, from, to)
    setHeaderImageKeys(newKeys)
  }

  function SortableItem({ id, index, imageUrl }: { id: string; index: number; imageUrl: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div ref={setNodeRef as any} style={style} {...attributes} className="space-y-2">
        <Label>ヘッダー画像 {index + 1}</Label>
        <div className="flex gap-3 items-center">
          <div className="w-40 h-24 relative rounded overflow-hidden bg-muted border">
            <img src={imageUrl} alt={`header-${index + 1}`} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <div className="inline-flex items-center gap-2" {...listeners}>
                <Button type="button" size="sm" variant="outline" title="ドラッグで並べ替え">
                  移動
                </Button>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => handleReorder(index, Math.max(0, index - 1))} title="左に移動">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleReorder(index, Math.min(headerImageKeys.length - 1, index + 1))} title="右に移動">
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleReorder(index, 0)} title="先頭にする">
                <Star className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2 items-start">
              <div className="flex-1">
                      <ImageUpload
                        value={imageUrl || ""}
                        onChange={async (file) => {
                          if (!file) return
                          try {
                            const oldKey = headerImageKeys[index]
                            const fd = new FormData()
                            fd.append('file', file)
                            const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd })
                            const json = await res.json().catch(() => null)
                            const uploadedKey = json?.result?.key || json?.key || null
                            if (uploadedKey) {
                              const newArr = [...headerImageKeys]
                              newArr[index] = uploadedKey
                              setHeaderImageKeys(newArr)

                              // Persist updated keys
                              try {
                                const payload: any = { headerImageKeys: newArr }
                                const saveRes = await apiFetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                                if (saveRes.ok) {
                                  const saved = await saveRes.json().catch(() => null)
                                  if (saved?.data) { setUser(saved.data); try { db.user.update(saved.data.id || user?.id || 'local', sanitizeServerUserForCache(saved.data)) } catch(e){} }
                                }
                              } catch (e) {}

                              // Delete old key asynchronously
                              if (oldKey) {
                                try { await apiFetch(`/api/images/${encodeURIComponent(String(oldKey))}`, { method: 'DELETE' }) } catch (e) { console.warn('failed to delete old image', e) }
                              }

                              toast({ title: "更新完了", description: `ヘッダー画像 ${index + 1} を更新しました` })
                            } else {
                              toast({ variant: 'destructive', title: 'アップロード失敗', description: '画像アップロードに失敗しました' })
                            }
                          } catch (e) {
                            console.error(e)
                            toast({ variant: 'destructive', title: 'エラー', description: '画像更新中にエラーが発生しました' })
                          }
                        }}
                        aspectRatioType="header"
                      />
              </div>

              <div className="flex flex-col gap-2">
                <Button type="button" variant="destructive" size="icon" onClick={() => removeHeaderImage(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compact thumbnail for horizontal list
  function SortableThumb({ id, index, imageUrl }: { id: string; index: number; imageUrl: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div ref={setNodeRef as any} style={style} {...attributes} className="inline-block">
        <button
          type="button"
          onClick={() => setEditingIndex(index)}
          className="w-28 h-16 rounded overflow-hidden border bg-muted mr-2 shrink-0"
        >
          <img src={imageUrl} alt={`header-thumb-${index + 1}`} className="w-full h-full object-cover" />
        </button>
        <div className="flex items-center justify-center mt-1 gap-1">
          <button {...listeners} className="text-xs text-muted-foreground">ドラッグ</button>
        </div>
      </div>
    )
  }

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const removeHeaderImage = (index: number) => {
    const removedKey = headerImageKeys[index]
    const newKeys = headerImageKeys.filter((_, i) => i !== index)
    setHeaderImageKeys(newKeys)

    // Attempt to delete the object from R2 + DB, then persist updated keys
    ;(async () => {
      try {
        // Best-effort: attempt to delete the key from server storage
        if (removedKey) {
          try {
            await apiFetch(`/api/images/${encodeURIComponent(String(removedKey))}`, { method: 'DELETE' })
          } catch (e) {
            // log but continue — preserving keys state is primary
            console.warn('[settings] image delete request failed', e)
          }
        }

        const payload: any = { headerImageKeys: newKeys }
        const res = await apiFetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const json = await res.json().catch(() => null)
          if (json?.data) {
            setUser(json.data)
            try { db.user.update(json.data.id || user?.id || 'local', sanitizeServerUserForCache(json.data)) } catch (e) {}
          }
        }
      } catch (e) {
        console.error('[settings] remove persist failed', e)
      }
    })()

    toast({ title: '削除完了', description: 'ヘッダー画像を削除しました' })
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ユーザー情報が読み込まれていません",
      })
      return
    }

    // Clean social links: trim and drop entries without a URL
    const cleanedSocialLinks: SocialLink[] = socialLinks
      .map((l) => ({ ...l, url: (l.url || "").toString().trim(), username: (l.username || "").toString().trim() }))
      .filter((l) => l.url && l.url.length > 0)

    const updates: any = {
      displayName,
      bio,
      email,
      backgroundType,
      socialLinks: cleanedSocialLinks,
      headerImageKeys, // キー配列を保存
    }

    if (backgroundType === "color") {
      updates.backgroundValue = backgroundColor
    } else if (backgroundImageFile) {
      const bgKey = `background-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const imageBase64 = await fileToBase64(backgroundImageFile)
      db.images.saveUpload(bgKey, imageBase64)
      updates.backgroundImageKey = bgKey
      updates.backgroundValue = bgKey
    }

    if (avatarFile) {
      // If the image was uploaded via ImageUpload and returned a value, prefer key when provided.
                      if (avatarUploadedKey) {
        updates.profileImageKey = avatarUploadedKey
      } else {
        const avatarKey = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const avatarBase64 = await fileToBase64(avatarFile)
        db.images.saveUpload(avatarKey, avatarBase64)
        updates.profileImageKey = avatarKey
      }
    }

    // Save user-visible settings to the server via API
    try {
      // Avoid sending a local placeholder id (e.g. 'local') to the server —
      // that may trigger a forbidden check if owner resolution is active.
      const payload: any = { ...updates }
      const maybeId = user?.id
      if (maybeId && typeof maybeId === 'string' && !maybeId.startsWith('local')) {
        payload.id = maybeId
      }
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        // fallback to local cache if server write fails
        db.user.update(user?.id || 'local', updates)
        console.warn('[v0] server save failed, saved to local cache instead')
      } else {
        const json = await res.json().catch(() => null)
        const saved = json?.data
        if (saved) {
          setUser(saved)
          // also update local cache so UI that still reads db.user stays in sync
          try {
              db.user.update(saved.id || user?.id || 'local', sanitizeServerUserForCache(saved))
          } catch (e) {
            // ignore local cache update errors
          }
        }
        console.log('[v0] Saved settings to server:', saved || updates)
      }
    } catch (e) {
      console.error('Error saving settings to server', e)
      db.user.update(user?.id || 'local', updates)
    }

    // Save Amazon credentials securely via server-side API (do not store secret in client-accessible user record)
    try {
      // If all credential fields are empty, skip saving — user intentionally left blank
      const hasAnyCred = (amazonAccessKey || amazonSecretKey || amazonAssociateId)?.toString().trim().length > 0
      if (hasAnyCred) {
        const credRes = await apiFetch('/api/admin/amazon/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id || 'default',
            accessKey: amazonAccessKey,
            secretKey: amazonSecretKey,
            associateId: amazonAssociateId,
          }),
        })

        if (!credRes.ok) {
          let errJson: any = null
          let errText: string | null = null
          try {
            errJson = await credRes.json()
          } catch (e) {
            // ignore json parse error
          }
          try {
            // attempt to get raw text too (some errors may return empty json)
            errText = await credRes.text()
          } catch (e) {
            // ignore
          }
          console.error('Failed to save Amazon credentials', { status: credRes.status, json: errJson, text: errText })
          const message = errJson?.error || errJson?.message || (errText && errText.length > 0 ? errText : `HTTP ${credRes.status}`)
          toast({ variant: 'destructive', title: 'エラー', description: `Amazon認証情報の保存に失敗しました: ${message}` })
        } else {
          toast({ title: 'Amazon認証情報を保存しました' })
        }
      } else {
        // Nothing to save — skip without error
        console.log('[settings] Amazon credentials empty, skipping save')
      }
    } catch (e) {
      console.error('Error saving creds', e)
      toast({ variant: 'destructive', title: 'エラー', description: 'Amazon認証情報の保存中にエラーが発生しました' })
    }

    const updatedUser = db.user.get()
    if (updatedUser) {
      setUser(updatedUser)
      setDisplayName(updatedUser.displayName)
      setBio(updatedUser.bio || "")
      setEmail(updatedUser.email || "")
      setBackgroundType(updatedUser.backgroundType || "color")
      setBackgroundColor(updatedUser.backgroundValue || "#ffffff")
      setSocialLinks(updatedUser.socialLinks || [])
      setAmazonAccessKey(updatedUser.amazonAccessKey || "")
      setAmazonSecretKey(updatedUser.amazonSecretKey || "")
      setAmazonAssociateId(updatedUser.amazonAssociateId || "")
      setHeaderImageKeys(
        updatedUser.headerImageKeys || (updatedUser.headerImageKey ? [updatedUser.headerImageKey] : []),
      )
      setAvatarFile(null)
      setNewHeaderImageFile(null)
      setBackgroundImageFile(null)
    }

    toast({
      title: "保存完了",
      description: "設定を保存しました！",
    })
  }

  const headerImageUrls = headerImageKeys
    .map((key) => {
      if (!key) return null
      const candidate = typeof key === "string" && (key.startsWith("http") || key.startsWith("/")) ? key : db.images.getUpload(String(key)) || String(key)
      return getPublicImageUrl(candidate)
    })
    .filter(Boolean) as string[]
  const profileImageUrl = getPublicImageUrl(
    // prefer client-side uploaded KEY when available
    (avatarUploadedKey ? (db.images.getUpload(avatarUploadedKey) || avatarUploadedKey) : (user?.profileImageKey ? (db.images.getUpload(user.profileImageKey) || user.profileImageKey) : user?.avatarUrl || user?.profileImage)) || null,
  )

  // Normalize loading_animation value which may be stored as string or object
  const loadingAnimationRaw = db.siteSettings.getValue('loading_animation')
  const loadingAnimationUrl = (() => {
    if (!loadingAnimationRaw) return ''
    if (typeof loadingAnimationRaw === 'string') return getPublicImageUrl(loadingAnimationRaw) || loadingAnimationRaw
    if (typeof loadingAnimationRaw === 'object') {
      // support both legacy { url } and new { key } shapes
      if (loadingAnimationRaw?.key) return getPublicImageUrl(db.images.getUpload(loadingAnimationRaw.key) || loadingAnimationRaw.key) || ''
      return getPublicImageUrl(loadingAnimationRaw?.url) || loadingAnimationRaw?.url || ''
    }
    return ''
  })()

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">設定</h1>
          <p className="text-muted-foreground">サイトとプロフィールの設定</p>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール設定</CardTitle>
            <CardDescription>公開ページに表示される情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>プロフィール画像</Label>
              <div className="max-w-[200px]">
                <ImageUpload value={profileImageUrl || ""} onChange={setAvatarFile} aspectRatioType="profile" onUploadComplete={(key) => setAvatarUploadedKey(key)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>公開ページローディングアニメーション</CardTitle>
            <CardDescription>公開ページを開いた際に中央に表示するアニメーション（GIF）。1:1 にトリミングされます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>アップロード（GIF推奨）</Label>
              <div className="max-w-[300px] mt-2">
                <ImageUpload
                  value={loadingAnimationUrl || ''}
                  onChange={() => {}}
                  aspectRatioType={'product'}
                  onUploadComplete={async (key) => {
                    // ImageUpload now returns canonical key; persist key-only
                    if (!key) return
                    try {
                      await apiFetch('/api/site-settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'loading_animation', value: { key } }),
                      })
                      // refresh local cache
                      try { db.siteSettings.refresh().catch(() => {}) } catch (e) {}
                      toast({ title: '保存しました' })
                    } catch (e) {
                      toast({ variant: 'destructive', title: '保存に失敗しました' })
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label>現在のアニメーション</Label>
              <div className="mt-2">
                {loadingAnimationUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={loadingAnimationUrl} alt="loading" className="w-24 h-24 object-cover rounded-md border" />
                ) : (
                  <p className="text-sm text-muted-foreground">未設定</p>
                )}
              </div>
            </div>
            <div>
              <Button variant="ghost" onClick={async () => {
                try {
                  await apiFetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'loading_animation', value: { key: null } }) })
                  try { db.siteSettings.refresh().catch(() => {}) } catch (e) {}
                  toast({ title: 'クリアしました' })
                } catch (e) {
                  toast({ variant: 'destructive', title: 'クリアに失敗しました' })
                }
              }}>クリア</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SNSリンク</CardTitle>
                <CardDescription>
                  X、TikTok、YouTube、Instagram、Twitch、Discord、note、メール、フォームのリンク
                </CardDescription>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addSocialLink}>
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.map((link, index) => {
              const status = verificationStatus[index] || "idle"

              return (
                <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>プラットフォーム</Label>
                      <Select
                        value={link.platform}
                        onValueChange={(
                          value:
                            | "x"
                            | "tiktok"
                            | "youtube"
                            | "instagram"
                            | "email"
                            | "form"
                            | "twitch"
                            | "discord"
                            | "note",
                        ) => updateSocialLink(index, "platform", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="x">X (Twitter)</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitch">Twitch</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                          <SelectItem value="note">note</SelectItem>
                          <SelectItem value="email">メール</SelectItem>
                          <SelectItem value="form">フォーム</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!["email", "form"].includes(link.platform) && (
                      <div className="space-y-2">
                        <Label>ユーザー名</Label>
                        <Input
                          placeholder="例: shirasame（@なしでもOK）"
                          value={link.username}
                          onChange={(e) => updateSocialLink(index, "username", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">ユーザー名を入力するとURLが自動生成されます</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>
                        {link.platform === "email"
                          ? "メールアドレス"
                          : link.platform === "form"
                            ? "フォームURL"
                            : "URL"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={
                            link.platform === "email"
                              ? "mailto:your@email.com"
                              : link.platform === "form"
                                ? "https://forms.example.com/..."
                                : "https://..."
                          }
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                          className={
                            status === "valid" ? "border-green-500" : status === "invalid" ? "border-red-500" : ""
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => verifySocialLink(index)}
                          disabled={!link.url || status === "checking"}
                          title="アカウントを確認"
                        >
                          {status === "checking" ? (
                            <Loader2 className="w-4 h-4" />
                          ) : status === "valid" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : status === "invalid" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {status === "valid" && (
                        <p className="text-xs text-green-600">URLの形式が正しいことを確認しました</p>
                      )}
                      {status === "invalid" && <p className="text-xs text-red-600">URLの形式が正しくありません</p>}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
            {socialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">SNSリンクが登録されていません</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle>ヘッダー画像</CardTitle>
              <CardDescription>プロフィールヘッダーに表示される画像（順序を並べ替え、先頭が優先表示されます）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={headerImageKeys.map((_, i) => String(i))} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {headerImageKeys.map((key, index) => {
                      const candidate = db.images.getUpload(key) || String(key)
                      const url = getPublicImageUrl(candidate) || "/placeholder.svg"
                      // Use an index-based id for dnd-kit and make React key stable by suffixing the index
                      return <SortableThumb key={`${String(key)}-${index}`} id={String(index)} index={index} imageUrl={url} />
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* 編集パネル */}
              {editingIndex !== null && headerImageKeys[editingIndex] ? (
                <div className="p-4 border rounded-lg">
                  <Label className="mb-2">編集: ヘッダー画像 {editingIndex + 1}</Label>
                  <div className="flex gap-4 items-start">
                    <div className="w-80 h-48 rounded overflow-hidden border bg-muted">
                      <img src={getPublicImageUrl(db.images.getUpload(headerImageKeys[editingIndex]) || String(headerImageKeys[editingIndex])) || "/placeholder.svg"} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <ImageUpload
                        value={getPublicImageUrl(db.images.getUpload(headerImageKeys[editingIndex]) || String(headerImageKeys[editingIndex])) || ""}
                        onChange={async (file) => {
                          if (file) {
                            const key = headerImageKeys[editingIndex]
                            const headerBase64 = await fileToBase64(file)
                            db.images.saveUpload(key, headerBase64)
                            setHeaderImageKeys([...headerImageKeys])
                            toast({ title: "更新完了", description: `ヘッダー画像 ${editingIndex + 1} を更新しました` })
                          }
                        }}
                        aspectRatioType="header"
                      />

                      <div className="flex gap-2">
                        <Button onClick={() => handleReorder(editingIndex, Math.max(0, editingIndex - 1))} size="sm">移動左</Button>
                        <Button onClick={() => handleReorder(editingIndex, Math.min(headerImageKeys.length - 1, editingIndex + 1))} size="sm">移動右</Button>
                        <Button onClick={() => handleReorder(editingIndex, 0)} size="sm">先頭にする</Button>
                        <Button variant="destructive" onClick={() => { removeHeaderImage(editingIndex); setEditingIndex(null) }} size="sm">削除</Button>
                        <Button variant="ghost" onClick={() => setEditingIndex(null)} size="sm">閉じる</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">サムネイルをクリックして編集します</p>
              )}
            </div>
              <div className="space-y-2">
                <Label>新しいヘッダー画像を追加</Label>
                <div className="max-w-[600px]">
                  <ImageUpload
                    value=""
                    onChange={(file) => {
                      // 画像を選択したら自動で追加する
                      handleNewHeaderFile(file || null)
                    }}
                    aspectRatioType="header"
                  />
                </div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>サイト背景</CardTitle>
            <CardDescription>公開ページの背景設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={backgroundType} onValueChange={(value: "color" | "image") => setBackgroundType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="bg-color" />
                <Label htmlFor="bg-color">単色</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="bg-image" />
                <Label htmlFor="bg-image">画像</Label>
              </div>
            </RadioGroup>

            {backgroundType === "color" ? (
              <div className="space-y-2">
                <Label>背景色</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>背景画像</Label>
                <div className="max-w-[600px]">
                  <ImageUpload
                    value={user?.backgroundType === "image" ? user?.backgroundValue : ""}
                    onChange={setBackgroundImageFile}
                    aspectRatioType="background"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>アフィリエイト設定</CardTitle>
            <CardDescription>アフィリエイトプラットフォームの設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amazon">Amazon アソシエイトID</Label>
              <Input id="amazon" placeholder="your-associate-id" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rakuten">楽天アフィリエイトID</Label>
              <Input id="rakuten" placeholder="your-rakuten-id" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amazonアソシエイト設定</CardTitle>
            <CardDescription>Amazon Product Advertising APIの認証情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amazonAccessKey">Access Key</Label>
              <Input
                id="amazonAccessKey"
                type="password"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={amazonAccessKey}
                onChange={(e) => setAmazonAccessKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonSecretKey">Secret Key</Label>
              <Input
                id="amazonSecretKey"
                type="password"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                value={amazonSecretKey}
                onChange={(e) => setAmazonSecretKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonAssociateId">アソシエイトID（トラッキングID）</Label>
              <Input
                id="amazonAssociateId"
                placeholder="your-associate-id-22"
                value={amazonAssociateId}
                onChange={(e) => setAmazonAssociateId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                アソシエイトIDは、アフィリエイトリンクに含まれる「-22」で終わるIDです
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
