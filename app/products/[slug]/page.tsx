"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db/storage"
import type { Product } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    const products = db.products.getAll()
    const found = products.find((p) => p.slug === slug)
    setProduct(found || null)
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const mainImage = product.images.find((img) => img.role === "main") || product.images[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <Image
              src={mainImage?.url || "/placeholder.svg?height=600&width=600"}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-4 text-balance">{product.title}</h1>

            <p className="text-xl text-muted-foreground mb-6">{product.shortDescription || product.body}</p>

            {product.price && <p className="text-3xl font-bold mb-8">¥{product.price.toLocaleString()}</p>}

            {product.body && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-3">商品詳細</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.body}</p>
                </CardContent>
              </Card>
            )}

            {product.affiliateLinks && product.affiliateLinks.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">購入リンク</h3>
                {product.affiliateLinks.map((link, index) => (
                  <Button key={index} asChild variant="default" size="lg" className="w-full">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
