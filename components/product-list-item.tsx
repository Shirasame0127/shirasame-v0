"use client"

import Image from "next/image"
import { getPublicImageUrl } from "@/lib/image-url"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import type { Product } from "@/lib/db/schema"

interface ProductListItemProps {
  product: Product
  onUpdate?: () => void
}

export function ProductListItem({ product, onUpdate }: ProductListItemProps) {
  const mainImage = product.images?.find((img) => img.role === "main") || product.images?.[0]

  const handleDelete = async () => {
    if (!product?.id) {
      alert('削除対象のIDが見つかりません。しばらくしてから再度お試しください。')
      return
    }

    if (!confirm(`「${product.title}」を削除してもよろしいですか？`)) return
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      if (onUpdate) onUpdate()
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert('削除に失敗しました')
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
            <Image
              src={getPublicImageUrl(mainImage?.url) || "/placeholder.svg?height=200&width=200"}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.shortDescription}</p>
                )}
              </div>
              <Badge variant={product.published ? "default" : "secondary"}>
                {product.published ? "公開中" : "下書き"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {product.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.price && <span className="text-sm font-medium">¥{product.price.toLocaleString()}</span>}
            </div>

            <div className="flex gap-2">
              {product?.id ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Edit className="w-4 h-4 mr-1" />
                    編集
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  <Edit className="w-4 h-4 mr-1" />
                  編集不可
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
