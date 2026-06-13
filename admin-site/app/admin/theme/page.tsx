"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import Link from "next/link"
import { ChromePicker } from "react-color"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageUpload } from "@/components/image-upload"
import { db } from "@/lib/db/storage"
import { useToast } from "@/hooks/use-toast"
import { StarMark } from "@/components/brand"

const FONT_OPTIONS = [
  { value: "sans-serif", label: "Sans Serif (デフォルト)" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP" },
  { value: "'Noto Serif JP', serif", label: "Noto Serif JP" },
]

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })

export default function ThemeCustomizerPage() {
  const { toast } = useToast()

  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#000000")
  const [headingFont, setHeadingFont] = useState("sans-serif")
  const [bodyFont, setBodyFont] = useState("sans-serif")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [headerImage, setHeaderImage] = useState<File | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Load previously-saved theme + user on mount so the pickers reflect the
  // current values instead of resetting to defaults on every visit.
  useEffect(() => {
    try {
      const saved = db.theme.get() as any
      if (saved) {
        if (saved.primaryColor) setPrimaryColor(saved.primaryColor)
        if (saved.backgroundColor) setBackgroundColor(saved.backgroundColor)
        if (saved.textColor) setTextColor(saved.textColor)
        if (saved.headingFont) setHeadingFont(saved.headingFont)
        if (saved.bodyFont) setBodyFont(saved.bodyFont)
      }
      const u = db.user.get() as any
      if (u) {
        setCurrentUser(u)
        if (!saved?.backgroundColor && u.backgroundColor) setBackgroundColor(u.backgroundColor)
      }
    } catch { /* ignore */ }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      let bgImageBase64: string | null = null
      let headerImageBase64: string | null = null
      if (backgroundImage) bgImageBase64 = await fileToBase64(backgroundImage)
      if (headerImage) headerImageBase64 = await fileToBase64(headerImage)

      db.theme.set({
        primaryColor, backgroundColor, textColor, headingFont, bodyFont,
        backgroundImage: bgImageBase64, headerImage: headerImageBase64,
      })
      toast({ title: "保存しました", description: "テーマを更新しました" })
    } catch {
      toast({ title: "保存に失敗しました", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings" prefetch={false} aria-label="戻る"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <p className="label-mono flex items-center gap-2"><StarMark size={12} className="text-primary" /> Theme</p>
            <h1 className="text-xl font-bold">テーマカスタマイザー</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank"><Eye className="h-4 w-4" />プレビュー</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>カラー設定</CardTitle>
            <CardDescription>サイト全体のカラースキームを設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "プライマリカラー", color: primaryColor, set: setPrimaryColor },
                { label: "背景色", color: backgroundColor, set: setBackgroundColor },
                { label: "テキストカラー", color: textColor, set: setTextColor },
              ].map((c) => (
                <div key={c.label} className="space-y-2">
                  <Label>{c.label}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <div className="mr-2 h-5 w-5 rounded border" style={{ backgroundColor: c.color }} />
                        {c.color}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ChromePicker color={c.color} onChange={(color) => c.set(color.hex)} />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>フォント設定</CardTitle>
            <CardDescription>見出しと本文のフォントを選択</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>見出しフォント</Label>
                <select className="h-9 w-full rounded-md border bg-transparent px-3 text-sm" value={headingFont} onChange={(e) => setHeadingFont(e.target.value)}>
                  {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>本文フォント</Label>
                <select className="h-9 w-full rounded-md border bg-transparent px-3 text-sm" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>
                  {FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
                </select>
              </div>
            </div>
            <div className="rounded-md border bg-muted p-4" style={{ fontFamily: headingFont, color: textColor }}>
              <h2 className="mb-2 text-2xl font-bold">見出しのプレビュー</h2>
              <p style={{ fontFamily: bodyFont }}>本文テキストのプレビューです。ここでフォントを確認できます。</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>画像設定</CardTitle>
            <CardDescription>背景画像とヘッダー画像を設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>背景画像</Label>
              <ImageUpload value={currentUser?.backgroundImageUrl || ""} onChange={setBackgroundImage} aspectRatioType="background" />
            </div>
            <div className="space-y-2">
              <Label>ヘッダー画像</Label>
              <ImageUpload value={currentUser?.headerImageUrl || ""} onChange={setHeaderImage} aspectRatioType="header" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
