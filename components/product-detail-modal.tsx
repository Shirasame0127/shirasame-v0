"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, X } from 'lucide-react'
import Image from "next/image"
import type { Product } from "@/lib/db/schema"
import { useEffect } from "react"

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

function detectLinkType(url: string): 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('instagram.com')) return 'instagram'
  return 'other'
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractTikTokId(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)
  return match ? match[1] : null
}

function extractTwitterId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/)
  return match ? match[1] : null
}

function extractInstagramId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/)
  return match ? match[1] : null
}

function EmbeddedLink({ url }: { url: string }) {
  const type = detectLinkType(url)

  useEffect(() => {
    if (type === 'twitter') {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      document.body.appendChild(script)
    }
    if (type === 'instagram') {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      // @ts-ignore
      if (window.instgrm) window.instgrm.Embeds.process()
    }
  }, [type])

  if (type === 'youtube') {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
        </div>
      )
    }
  }

  if (type === 'tiktok') {
    const videoId = extractTikTokId(url)
    if (videoId) {
      return (
        <div className="flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={videoId}
            style={{ maxWidth: '605px', minWidth: '325px' }}
          >
            <section>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={url}
              >
                TikTokで見る
              </a>
            </section>
          </blockquote>
          <script async src="https://www.tiktok.com/embed.js"></script>
        </div>
      )
    }
  }

  if (type === 'twitter') {
    const tweetId = extractTwitterId(url)
    if (tweetId) {
      return (
        <div className="flex justify-center">
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={url}>ツイートを見る</a>
          </blockquote>
        </div>
      )
    }
  }

  if (type === 'instagram') {
    const postId = extractInstagramId(url)
    if (postId) {
      return (
        <div className="flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: '0',
              borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: '0',
              width: '99.375%',
            }}
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              Instagramで見る
            </a>
          </blockquote>
        </div>
      )
    }
  }

  return (
    <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{url}</span>
      </a>
    </Button>
  )
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const mainImage = product.images.find((img) => img.role === "main") || product.images[0]
  const attachmentImages = product.images.filter((img) => img.role === "attachment").slice(0, 4)

  const hasTags = product.tags && product.tags.length > 0
  const hasShortDescription = !!product.shortDescription
  const hasPrice = !!product.price
  const hasBody = !!product.body
  const hasAffiliateLinks = product.affiliateLinks && product.affiliateLinks.length > 0
  const hasNotes = !!product.notes
  const hasAttachments = attachmentImages.length > 0
  const hasRelatedLinks = product.relatedLinks && product.relatedLinks.length > 0

  const contentCount = [
    hasTags,
    product.title,
    hasShortDescription,
    hasPrice,
    hasBody,
    hasAffiliateLinks,
    hasNotes,
    hasAttachments,
    hasRelatedLinks
  ].filter(Boolean).length

  const isSimpleLayout = contentCount <= 3

  const isScrollableRight = hasAttachments || hasRelatedLinks

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {isSimpleLayout ? (
        <div className="relative w-[90%] sm:w-auto sm:max-w-md h-auto max-h-[85vh] bg-background rounded-lg border shadow-lg animate-in zoom-in-95 fade-in-0 overflow-hidden flex flex-col">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-background/90 backdrop-blur-sm p-1.5"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </button>

          <div className="overflow-y-auto p-6 space-y-4 text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2">
            <div className="relative w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted shadow-sm">
              <Image
                src={mainImage?.url || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {hasTags && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-xl font-bold">{product.title}</h1>

            {hasShortDescription && (
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            {hasPrice && (
              <p className="text-2xl font-bold">
                ¥{product.price.toLocaleString()}
              </p>
            )}

            {hasBody && (
              <Card>
                <CardContent className="px-4">
                  <h2 className="font-semibold mb-2 text-sm">商品詳細</h2>
                  <p className="text-sm leading-relaxed">{product.body}</p>
                </CardContent>
              </Card>
            )}

            {hasAffiliateLinks && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-center">購入リンク</h3>
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

            {hasNotes && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 text-sm">備考</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.notes}</p>
                </CardContent>
              </Card>
            )}

            {hasAttachments && (
              <div>
                <h3 className="font-semibold mb-2 text-sm text-center">添付画像</h3>
                <div className="grid grid-cols-2 gap-2">
                  {attachmentImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <Image src={img.url || "/placeholder.svg"} alt="添付画像" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasRelatedLinks && (
              <div>
                <h3 className="font-semibold mb-2 text-sm text-center">関連リンク</h3>
                <div className="space-y-4">
                  {product.relatedLinks.map((link, index) => (
                    <EmbeddedLink key={index} url={link} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-[95%] sm:w-[85%] lg:w-[75%] max-w-5xl 
          h-auto max-h-[80vh] sm:h-[40vh]
          bg-background rounded-lg border shadow-lg 
          animate-in zoom-in-95 fade-in-0 
          overflow-auto sm:overflow-hidden flex flex-col sm:flex-row">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-background/90 backdrop-blur-sm p-1.5"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </button>

          <div className="flex-shrink-0 sm:w-1/2 p-6 sm:border-r flex items-center justify-center sm:sticky sm:top-0 sm:self-start">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted shadow-sm">
              <Image
                src={mainImage?.url || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 text-left sm:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2">
            {hasTags && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-xl font-bold">{product.title}</h1>

            {hasShortDescription && (
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            {hasPrice && (
              <p className="text-2xl font-bold">
                ¥{product.price.toLocaleString()}
              </p>
            )}

            {hasBody && (
              <Card>
                <CardContent className="px-2">
                  <h2 className="font-semibold mb-2 text-sm">商品詳細</h2>
                  <p className="text-sm leading-relaxed">{product.body}</p>
                </CardContent>
              </Card>
            )}

            {hasAffiliateLinks && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-center">購入リンク</h3>
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

            {hasNotes && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 text-sm">備考</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.notes}</p>
                </CardContent>
              </Card>
            )}

            {hasAttachments && (
              <div>
                <h3 className="font-semibold mb-2 text-sm text-center">添付画像</h3>
                <div className="grid grid-cols-2 gap-2">
                  {attachmentImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <Image src={img.url || "/placeholder.svg"} alt="添付画像" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasRelatedLinks && (
              <div>
                <h3 className="font-semibold mb-2 text-sm text-center">関連リンク</h3>
                <div className="space-y-4">
                  {product.relatedLinks.map((link, index) => (
                    <EmbeddedLink key={index} url={link} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
