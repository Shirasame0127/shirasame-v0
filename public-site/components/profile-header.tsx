"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getPublicImageUrl, responsiveImageForUsage } from "@/lib/image-url"

type User = {
  id: string
  headerImageKeys?: string[]
  headerImageKey?: string
  headerImages?: string[]
  headerImage?: string
}

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadImages = () => {
      const headerImageKeys = user.headerImageKeys || (user.headerImageKey ? [user.headerImageKey] : [])
      const loadedImages = headerImageKeys
        .map((key) => {
          if (!key) return null
          const candidate = typeof key === "string" && (key.startsWith("http") || key.startsWith("/")) ? key : String(key)
          return getPublicImageUrl(candidate)
        })
        .filter((img): img is string => !!img)

      const legacyImages = user.headerImages || (user.headerImage ? [user.headerImage] : [])
      const finalImages = loadedImages.length > 0 ? loadedImages : legacyImages
      setImages(finalImages)
      setIsLoaded(true)
    }

    loadImages()
  }, [user])

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [images.length])

  if (!isLoaded) {
    return (
      <div className="relative w-full bg-muted animate-pulse" style={{ minHeight: 200, aspectRatio: 16 / 9 }} />
    )
  }

  return (
    <div className="relative overflow-hidden w-full" style={{ aspectRatio: 16 / 9 }}>
      {images.length > 0 ? (
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}>
              {
                (() => {
                  const resp = responsiveImageForUsage(image, 'header-large')
                  return <img
                    src={resp.src || "/placeholder.svg"}
                    srcSet={resp.srcSet || undefined}
                    sizes={resp.sizes}
                    alt={`ヘッダー画像 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      try {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/placeholder.svg'
                        e.currentTarget.srcset = ''
                      } catch {}
                    }}
                  />
                })()
              }
            </div>
          ))}
          <div className="absolute inset-0 bg-black/10" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">ヘッダー画像が設定されていません</p>
        </div>
      )}
    </div>
  )
}
