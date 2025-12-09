"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { responsiveImageForUsage } from "@/lib/image-url"
import apiFetch from '@/lib/api-client'

// Lightweight client-side compression utility (skip GIFs)
async function maybeCompressClientFile(file: File) {
  try {
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
    if (isGif) return file
    // dynamic import to avoid bundling issues if package not installed in some environments
    const mod = await import('browser-image-compression')
    const imageCompression = (mod && (mod as any).default) || mod
    if (!imageCompression) return file
    const options = {
      maxWidthOrHeight: 3840,
      maxSizeMB: 3,
      useWebWorker: true,
      initialQuality: 0.9,
    }
    const compressed = await imageCompression(file, options)
    return compressed || file
  } catch (e) {
    // if compression fails, return original file to avoid blocking upload
    return file
  }
}

// Normalize filename: if missing extension or looks like a blob/local placeholder,
// attempt to infer an extension from MIME and return a new File with safe name.
async function maybeNormalizeFileName(file: File) {
  try {
    const name = file.name || 'upload'
    const hasExt = /\.[a-zA-Z0-9]+$/.test(name)
    const looksLikeBlob = /blob|^avatar-|^background-|^file:|^data:/i.test(name)
    if (hasExt && !looksLikeBlob) return file

    const mime = (file.type || '').toLowerCase()
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    }
    const ext = mimeToExt[mime] || (mime && mime.split('/')[1]) || 'png'
    const base = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.+$/,'')
    const newName = `${base}.${String(ext).replace(/[^a-z0-9]/gi,'')}`
    try {
      // Create a new File preserving the blob content and type
      return new File([file], newName, { type: file.type || `image/${ext}` })
    } catch (e) {
      // File constructor may not be available in some environments; fallback to original
      return file
    }
  } catch (e) {
    return file
  }
}

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
  const [selectedAspect, setSelectedAspect] = useState<string>(
    aspectRatioType === "product" ? "1:1" : aspectRatioType === "header" ? "16:9" : "1:1",
  )
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (file) {
      // Normalize filename before using it (guard against blob/local placeholder names)
      try { file = await maybeNormalizeFileName(file) } catch (e) { /* ignore */ }
      const url = URL.createObjectURL(file)
      // If the selected file is a GIF, skip the cropper (cropping converts to JPEG and loses animation)
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
      if (isGif) {
        setPreviewUrl(url)
        // keep onChange for backward compatibility
        onChange(file)

        ;(async () => {
          // reuse the same upload logic as handleCropComplete for GIFs (upload original)
          const trySignedUpload = async (fileToUpload: File) => {
            try {
              const signRes = await apiFetch('/api/images/direct-upload', { method: 'POST' })
              if (!signRes.ok) throw new Error('Failed to get direct upload URL')
              const signJson = await signRes.json()
              const uploadURL: string | undefined = signJson?.result?.uploadURL
              const cfId: string | undefined = signJson?.result?.id
              if (!uploadURL || !cfId) throw new Error('Invalid direct upload response')

              const maxAttempts = 3
              let attempt = 0
              let lastErr: any = null
              // Cloudflare in this account requires multipart/form-data uploads.
              // Use FormData POST to the provided uploadURL.
              while (attempt < maxAttempts) {
                try {
                  const fd = new FormData()
                  fd.append('file', fileToUpload)
                  const postRes = await fetch(uploadURL, { method: 'POST', body: fd })
                  if (!postRes.ok) throw new Error(`POST form upload failed: ${postRes.status}`)
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

          const fallbackProxyUpload = async (fileToUpload: File) => {
            const fd = new FormData()
            fd.append('file', fileToUpload)
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
            const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd })
            if (!res.ok) {
              let errData: any = null
              try { errData = await res.json() } catch (e) { try { const txt = await res.text(); errData = { error: txt } } catch (e2) { errData = { error: 'unknown' } } }
              console.error('Proxy upload failed:', res.status, errData)
              throw new Error(errData?.error || `Proxy upload failed (status ${res.status})`)
            }
            const json = await res.json().catch(() => ({}))
            const variants: string[] | undefined = json?.result?.variants
            const originalUrl: string | undefined = json?.result?.publicUrl || json?.result?.url
            let uploadedUrl: string | undefined
            try {
              uploadedUrl = originalUrl || (Array.isArray(variants) ? variants.find((v) => v.toLowerCase().endsWith('.gif')) : undefined) || variants?.[0]
            } catch (e) {
              uploadedUrl = (Array.isArray(variants) && variants[0]) || originalUrl
            }
              const uploadedKey: string | undefined = json?.result?.key
            return { url: uploadedUrl, key: uploadedKey }
          }

          try {
            let result
            const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            const forceProxy = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_FORCE_PROXY_UPLOAD === 'true')
            // opt-in flag to allow direct signed uploads from the browser.
            // By default prefer the server proxy (`/api/images/upload`) so the admin UI
            // does not accidentally send files to the presign endpoint.
            const useDirect = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_USE_DIRECT_UPLOAD === 'true')

            if (isLocalhost || forceProxy || !useDirect) {
              result = await fallbackProxyUpload(file)
            } else {
              try {
                result = await trySignedUpload(file)
              } catch (err) {
                console.warn('Signed upload failed, falling back to proxy upload', err)
                result = await fallbackProxyUpload(file)
              }
            }

            const uploadedUrl = result?.url
            const uploadedKey = (result as any)?.key || (result as any)?.id || undefined
            try { console.log('[ImageUpload] gif upload result', { uploadedUrl, uploadedKey, hasId: !!(result as any)?.id }) } catch (e) {}
            // Prefer canonical `key` payload from upload endpoints. If a key exists,
            // call images/complete with only the key to enforce the key-only policy.
            if (uploadedKey) {
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
                await apiFetch('/api/images/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ key: uploadedKey, filename: file.name, target: completeTarget, aspect: '1:1' }),
                })
              } catch (err) {
                console.warn('images/complete failed', err)
              }
            } else if ((result as any)?.id) {
              // Backward compatibility: if the upload flow returned only a Cloudflare Images id
              // (no R2 key), fall back to the previous behaviour to avoid breaking uploads.
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
                await apiFetch('/api/images/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ cf_id: (result as any).id, url: uploadedUrl, filename: file.name, target: completeTarget, aspect: '1:1' }),
                })
              } catch (err) {
                console.warn('images/complete failed', err)
              }
            }

              // Only report canonical R2 key to callers (key-only policy).
              if (onUploadComplete) onUploadComplete(uploadedKey || undefined)
          } catch (e) {
            console.error('upload failed', e)
          }
        })()

        // do not open cropper for GIFs
        setTempImageUrl("")
        return
      }

      setTempImageUrl(url)
      setShowCropper(true)
    }
  }

  const handleCropComplete = async (croppedFile: File, aspectString?: string) => {
    // Normalize filename and then create preview
    let fileForUpload = croppedFile
    try { fileForUpload = await maybeNormalizeFileName(croppedFile) } catch (e) { /* ignore */ }
    const url = URL.createObjectURL(fileForUpload)
    setPreviewUrl(url)
    // keep onChange for backward compatibility
    onChange(fileForUpload)

    // Try direct signed upload to Cloudflare Images; fallback to server proxy if needed
    ;(async () => {
      const trySignedUpload = async (file: File) => {
        try {
          const signRes = await apiFetch('/api/images/direct-upload', { method: 'POST' })
          if (!signRes.ok) throw new Error('Failed to get direct upload URL')
          const signJson = await signRes.json()
          const uploadURL: string | undefined = signJson?.result?.uploadURL
          const cfId: string | undefined = signJson?.result?.id
          if (!uploadURL || !cfId) throw new Error('Invalid direct upload response')

          // Attempt PUT with retries
          const maxAttempts = 3
          let attempt = 0
          let lastErr: any = null
          // Use multipart/form-data POST to upload to Cloudflare Images uploadURL.
          while (attempt < maxAttempts) {
              try {
                const fd = new FormData()
                fd.append('file', file)
                const postRes = await fetch(uploadURL, { method: 'POST', body: fd })
                if (!postRes.ok) throw new Error(`POST form upload failed: ${postRes.status}`)
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
        const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd })
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
        // Prefer original URL for GIFs (to preserve animation). Variants may be transformed/static.
        const variants: string[] | undefined = json?.result?.variants
        const originalUrl: string | undefined = json?.result?.publicUrl || json?.result?.url
        let uploadedUrl: string | undefined
        try {
          const isGif = file?.type === 'image/gif' || (file?.name && file.name.toLowerCase().endsWith('.gif'))
          if (isGif) {
            uploadedUrl = originalUrl || (Array.isArray(variants) ? variants.find((v) => v.toLowerCase().endsWith('.gif')) : undefined) || variants?.[0]
          } else {
            uploadedUrl = (Array.isArray(variants) && variants[0]) || originalUrl
          }
        } catch (e) {
          uploadedUrl = (Array.isArray(variants) && variants[0]) || originalUrl
        }
        return { url: uploadedUrl }
      }

        try {
          let result
          const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          const forceProxy = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_FORCE_PROXY_UPLOAD === 'true')
          const useDirect = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_USE_DIRECT_UPLOAD === 'true')

          // Compress on the client before upload (skip GIFs).
          let fileToUpload = fileForUpload
          try {
            fileToUpload = await maybeCompressClientFile(fileForUpload)
          } catch (e) {
            console.warn('Client compression failed, using original file', e)
            fileToUpload = fileForUpload
          }

          if (isLocalhost || forceProxy || !useDirect) {
            // In dev (localhost) some third-party signed upload endpoints block PUT via CORS.
            // Use the server proxy upload to avoid CORS issues. Also prefer proxy by default
            // unless `NEXT_PUBLIC_USE_DIRECT_UPLOAD=true` is explicitly set in the environment.
            console.log('ImageUpload: using proxy upload due to localhost/force proxy/feature flag')
            result = await fallbackProxyUpload(fileToUpload)
          } else {
            try {
              result = await trySignedUpload(fileToUpload)
            } catch (err) {
              console.warn('Signed upload failed, falling back to proxy upload', err)
              result = await fallbackProxyUpload(fileToUpload)
            }
          }

          try { console.log('[ImageUpload] upload result', { result }) } catch (e) {}
          const uploadedUrl = result?.url
          const uploadedKey = (result as any)?.key || undefined
          const cfId = (result as any)?.id || undefined

          // Prefer canonical `key` payload from upload endpoints. If a key exists,
          // call images/complete with only the key to enforce the key-only policy.
          if (uploadedKey) {
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
              await apiFetch('/api/images/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: uploadedKey, filename: croppedFile.name, target: completeTarget, aspect: aspectString || selectedAspect }),
              })
            } catch (err) {
              console.warn('images/complete failed', err)
            }
          } else if (cfId) {
            // Backward compatibility: if the upload flow returned only a Cloudflare Images id
            // (no R2 key), fall back to the previous behaviour to avoid breaking uploads.
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
              await apiFetch('/api/images/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cf_id: cfId, url: uploadedUrl, filename: croppedFile.name, target: completeTarget, aspect: aspectString || selectedAspect }),
              })
            } catch (err) {
              console.warn('images/complete failed', err)
            }
          }

          // Only report canonical R2 key to callers (key-only policy).
          if (onUploadComplete) onUploadComplete(uploadedKey || undefined)
        } catch (e) {
          console.error('upload failed', e)
          // Keep local preview visible as a fallback so the editor doesn't go blank
          try {
            if (!previewUrl && typeof croppedFile !== 'undefined') setPreviewUrl(URL.createObjectURL(croppedFile))
          } catch (e2) {}
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
        {aspectRatioType === 'product' && (
          <div className="mt-2">
            <Label className="text-xs sm:text-sm font-medium">画像比率</Label>
            <Select value={selectedAspect} onValueChange={setSelectedAspect}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1" className="text-xs sm:text-sm">正方形 (1:1)</SelectItem>
                <SelectItem value="4:3" className="text-xs sm:text-sm">横長 (4:3)</SelectItem>
                <SelectItem value="16:9" className="text-xs sm:text-sm">横長ワイド (16:9)</SelectItem>
                <SelectItem value="2:3" className="text-xs sm:text-sm">縦長 (2:3)</SelectItem>
                <SelectItem value="3:4" className="text-xs sm:text-sm">縦長 (3:4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
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
            <div className={`relative ${aspectRatioType === "header" ? "aspect-3/1" : aspectRatioType === "recipe" || aspectRatioType === "background" ? "aspect-video" : "aspect-square"}`}>
              {
                (() => {
                  // Determine usage mapping for preview
                  const usage = aspectRatioType === 'header' ? 'header-large' : aspectRatioType === 'recipe' ? 'recipe' : aspectRatioType === 'profile' ? 'avatar' : aspectRatioType === 'product' ? 'list' : aspectRatioType === 'background' ? 'original' : 'list'
                  // If previewUrl is a blob: or data: URL, use it directly
                  if (typeof previewUrl === 'string' && (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:'))) {
                    return <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover" />
                  }
                  const resp = responsiveImageForUsage(previewUrl || null, usage as any)
                  return <img src={resp.src || previewUrl || "/placeholder.svg"} srcSet={resp.srcSet || undefined} sizes={resp.sizes} alt="プレビュー" className="w-full h-full object-cover" />
                })()
              }
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
