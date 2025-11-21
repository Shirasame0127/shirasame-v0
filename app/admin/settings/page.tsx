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
import type { SocialLink } from "@/lib/mock-data/users"
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
  const [user, setUser] = useState(db.user.get())
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
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

  useEffect(() => {
    const currentUser = db.user.get()
    if (currentUser) {
      setUser(currentUser)
      setDisplayName(currentUser.displayName)
      setBio(currentUser.bio || "")
      setEmail(currentUser.email || "")
      setBackgroundType(currentUser.backgroundType || "color")
      setBackgroundColor(currentUser.backgroundValue || "#ffffff")
      setSocialLinks(currentUser.socialLinks || [])
      setAmazonAccessKey(currentUser.amazonAccessKey || "")
      setAmazonSecretKey(currentUser.amazonSecretKey || "")
      setAmazonAssociateId(currentUser.amazonAssociateId || "")
      setHeaderImageKeys(
        currentUser.headerImageKeys || (currentUser.headerImageKey ? [currentUser.headerImageKey] : []),
      )
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
      const imageKey = `header-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const headerBase64 = await fileToBase64(newHeaderImageFile)
      db.images.saveUpload(imageKey, headerBase64)

      setHeaderImageKeys([...headerImageKeys, imageKey])
      setNewHeaderImageFile(null)
      toast({
        title: "追加完了",
        description: "ヘッダー画像を追加しました",
      })
    }
  }

  // 新しい画像を選択したら自動で追加するハンドラ（ユーザーの追加操作を簡単にする）
  const handleNewHeaderFile = async (file: File | null) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/images/upload", { method: "POST", body: fd })
      const json = await res.json()
      const uploadedUrl = json?.result?.variants?.[0] || json?.result?.url
      if (uploadedUrl) {
        // store the direct URL in headerImageKeys for simplicity
        setHeaderImageKeys((prev) => [...prev, uploadedUrl])
        toast({ title: "追加完了", description: "ヘッダー画像を追加しました" })
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
  }

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = headerImageKeys.indexOf(String(active.id))
    const to = headerImageKeys.indexOf(String(over.id))
    if (from >= 0 && to >= 0) {
      const newKeys = arrayMove(headerImageKeys, from, to)
      setHeaderImageKeys(newKeys)
    }
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
                    if (file) {
                      const imageKey = headerImageKeys[index]
                      const headerBase64 = await fileToBase64(file)
                      db.images.saveUpload(imageKey, headerBase64)
                      setHeaderImageKeys([...headerImageKeys])
                      toast({ title: "更新完了", description: `ヘッダー画像 ${index + 1} を更新しました` })
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
    setHeaderImageKeys(headerImageKeys.filter((_, i) => i !== index))
    toast({
      title: "削除完了",
      description: "ヘッダー画像を削除しました",
    })
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

    const updates: any = {
      displayName,
      bio,
      email,
      backgroundType,
      socialLinks: socialLinks.filter((link) => link.url),
      amazonAccessKey,
      amazonSecretKey,
      amazonAssociateId,
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
      const avatarKey = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const avatarBase64 = await fileToBase64(avatarFile)
      db.images.saveUpload(avatarKey, avatarBase64)
      updates.profileImageKey = avatarKey
    }

    db.user.update(user.id, updates)
    console.log("[v0] Saved settings:", updates)

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
      if (typeof key === "string" && (key.startsWith("http") || key.startsWith("/"))) return key
      return db.images.getUpload(String(key))
    })
    .filter(Boolean) as string[]
  const profileImageUrl = user?.profileImageKey
    ? db.images.getUpload(user.profileImageKey)
    : user?.avatarUrl || user?.profileImage

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
                <ImageUpload value={profileImageUrl || ""} onChange={setAvatarFile} aspectRatioType="profile" />
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
                            <Loader2 className="w-4 h-4 animate-spin" />
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
                <SortableContext items={headerImageKeys} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {headerImageKeys.map((key, index) => {
                      const url = db.images.getUpload(key) || "/placeholder.svg"
                      return <SortableThumb key={key} id={key} index={index} imageUrl={url} />
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
                      <img src={db.images.getUpload(headerImageKeys[editingIndex]) || "/placeholder.svg"} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <ImageUpload
                        value={db.images.getUpload(headerImageKeys[editingIndex]) || ""}
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
