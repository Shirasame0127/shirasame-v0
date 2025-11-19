"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Sparkles } from 'lucide-react'
import type { Product } from "@/lib/mock-data/products"
import { db } from "@/lib/db/storage"

interface ProductCardProps {
  product: Product
  size?: "sm" | "md"
  isAdminMode?: boolean
  onClick?: () => void
}

export function ProductCard({ product, size = "md", isAdminMode = false, onClick }: ProductCardProps) {
  const mainImage = product.images.find((img) => img.role === "main") || product.images[0]

  const getActiveSaleInfo = () => {
    const activeSchedules = db.amazonSaleSchedules?.getActiveSchedules() || []
    
    for (const schedule of activeSchedules) {
      const collection = db.collections.getById(schedule.collectionId)
      if (collection && collection.productIds.includes(product.id)) {
        return { isOnSale: true, saleName: schedule.saleName }
      }
    }
    return { isOnSale: false, saleName: null }
  }

  const { isOnSale, saleName } = getActiveSaleInfo()

  const handleClick = (e: React.MouseEvent) => {
    if (isAdminMode && onClick) {
      e.preventDefault()
      onClick()
    }
  }

  if (size === "sm") {
    const content = (
      <>
        <CardHeader className="p-0 relative">
          <div className="block relative aspect-square overflow-hidden bg-muted">
            <Image src={mainImage?.url || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
            {isOnSale && (
              <div className="absolute top-1 right-1 z-10">
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {saleName}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <h3 className="font-semibold text-xs line-clamp-2">{product.title}</h3>
        </CardContent>
      </>
    )

    if (isAdminMode) {
      return (
        <Card
          className="overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={handleClick}
        >
          {content}
        </Card>
      )
    }

    return (
      <Link href={`/products/${product.slug}`}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">{content}</Card>
      </Link>
    )
  }

  const content = (
    <>
      <CardHeader className="p-0 relative">
        <div className="block relative aspect-square overflow-hidden bg-muted">
          <Image
            src={mainImage?.url || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOnSale && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive" className="text-xs px-2 py-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {saleName}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-4">
        <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">{product.shortDescription}</p>
        <div className="flex flex-wrap gap-1 md:gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-2 md:p-4 md:pt-0 flex items-center justify-between">
        {isAdminMode && product.price && <p className="font-bold text-sm md:text-lg">¥{product.price.toLocaleString()}</p>}
        {!isAdminMode && (
          <span className="text-xs md:text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            詳細
            <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </span>
        )}
      </CardFooter>
    </>
  )

  if (isAdminMode) {
    return (
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
        onClick={handleClick}
      >
        {content}
      </Card>
    )
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">{content}</Card>
    </Link>
  )
}
