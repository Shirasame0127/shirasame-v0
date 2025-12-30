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
      <div className="relative w-full bg-muted animate-pulse aspect-square sm:aspect-[16/9] h-auto" />
    )
  }

  return (
    <div className="relative overflow-hidden w-full aspect-square sm:aspect-[16/9] h-auto">
      {/* decorative pastel floating circles (visual only) */}
      <div aria-hidden className="pointer-events-none">
        <div
          style={{
            position: 'absolute',
            left: '6%',
            top: '8%',
            width: 84,
            height: 84,
            borderRadius: 9999,
            background: 'rgba(255,183,197,0.62)',
            filter: 'blur(18px)',
            transform: 'translateZ(0)',
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '6%',
            top: '28%',
            width: 120,
            height: 120,
            borderRadius: 9999,
            background: 'rgba(179,229,252,0.48)',
            filter: 'blur(22px)',
            transform: 'translateZ(0)',
            animation: 'floaty 8s ease-in-out infinite',
            animationDelay: '1.2s',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '52%',
            bottom: '10%',
            width: 64,
            height: 64,
            borderRadius: 9999,
            background: 'rgba(212,237,218,0.6)',
            filter: 'blur(16px)',
            transform: 'translateZ(0)',
            animation: 'floaty 7s ease-in-out infinite',
            animationDelay: '0.6s',
          }}
        />
      </div>

      <style>{`@keyframes floaty { 0% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-12px) translateX(6px); } 100% { transform: translateY(0px) translateX(0px); } }`}</style>

      {images.length > 0 ? (
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}>
              <img
                src={image || "/placeholder.svg"}
                alt={`ヘッダー画像 ${index + 1}`}
                className="w-full h-full object-cover object-top no-download"
                style={{ filter: 'saturate(0.75)' }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
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
