"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { db } from "@/lib/db/storage"
import type { User } from "@/lib/mock-data/users"

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

      const loadedImages = headerImageKeys.map((key) => db.images.getUpload(key)).filter((img): img is string => !!img)

      const legacyImages = user.headerImages || (user.headerImage ? [user.headerImage] : [])

      const finalImages = loadedImages.length > 0 ? loadedImages : legacyImages

      console.log("[v0] ProfileHeader loaded images:", {
        keys: headerImageKeys,
        loadedCount: loadedImages.length,
        legacyCount: legacyImages.length,
        finalCount: finalImages.length,
      })

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
    return <div className="relative h-[300px] md:h-[400px] w-full bg-muted animate-pulse" />
  }

  return (
    <div className="relative overflow-hidden h-[300px] md:h-[400px] w-full">
      {images.length > 0 ? (
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`ヘッダー画像 ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
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
