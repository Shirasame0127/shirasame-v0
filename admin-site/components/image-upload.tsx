"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, AlertCircle } from "lucide-react"
import { responsiveImageForUsage } from "@/lib/image-url"
import apiFetch from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

type AspectType = "product" | "recipe" | "profile" | "header" | "background"

const MAX_BYTES = 20 * 1024 * 1024 // 20MB

function targetFor(t: AspectType): string {
  switch (t) {
    case "profile": return "profile"
    case "header": return "header"
    case "background": return "background"
    case "recipe": return "recipe"
    case "product": return "product"
    default: return "other"
  }
}

function usageFor(t: AspectType) {
  switch (t) {
    case "header": return "header-large"
    case "recipe": return "recipe"
    case "profile": return "avatar"
    case "background": return "original"
    default: return "list"
  }
}

async function maybeCompress(file: File, onProgress?: (p: number) => void) {
  try {
    if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) return file
    const mod = await import("browser-image-compression")
    const imageCompression = (mod && (mod as any).default) || mod
    if (!imageCompression) return file
    return (await imageCompression(file, {
      maxWidthOrHeight: 3840,
      maxSizeMB: 3,
      useWebWorker: true,
      initialQuality: 0.9,
      onProgress: (p: number) => onProgress?.(Math.min(99, Math.round(p))),
    })) || file
  } catch {
    return file
  }
}

function normalizeFileName(file: File): File {
  try {
    const name = file.name || "upload"
    const hasExt = /\.[a-zA-Z0-9]+$/.test(name)
    const looksLikeBlob = /blob|^avatar-|^background-|^file:|^data:/i.test(name)
    if (hasExt && !looksLikeBlob) return file
    const mime = (file.type || "").toLowerCase()
    const map: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/svg+xml": "svg" }
    const ext = map[mime] || (mime && mime.split("/")[1]) || "png"
    const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.+$/, "")
    return new File([file], `${base}.${ext.replace(/[^a-z0-9]/gi, "")}`, { type: file.type || `image/${ext}` })
  } catch {
    return file
  }
}

interface ImageUploadProps {
  value?: string
  onChange: (file: File) => void
  aspectRatioType?: AspectType
  label?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Provides the canonical image KEY (not a URL), called exactly once on success. */
  onUploadComplete?: (fileKey?: string, aspectRatio?: number) => void
  onUploadError?: (message: string) => void
}

export function ImageUpload({
  value,
  onChange,
  aspectRatioType = "product",
  label,
  open,
  onOpenChange,
  onUploadComplete,
  onUploadError,
}: ImageUploadProps) {
  const { toast } = useToast()
  const [selectedAspect, setSelectedAspect] = useState<string>(aspectRatioType === "header" ? "16:9" : "1:1")
  const [previewUrl, setPreviewUrl] = useState<string>(value || "")
  const [tempImageUrl, setTempImageUrl] = useState<string>("")
  const [showCropper, setShowCropper] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)
  const tempUrlRef = useRef<string | null>(null)

  const isDialogMode = open !== undefined && onOpenChange !== undefined

  useEffect(() => { if (value) setPreviewUrl(value) }, [value])

  const setBlobPreview = useCallback((url: string) => {
    if (blobUrlRef.current && blobUrlRef.current !== url) {
      try { URL.revokeObjectURL(blobUrlRef.current) } catch {}
    }
    blobUrlRef.current = url
    setPreviewUrl(url)
  }, [])

  const clearTempUrl = useCallback(() => {
    if (tempUrlRef.current) {
      try { URL.revokeObjectURL(tempUrlRef.current) } catch {}
      tempUrlRef.current = null
    }
  }, [])

  // Revoke any outstanding object URLs on unmount.
  useEffect(() => () => {
    if (blobUrlRef.current) { try { URL.revokeObjectURL(blobUrlRef.current) } catch {} }
    if (tempUrlRef.current) { try { URL.revokeObjectURL(tempUrlRef.current) } catch {} }
  }, [])

  // Single canonical upload pipeline: (compress) -> upload -> complete -> key.
  const uploadAndComplete = useCallback(async (rawFile: File, aspectString?: string) => {
    setError(null)
    setUploading(true)
    setProgress(0)
    const file = normalizeFileName(rawFile)
    const target = targetFor(aspectRatioType)

    const proxyUpload = async (f: File) => {
      const fd = new FormData()
      fd.append("file", f)
      fd.append("target", target)
      const res = await apiFetch("/api/images/upload", { method: "POST", body: fd })
      if (!res.ok) {
        let msg = `アップロードに失敗しました (${res.status})`
        try { const j = await res.json(); msg = j?.error || msg } catch {}
        throw new Error(msg)
      }
      const json = await res.json().catch(() => ({}))
      return { key: json?.result?.key || json?.key, id: json?.result?.id || json?.id }
    }

    const signedUpload = async (f: File) => {
      const signRes = await apiFetch("/api/images/direct-upload", { method: "POST" })
      if (!signRes.ok) throw new Error("direct-upload presign failed")
      const signJson = await signRes.json()
      const uploadURL: string | undefined = signJson?.result?.uploadURL
      const cfId: string | undefined = signJson?.result?.id
      if (!uploadURL || !cfId) throw new Error("invalid presign response")
      const fd = new FormData()
      fd.append("file", f)
      const postRes = await fetch(uploadURL, { method: "POST", body: fd })
      if (!postRes.ok) throw new Error(`upload failed (${postRes.status})`)
      return { key: undefined as string | undefined, id: cfId }
    }

    try {
      const compressed = await maybeCompress(file, (p) => setProgress(p))
      setProgress(null) // switch to indeterminate during network upload

      const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      const useDirect = typeof process !== "undefined" && process.env.NEXT_PUBLIC_USE_DIRECT_UPLOAD === "true"
      const forceProxy = typeof process !== "undefined" && process.env.NEXT_PUBLIC_FORCE_PROXY_UPLOAD === "true"

      let result: { key?: string; id?: string }
      if (isLocalhost || forceProxy || !useDirect) {
        result = await proxyUpload(compressed)
      } else {
        try { result = await signedUpload(compressed) } catch { result = await proxyUpload(compressed) }
      }

      // Persist via images/complete using key (or cf_id) — key-only policy.
      const completeBody: any = { filename: file.name, target, aspect: aspectString || selectedAspect }
      if (result.key) completeBody.key = result.key
      else if (result.id) completeBody.cf_id = result.id
      else throw new Error("アップロード結果にキーがありません")

      const completeRes = await apiFetch("/api/images/complete", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(completeBody),
      })
      let finalKey = result.key
      if (completeRes.ok) {
        const cj = await completeRes.json().catch(() => ({}))
        finalKey = cj?.key || result.key
      } else if (!result.key) {
        throw new Error("画像の保存に失敗しました")
      }

      if (!finalKey || (typeof finalKey === "string" && finalKey.startsWith("http"))) {
        throw new Error("無効な画像キーが返されました")
      }

      // Update preview to the CDN variant when possible.
      try {
        const resp = responsiveImageForUsage(finalKey, usageFor(aspectRatioType) as any)
        if (resp?.src) {
          if (blobUrlRef.current) { try { URL.revokeObjectURL(blobUrlRef.current) } catch {}; blobUrlRef.current = null }
          setPreviewUrl(resp.src)
        }
      } catch {}

      const parseAspect = (s?: string) => {
        if (!s) return undefined
        const [a, b] = String(s).split(":").map(Number)
        return a && b ? a / b : undefined
      }
      onUploadComplete?.(finalKey, parseAspect(aspectString) || parseAspect(selectedAspect))
      toast({ title: "画像をアップロードしました" })
    } catch (e: any) {
      const msg = e?.message || "アップロードに失敗しました"
      setError(msg)
      onUploadError?.(msg)
      toast({ title: "画像アップロード失敗", description: msg, variant: "destructive" })
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }, [aspectRatioType, selectedAspect, onUploadComplete, onUploadError, toast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "画像ファイルを選択してください", variant: "destructive" })
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "ファイルサイズが大きすぎます", description: "20MB以下の画像を選択してください。", variant: "destructive" })
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    file = normalizeFileName(file)
    onChange(file)
    const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")
    if (isGif) {
      setBlobPreview(URL.createObjectURL(file)) // GIFs skip the cropper (cropping loses animation)
      uploadAndComplete(file)
      return
    }
    clearTempUrl()
    const url = URL.createObjectURL(file)
    tempUrlRef.current = url
    setTempImageUrl(url)
    setShowCropper(true)
  }

  const handleCropComplete = async (croppedFile: File, aspectString?: string) => {
    clearTempUrl()
    const file = normalizeFileName(croppedFile)
    setBlobPreview(URL.createObjectURL(file))
    onChange(file)
    setShowCropper(false)
    if (isDialogMode && onOpenChange) onOpenChange(false)
    await uploadAndComplete(file, aspectString)
  }

  const handleRemove = () => {
    if (blobUrlRef.current) { try { URL.revokeObjectURL(blobUrlRef.current) } catch {}; blobUrlRef.current = null }
    setPreviewUrl("")
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const aspectSelect = aspectRatioType === "product" && (
    <div className="space-y-1">
      <Label className="text-xs">画像比率</Label>
      <Select value={selectedAspect} onValueChange={setSelectedAspect}>
        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1:1">正方形 (1:1)</SelectItem>
          <SelectItem value="4:3">横長 (4:3)</SelectItem>
          <SelectItem value="16:9">横長ワイド (16:9)</SelectItem>
          <SelectItem value="2:3">縦長 (2:3)</SelectItem>
          <SelectItem value="3:4">縦長 (3:4)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  if (isDialogMode && open) {
    return (
      <>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <Button type="button" onClick={() => inputRef.current?.click()} className="w-full" disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "アップロード中…" : "画像を選択"}
        </Button>
        {aspectSelect && <div className="mt-2">{aspectSelect}</div>}
        <ImageCropper open={showCropper} onOpenChange={setShowCropper} imageUrl={tempImageUrl} onCropComplete={handleCropComplete} aspectRatioType={aspectRatioType} />
      </>
    )
  }

  const aspectClass = aspectRatioType === "header" ? "aspect-[3/1]" : (aspectRatioType === "recipe" || aspectRatioType === "background") ? "aspect-video" : "aspect-square"
  const maxWidthClass = aspectRatioType === "header" ? "max-w-md" : (aspectRatioType === "background" || aspectRatioType === "recipe") ? "max-w-sm" : "w-full"

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className={`flex flex-col gap-3 ${maxWidthClass}`}>
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-lg border bg-muted">
            <div className={`relative ${aspectClass}`}>
              {(() => {
                if (typeof previewUrl === "string" && (previewUrl.startsWith("blob:") || previewUrl.startsWith("data:"))) {
                  return <img src={previewUrl} alt="プレビュー" className="h-full w-full object-cover" />
                }
                const resp = responsiveImageForUsage(previewUrl || null, usageFor(aspectRatioType) as any)
                return <img src={resp.src || previewUrl || "/placeholder.svg"} srcSet={resp.srcSet || undefined} sizes={resp.sizes} alt="プレビュー" className="h-full w-full object-cover" />
              })()}
              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="label-mono">{progress != null ? `${progress}%` : "Uploading"}</span>
                </div>
              )}
            </div>
            {!uploading && (
              <Button type="button" variant="destructive" size="icon-sm" className="absolute right-2 top-2" onClick={handleRemove} aria-label="画像を削除">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <Button type="button" variant="outline" className="h-32 w-full border-dashed" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <div className="flex flex-col items-center gap-2">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">{uploading ? (progress != null ? `アップロード中… ${progress}%` : "アップロード中…") : "画像をアップロード"}</span>
            </div>
          </Button>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" />{error}</p>
        )}

        {aspectSelect}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

        {previewUrl && !uploading && (
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>画像を変更</Button>
        )}
      </div>

      <ImageCropper open={showCropper} onOpenChange={setShowCropper} imageUrl={tempImageUrl} onCropComplete={handleCropComplete} aspectRatioType={aspectRatioType} />
    </div>
  )
}
