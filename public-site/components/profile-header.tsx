"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
// profile header uses transformed URLs returned by the API; no client-side URL generation

type User = {
  id: string
  header_images?: string[]
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
      // Use transformed header image URLs returned by public-worker
      const candidates = (user as any).header_images || user.headerImages || (user.headerImage ? [user.headerImage] : []) || []
      const finalImages = Array.isArray(candidates) ? candidates.filter(Boolean).map(String) : []
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
              <img
                src={image || "/placeholder.svg"}
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
            </div>
          ))}
          <div className="absolute inset-0" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">ヘッダー画像が設定されていません</p>
        </div>
      )}
    </div>
  )
}
