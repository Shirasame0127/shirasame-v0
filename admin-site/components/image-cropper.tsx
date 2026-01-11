"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RotateCw } from 'lucide-react'
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  onCropComplete: (croppedImage: File, aspectRatio: string) => void
  aspectRatioType?: "product" | "recipe" | "profile" | "header" | "background"
  forcedAspect?: string
}

const RECIPE_ASPECT_RATIOS = [
  { value: "1:1", label: "正方形 (1:1)", ratio: 1 / 1 },
  { value: "2:3", label: "縦長 (2:3)", ratio: 2 / 3 },
  { value: "3:2", label: "横長 (3:2)", ratio: 3 / 2 },
  { value: "3:4", label: "縦長 (3:4)", ratio: 3 / 4 },
  { value: "4:3", label: "横長 (4:3)", ratio: 4 / 3 },
  { value: "3:5", label: "縦長 (3:5)", ratio: 3 / 5 },
  { value: "5:3", label: "横長 (5:3)", ratio: 5 / 3 },
  { value: "5:7", label: "縦長 (5:7)", ratio: 5 / 7 },
  { value: "7:5", label: "横長 (7:5)", ratio: 7 / 5 },
  { value: "4:5", label: "縦長 (4:5)", ratio: 4 / 5 },
  { value: "5:4", label: "横長 (5:4)", ratio: 5 / 4 },
  { value: "9:16", label: "縦長 (9:16)", ratio: 9 / 16 },
  { value: "16:9", label: "横長 (16:9)", ratio: 16 / 9 },
  { value: "free", label: "フリーサイズ" },
]

const ASPECT_RATIOS: Record<string, { value: number; label: string; aspect?: string }> = {
  product: { value: 1, label: "商品画像 (1:1)", aspect: "1:1" },
  profile: { value: 1, label: "プロフィール画像 (1:1)", aspect: "1:1" },
  header: { value: 16 / 9, label: "ヘッダー画像 (16:9)", aspect: "16:9" },
  background: { value: 16 / 9, label: "背景画像 (16:9)", aspect: "16:9" },
}

export function ImageCropper({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
  aspectRatioType = "product",
  forcedAspect,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRecipeAspect, setSelectedRecipeAspect] = useState("4:3")
  const [selectedProductAspect, setSelectedProductAspect] = useState("1:1")

  const isRecipe = aspectRatioType === "recipe"
  let aspectRatio: number | undefined
  let aspectString: string
  if (!isRecipe && (forcedAspect && forcedAspect.length > 0)) {
    const parts = forcedAspect.split(":")
    if (parts.length === 2) {
      const a = Number(parts[0])
      const b = Number(parts[1])
      aspectRatio = a && b ? a / b : ASPECT_RATIOS[aspectRatioType]?.value || 1
      aspectString = forcedAspect
    } else {
      aspectRatio = ASPECT_RATIOS[aspectRatioType]?.value || 1
      aspectString = ASPECT_RATIOS[aspectRatioType]?.aspect || "1:1"
    }
  } else {
    if (isRecipe) {
      if (selectedRecipeAspect === 'free') {
        aspectRatio = undefined
        aspectString = 'free'
      } else {
        aspectRatio = RECIPE_ASPECT_RATIOS.find((r) => r.value === selectedRecipeAspect)?.ratio || 4 / 3
        aspectString = selectedRecipeAspect
      }
    } else if (aspectRatioType === 'product') {
      if (selectedProductAspect === 'free') {
        aspectRatio = undefined
        aspectString = 'free'
      } else if (selectedProductAspect && selectedProductAspect.length > 0) {
        const parts = selectedProductAspect.split(":")
        if (parts.length === 2) {
          const a = Number(parts[0])
          const b = Number(parts[1])
          aspectRatio = a && b ? a / b : ASPECT_RATIOS.product.value
          aspectString = selectedProductAspect
        } else {
          aspectRatio = ASPECT_RATIOS.product.value
          aspectString = ASPECT_RATIOS.product.aspect || "1:1"
        }
      } else {
        aspectRatio = ASPECT_RATIOS.product.value
        aspectString = ASPECT_RATIOS.product.aspect || "1:1"
      }
    } else {
      aspectRatio = ASPECT_RATIOS[aspectRatioType]?.value || 1
      aspectString = ASPECT_RATIOS[aspectRatioType]?.aspect || "1:1"
    }
  }

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
            onCropComplete(file, aspectString)
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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">
            {isRecipe ? "レシピ画像のトリミング" : ASPECT_RATIOS[aspectRatioType]?.label || "画像のトリミング"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {isRecipe && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">アスペクト比</Label>
              <Select value={selectedRecipeAspect} onValueChange={setSelectedRecipeAspect}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_ASPECT_RATIOS.map((aspect) => (
                    <SelectItem key={aspect.value} value={aspect.value} className="text-xs sm:text-sm">
                      {aspect.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {aspectRatioType === 'product' && !forcedAspect && (
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">画像比率</Label>
              <Select value={selectedProductAspect} onValueChange={setSelectedProductAspect}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1" className="text-xs sm:text-sm">正方形 (1:1)</SelectItem>
                  <SelectItem value="4:3" className="text-xs sm:text-sm">横長 (4:3)</SelectItem>
                  <SelectItem value="16:9" className="text-xs sm:text-sm">横長ワイド (16:9)</SelectItem>
                  <SelectItem value="9:16" className="text-xs sm:text-sm">縦長 (9:16)</SelectItem>
                  <SelectItem value="free" className="text-xs sm:text-sm">フリーサイズ</SelectItem>
                  <SelectItem value="2:3" className="text-xs sm:text-sm">縦長 (2:3)</SelectItem>
                  <SelectItem value="3:4" className="text-xs sm:text-sm">縦長 (3:4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative h-[250px] sm:h-[400px] bg-muted rounded-lg overflow-hidden">
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

          <div className="space-y-2 sm:space-y-3">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">ズーム</label>
              <Slider value={[zoom]} onValueChange={(values) => setZoom(values[0])} min={1} max={3} step={0.1} />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">回転</label>
                <Slider
                  value={[rotation]}
                  onValueChange={(values) => setRotation(values[0])}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRotation((rotation + 90) % 360)} 
                className="mt-5 sm:mt-6"
              >
                <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
          <Button 
            size="sm" 
            onClick={createCroppedImage}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? "処理中..." : "完了"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
 