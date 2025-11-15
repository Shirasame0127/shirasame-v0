"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ImagePlus } from "lucide-react"

export function QuickAddForm() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 実際のデータ送信処理（将来のサービス層で実装）
    console.log("Quick add:", { title, url })
    alert("商品が追加されました！（モック動作）")
    setTitle("")
    setUrl("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          クイック追加
        </CardTitle>
        <CardDescription>商品画像とURLだけで素早く追加</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">商品画像</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <ImagePlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">画像をドロップまたはクリックして選択</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">商品名（任意）</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="自動取得されます" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">商品URL</Label>
            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>

          <Button type="submit" className="w-full" size="lg">
            追加する
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
