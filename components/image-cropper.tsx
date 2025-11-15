"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { RotateCw } from 'lucide-react'
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  onCropComplete: (croppedImage: File) => void
  aspectRatioType?: "product" | "recipe" | "profile" | "header" | "background"
}

const ASPECT_RATIOS = {
  product: { value: 1, label: "商品画像 (1:1)" },
  recipe: { value: 4 / 3, label: "レシピ画像 (4:3)" },
  profile: { value: 1, label: "プロフィール画像 (1:1)" },
  header: { value: 3, label: "ヘッダー画像 (3:1)" },
  background: { value: 16 / 9, label: "背景画像 (16:9)" },
}

export function ImageCropper({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
  aspectRatioType = "product",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const aspectRatio = ASPECT_RATIOS[aspectRatioType].value

  const onCropCompleteCallback = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = async () => {
    if (!croppedAreaPixels || isProcessing) return

    setIsProcessing(true)

    try {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.src = imageUrl

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const { width, height, x, y } = croppedAreaPixels

      canvas.width = width
      canvas.height = height

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-width / 2, -height / 2)

      ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
      ctx.restore()

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" })
            onCropComplete(file)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setRotation(0)
            setCroppedAreaPixels(null)
            setIsProcessing(false)
            onOpenChange(false)
          } else {
            setIsProcessing(false)
          }
        },
        "image/jpeg",
        0.95,
      )
    } catch (error) {
      console.error("[v0] Crop error:", error)
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setIsProcessing(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl mx-4">
        <DialogHeader>
          <DialogTitle className="text-base">{ASPECT_RATIOS[aspectRatioType].label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteCallback}
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">ズーム</label>
              <Slider value={[zoom]} onValueChange={(values) => setZoom(values[0])} min={1} max={3} step={0.1} />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium">回転</label>
                <Slider
                  value={[rotation]}
                  onValueChange={(values) => setRotation(values[0])}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)} className="mt-6">
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button 
            size="sm" 
            onClick={createCroppedImage}
            disabled={isProcessing}
          >
            {isProcessing ? "処理中..." : "完了"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
