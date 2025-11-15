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
    onChange(croppedFile)
    setShowCropper(false)

    if (isDialogMode && onUploadComplete) {
      onUploadComplete(url)
      onOpenChange?.(false)
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
              className={`relative ${aspectRatioType === "header" ? "aspect-[3/1]" : aspectRatioType === "recipe" || aspectRatioType === "background" ? "aspect-video" : "aspect-square"}`}
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
