"use client"

import { useState } from "react"
import apiFetch from '@/lib/api-client'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/db/storage"

export function CustomFontUploader({ onUploaded }: { onUploaded?: () => void }) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("name", file.name)

      const res = await apiFetch(`/api/admin/custom-fonts`, {
        method: "POST",
        body: fd,
      })
      if (!res.ok) throw new Error("upload failed")
      await db.customFonts.refresh().catch(() => {})
      toast({ title: "フォントをアップロードしました" })
      onUploaded?.()
    } catch (e) {
      console.error(e)
      toast({ title: "アップロードに失敗しました", description: String(e) })
    } finally {
      setUploading(false)
      // clear input value if any
      try {
        (e.target as HTMLInputElement).value = ""
      } catch {}
    }
  }

  return (
    <div>
      <label className="flex items-center gap-2">
        <input
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFiles}
          disabled={uploading}
        />
        <Button size="sm" disabled={uploading} type="button">
          {uploading ? "アップロード中…" : "カスタムフォントを追加"}
        </Button>
      </label>
    </div>
  )
}
