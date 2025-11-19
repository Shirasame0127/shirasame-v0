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
import { Save, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
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
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null)
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
      setEmail(currentUser.email)
      setBackgroundType(currentUser.backgroundType || "color")
      setBackgroundColor(currentUser.backgroundValue || "#ffffff")
      setSocialLinks(currentUser.socialLinks || [])
      setAmazonAccessKey(currentUser.amazonAccessKey || "")
      setAmazonSecretKey(currentUser.amazonSecretKey || "")
      setAmazonAssociateId(currentUser.amazonAssociateId || "")
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

    if (field === "username" && value && !['email', 'form'].includes(updated[index].platform)) {
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
        description: "URLを入力してください"
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
        description: `${link.platform}の正しいURL形式ではありません`
      })
      return
    }

    const exists = await checkAccountExists(link.url)

    if (exists) {
      setVerificationStatus({ ...verificationStatus, [index]: "valid" })
      toast({
        title: "確認完了",
        description: "アカウントの形式が正しいことを確認しました！"
      })
    } else {
      setVerificationStatus({ ...verificationStatus, [index]: "invalid" })
      toast({
        variant: "destructive",
        title: "エラー",
        description: "アカウントの確認ができませんでした"
      })
    }
  }

  const handleSave = async () => {
    const updates: any = {
      displayName,
      bio,
      email,
      backgroundType,
      socialLinks: socialLinks.filter((link) => link.url),
      amazonAccessKey,
      amazonSecretKey,
      amazonAssociateId,
    }

    if (backgroundType === "color") {
      updates.backgroundValue = backgroundColor
    } else if (backgroundImageFile) {
      const imageBase64 = await fileToBase64(backgroundImageFile)
      updates.backgroundValue = imageBase64
    }

    if (avatarFile) {
      const avatarBase64 = await fileToBase64(avatarFile)
      updates.avatarUrl = avatarBase64
      updates.profileImage = avatarBase64
    }

    if (headerImageFile) {
      const headerBase64 = await fileToBase64(headerImageFile)
      updates.headerImageUrl = headerBase64
      updates.headerImage = headerBase64
    }

    db.user.update(updates)
    console.log("[v0] Saved settings:", updates)
    
    const updatedUser = db.user.get()
    if (updatedUser) {
      setUser(updatedUser)
      setDisplayName(updatedUser.displayName)
      setBio(updatedUser.bio || "")
      setEmail(updatedUser.email)
      setBackgroundType(updatedUser.backgroundType || "color")
      setBackgroundColor(updatedUser.backgroundValue || "#ffffff")
      setSocialLinks(updatedUser.socialLinks || [])
      setAmazonAccessKey(updatedUser.amazonAccessKey || "")
      setAmazonSecretKey(updatedUser.amazonSecretKey || "")
      setAmazonAssociateId(updatedUser.amazonAssociateId || "")
      setAvatarFile(null)
      setHeaderImageFile(null)
      setBackgroundImageFile(null)
    }
    
    toast({
      title: "保存完了",
      description: "設定を保存しました！"
    })
  }

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
                <ImageUpload value={user?.avatarUrl || ""} onChange={setAvatarFile} aspectRatioType="profile" />
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
                <CardDescription>X、TikTok、YouTube、Instagram、Twitch、Discord、note、メール、フォームのリンク</CardDescription>
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
                        onValueChange={(value: "x" | "tiktok" | "youtube" | "instagram" | "email" | "form" | "twitch" | "discord" | "note") =>
                          updateSocialLink(index, "platform", value)
                        }
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

                    {!['email', 'form'].includes(link.platform) && (
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
                      <Label>{link.platform === 'email' ? 'メールアドレス' : link.platform === 'form' ? 'フォームURL' : 'URL'}</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={
                            link.platform === 'email' 
                              ? 'mailto:your@email.com' 
                              : link.platform === 'form' 
                              ? 'https://forms.example.com/...' 
                              : 'https://...'
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
            <CardDescription>プロフィールヘッダーに表示される画像</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-[600px]">
              <ImageUpload value={user?.headerImageUrl || ""} onChange={setHeaderImageFile} aspectRatioType="header" />
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
