"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (file: File) => void
  aspectRatioType?: "product" | "recipe" | "profile" | "header" | "background"
  label?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUploadComplete?: (fileUrl: string) => void
}

export function ImageUpload({
  value,
  onChange,
  aspectRatioType = "product",
  label,
  open,
  onOpenChange,
  onUploadComplete,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [tempImageUrl, setTempImageUrl] = useState<string>("")
  const [showCropper, setShowCropper] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDialogMode = open !== undefined && onOpenChange !== undefined

  useEffect(() => {
    if (value) {
      setPreviewUrl(value)
    }
  }, [value])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setTempImageUrl(url)
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    const url = URL.createObjectURL(croppedFile)
    setPreviewUrl(url)
    // keep onChange for backward compatibility
    onChange(croppedFile)

    // Try direct signed upload to Cloudflare Images; fallback to server proxy if needed
    ;(async () => {
      const trySignedUpload = async (file: File) => {
        try {
          const signRes = await fetch('/api/images/direct-upload', { method: 'POST' })
          if (!signRes.ok) throw new Error('Failed to get direct upload URL')
          const signJson = await signRes.json()
          const uploadURL: string | undefined = signJson?.result?.uploadURL
          const cfId: string | undefined = signJson?.result?.id
          if (!uploadURL || !cfId) throw new Error('Invalid direct upload response')

          // Attempt PUT with retries
          const maxAttempts = 3
          let attempt = 0
          let lastErr: any = null
          while (attempt < maxAttempts) {
              try {
                const putRes = await fetch(uploadURL, { method: 'PUT', body: file })
                if (!putRes.ok) throw new Error(`PUT failed: ${putRes.status}`)
                // Construct public URL (Cloudflare Image Delivery)
                const account = (window as any).__env__?.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT || process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT || process.env.CLOUDFLARE_ACCOUNT_ID || ''
                const publicUrl = account ? `https://imagedelivery.net/${account}/${cfId}/public` : undefined
                return { id: cfId, url: publicUrl }
              } catch (err) {
              lastErr = err
              attempt++
              const backoff = 200 * Math.pow(2, attempt)
              await new Promise((r) => setTimeout(r, backoff))
            }
          }
          throw lastErr
        } catch (err) {
          throw err
        }
      }

        const fallbackProxyUpload = async (file: File) => {
        const fd = new FormData()
        fd.append('file', file)
        // include target so server knows the intended purpose of the image
        const target = aspectRatioType === 'profile'
          ? 'profile'
          : aspectRatioType === 'header'
          ? 'header'
          : aspectRatioType === 'background'
          ? 'background'
          : aspectRatioType === 'recipe'
          ? 'recipe'
          : aspectRatioType === 'product'
          ? 'product'
          : 'other'
        fd.append('target', target)
        const res = await fetch('/api/images/upload', { method: 'POST', body: fd })
        if (!res.ok) {
           // try to parse JSON, otherwise fall back to text for better diagnostics
           let errData: any = null
           try {
             errData = await res.json()
           } catch (e) {
             try {
               const txt = await res.text()
               errData = { error: txt }
             } catch (e2) {
               errData = { error: 'unknown' }
             }
           }
           console.error('Proxy upload failed:', res.status, errData)
           throw new Error(errData?.error || `Proxy upload failed (status ${res.status})`)
        }
        const json = await res.json().catch(() => ({}))
        const uploadedUrl = json?.result?.variants?.[0] || json?.result?.url || json?.result?.publicUrl || json?.result?.url
        return { url: uploadedUrl }
      }

        try {
          let result
          const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          const forceProxy = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_FORCE_PROXY_UPLOAD === 'true')

          if (isLocalhost || forceProxy) {
            // In dev (localhost) some third-party signed upload endpoints block PUT via CORS.
            // Use the server proxy upload to avoid CORS issues.
            console.log('ImageUpload: using proxy upload due to localhost/force proxy setting')
            result = await fallbackProxyUpload(croppedFile)
          } else {
            try {
              result = await trySignedUpload(croppedFile)
            } catch (err) {
              console.warn('Signed upload failed, falling back to proxy upload', err)
              result = await fallbackProxyUpload(croppedFile)
            }
          }

          const uploadedUrl = result?.url
          if ((result as any)?.id) {
            // Notify server to persist metadata to Supabase
            try {
              const completeTarget = aspectRatioType === 'profile'
                ? 'profile'
                : aspectRatioType === 'header'
                ? 'header'
                : aspectRatioType === 'background'
                ? 'background'
                : aspectRatioType === 'recipe'
                ? 'recipe'
                : aspectRatioType === 'product'
                ? 'product'
                : 'other'
              await fetch('/api/images/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cf_id: (result as any).id, url: uploadedUrl, filename: croppedFile.name, target: completeTarget }),
              })
            } catch (err) {
              console.warn('images/complete failed', err)
            }
          }

          if (uploadedUrl && onUploadComplete) onUploadComplete(uploadedUrl)
        } catch (e) {
          console.error('upload failed', e)
        }
    })()

    setShowCropper(false)

    if (isDialogMode && onOpenChange) {
      onOpenChange(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  if (isDialogMode && open) {
    return (
      <>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <Button type="button" onClick={() => inputRef.current?.click()} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          画像を選択
        </Button>
        <ImageCropper
          open={showCropper}
          onOpenChange={setShowCropper}
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          aspectRatioType={aspectRatioType}
        />
      </>
    )
  }

  const getMaxSize = () => {
    switch (aspectRatioType) {
      case "header":
        return "max-w-md"
      case "background":
      case "recipe":
        return "max-w-sm"
      default:
        return "max-w-[200px]"
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className={`flex flex-col gap-3 ${getMaxSize()}`}>
        {previewUrl ? (
          <div className="relative rounded-lg overflow-hidden border bg-muted">
            <div
              className={`relative ${aspectRatioType === "header" ? "aspect-3/1" : aspectRatioType === "recipe" || aspectRatioType === "background" ? "aspect-video" : "aspect-square"}`}
            >
              <Image src={previewUrl || "/placeholder.svg"} alt="プレビュー" fill className="object-cover" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-32 w-full bg-transparent"
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">画像をアップロード</span>
            </div>
          </Button>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

        {previewUrl && (
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            画像を変更
          </Button>
        )}
      </div>

      <ImageCropper
        open={showCropper}
        onOpenChange={setShowCropper}
        imageUrl={tempImageUrl}
        onCropComplete={handleCropComplete}
        aspectRatioType={aspectRatioType}
      />
    </div>
  )
}
