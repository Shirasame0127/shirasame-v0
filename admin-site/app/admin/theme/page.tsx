"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from "next/link"
// prefer persisted user profile; avoid using local mock data
const _currentUser = db.user.get()
import { ChromePicker } from "react-color"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageUpload } from "@/components/image-upload"
import { db } from "@/lib/db/storage"
import { useToast } from "@/hooks/use-toast"

const FONT_OPTIONS = [
  { value: "sans-serif", label: "Sans Serif (デフォルト)" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP" },
  { value: "'Noto Serif JP', serif", label: "Noto Serif JP" },
]

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

export default function ThemeCustomizerPage() {
  const { toast } = useToast()
  
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [backgroundColor, setBackgroundColor] = useState(_currentUser?.backgroundColor || "#ffffff")
  const [textColor, setTextColor] = useState("#000000")
  const [headingFont, setHeadingFont] = useState("sans-serif")
  const [bodyFont, setBodyFont] = useState("sans-serif")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [headerImage, setHeaderImage] = useState<File | null>(null)

  const handleSave = async () => {
    let bgImageBase64 = null
    let headerImageBase64 = null

    if (backgroundImage) {
      bgImageBase64 = await fileToBase64(backgroundImage)
    }
    if (headerImage) {
      headerImageBase64 = await fileToBase64(headerImage)
    }

    const themeData = {
      primaryColor,
      backgroundColor,
      textColor,
      headingFont,
      bodyFont,
      backgroundImage: bgImageBase64,
      headerImage: headerImageBase64,
    }

    db.theme.set(themeData)
    console.log("[v0] Saved theme to DB")
    
    toast({
      title: "保存完了",
      description: "テーマを保存しました",
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings" prefetch={false}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">テーマカスタマイザー</h1>
            <p className="text-sm text-muted-foreground">サイト全体の見た目を編集</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" asChild>
            <Link href="/" target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              プレビュー
            </Link>
          </Button>
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
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
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>プライマリカラー</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <div className="w-6 h-6 rounded border mr-2" style={{ backgroundColor: primaryColor }} />
                      {primaryColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ChromePicker color={primaryColor} onChange={(color) => setPrimaryColor(color.hex)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>背景色</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <div className="w-6 h-6 rounded border mr-2" style={{ backgroundColor }} />
                      {backgroundColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ChromePicker color={backgroundColor} onChange={(color) => setBackgroundColor(color.hex)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>テキストカラー</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <div className="w-6 h-6 rounded border mr-2" style={{ backgroundColor: textColor }} />
                      {textColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ChromePicker color={textColor} onChange={(color) => setTextColor(color.hex)} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>フォント設定</CardTitle>
            <CardDescription>見出しと本文のフォントを選択</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>見出しフォント</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>本文フォント</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="p-4 border rounded-md bg-muted"
              style={{
                fontFamily: headingFont,
                color: textColor,
              }}
            >
              <h2 className="text-2xl font-bold mb-2">見出しのプレビュー</h2>
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
                <ImageUpload
                  value={_currentUser?.backgroundImageUrl || ""}
                  onChange={setBackgroundImage}
                  aspectRatioType="background"
                />
            </div>

            <div className="space-y-2">
              <Label>ヘッダー画像</Label>
              <ImageUpload value={_currentUser?.headerImageUrl || ""} onChange={setHeaderImage} aspectRatioType="header" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
