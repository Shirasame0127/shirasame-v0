"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, X, Sparkles } from 'lucide-react'
import Image from "next/image"
import type { Product } from "@/lib/db/schema"
import { useEffect, useRef, useState } from "react"
import { db } from "@/lib/db/storage"
import { getPublicImageUrl } from "@/lib/image-url"

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  initialImageUrl?: string
}

function detectLinkType(url: string): 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'twitch' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('twitch.tv') || url.includes('clips.twitch.tv')) return 'twitch'
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
  // Match full form: https://www.tiktok.com/@user/video/123456789
  const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)
  if (match) return match[1]
  // Short URLs (vt.tiktok.com / vm.tiktok.com) cannot reliably provide id here
  return null
}

function extractTwitterId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/)
  return match ? match[1] : null
}

function extractInstagramId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/)
  return match ? match[1] : null
}

type TwitchInfo = { kind: 'video' | 'clip' | 'channel'; id: string } | null
function extractTwitchInfo(url: string): TwitchInfo {
  let m = url.match(/clips\.twitch\.tv\/([^\/?#]+)/)
  if (m) return { kind: 'clip', id: m[1] }
  m = url.match(/twitch\.tv\/videos\/(\d+)/)
  if (m) return { kind: 'video', id: m[1] }
  m = url.match(/twitch\.tv\/([^\/?#]+)/)
  if (m) return { kind: 'channel', id: m[1] }
  return null
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" width="20" height="20" className={className} aria-hidden>
      <path fill="#010101" d="M0 0h256v256H0z" fillOpacity="0" />
      <path d="M189.7 70.8c-6.7-.4-13.1-1.9-19-4.4v70.8c0 23.6-19.1 42.7-42.7 42.7-23.6 0-42.7-19.1-42.7-42.7s19.1-42.7 42.7-42.7c4.6 0 9 .7 13.1 2V62.2c-6.1-2-12.6-3.2-19.3-3.6V28.3c12.3 1 23.9 5.1 33.9 11.8 0 0 0 38.3 33.7 44.5V70.8z" fill="#69C9D0" />
      <path d="M189.7 70.8v.1c-6.7-.4-13.1-1.9-19-4.4v70.8c0 23.6-19.1 42.7-42.7 42.7-12.9 0-24.4-5.6-32.7-14.6v-28.1c7.4 7.4 17.7 11.9 28.7 11.9 23.6 0 42.7-19.1 42.7-42.7V38.8c6.6 6.7 15 11.5 24 14.7z" fill="#EE1D52" />
      <path d="M189.7 70.8c0 .1 0 .1 0 .2v36.7c-6.1-2-12.6-3.2-19.3-3.6V57.2c6.1 2 12.6 3.2 19.3 3.6z" fill="#010101" />
    </svg>
  )
}

function EmbeddedLink({ url }: { url: string }) {
  const type = detectLinkType(url)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let obs: MutationObserver | null = null

    const loadScript = (src: string) => {
      const s = document.createElement('script')
      s.async = true
      s.src = src
      document.body.appendChild(s)
      return s
    }

    if (type === 'twitter') {
      loadScript('https://platform.twitter.com/widgets.js')
    }
    if (type === 'instagram') {
      const s = loadScript('https://www.instagram.com/embed.js')
      // instagram's script will process embeds; observe for iframe insertion
      if (containerRef.current) {
        obs = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (!mounted) return
            if (m.addedNodes && m.addedNodes.length > 0) {
              // check for iframe in subtree
              const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
              if (iframe) {
                iframe.addEventListener('load', () => mounted && setLoading(false))
                obs?.disconnect()
              }
            }
          }
        })
        obs.observe(containerRef.current, { childList: true, subtree: true })
      }
      // if already available, process instantly
      // @ts-ignore
      if ((window as any).instgrm && (window as any).instgrm.Embeds) try { (window as any).instgrm.Embeds.process() } catch {}
    }

    // Do not auto-load TikTok embed script. TikTok short URLs and embed scripts
    // can be fragile and slow; we'll render a simple link button instead.

    // cleanup
    return () => { mounted = false; obs?.disconnect() }
  }, [type, url])

  // Helper spinner element
  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
      <svg className="w-10 h-10 text-white" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {/* Static circular indicator (no rotation) */}
        <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="31.415, 31.415" opacity="0.9" />
      </svg>
    </div>
  )

  if (type === 'youtube') {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
          {loading && <Spinner />}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => setLoading(false)}
          />
        </div>
      )
    }
  }

  if (type === 'tiktok') {
    // Render a dedicated TikTok link button (no embed preview)
    return (
      <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <TikTokIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">TikTokで見る</span>
        </a>
      </Button>
    )
  }

  // Twitch handling (info extraction) - attach onLoad to iframe
  if (type === 'twitch') {
    const info = extractTwitchInfo(url)
    const parent = typeof window !== 'undefined' ? window.location.hostname : ''
    if (info) {
      if (info.kind === 'clip') {
        const clipId = info.id
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
            {loading && <Spinner />}
            <iframe
              src={`https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipId)}&parent=${encodeURIComponent(parent)}`}
              title="Twitch clip"
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              onLoad={() => setLoading(false)}
            />
          </div>
        )
      }
      if (info.kind === 'video') {
        const videoId = info.id
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
            {loading && <Spinner />}
            <iframe
              src={`https://player.twitch.tv/?video=${encodeURIComponent(videoId)}&parent=${encodeURIComponent(parent)}&autoplay=false`}
              title="Twitch video player"
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              onLoad={() => setLoading(false)}
            />
          </div>
        )
      }
      if (info.kind === 'channel') {
        const channel = info.id
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
            {loading && <Spinner />}
            <iframe
              src={`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&autoplay=false`}
              title="Twitch channel player"
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              onLoad={() => setLoading(false)}
            />
          </div>
        )
      }
    }
  }

  // Twitter embed block (script inserted in effect will process this)
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

  // Instagram embed block
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
        <ExternalLink className="w-3 h-3 shrink-0" />
        <span className="truncate">{url}</span>
      </a>
    </Button>
  )
}

export function ProductDetailModal({ product, isOpen, onClose, initialImageUrl }: ProductDetailModalProps) {
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

  const leftImageRef = useRef<HTMLDivElement | null>(null)
  const [modalMinHeight, setModalMinHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    function updateHeight() {
      // Only apply minHeight for desktop/PC widths (>= 1024px)
      const isDesktop = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
      if (isDesktop && leftImageRef.current) {
        setModalMinHeight(leftImageRef.current.clientHeight)
      } else {
        setModalMinHeight(undefined)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [isOpen, product])

  if (!isOpen || !product) return null

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

  // Guard against product.images being undefined (some products may not have images)
  const images = product.images || []
  // Prefer the image user clicked in gallery if provided; otherwise fall back to main → first
  const preferred = initialImageUrl ? images.find((img) => getPublicImageUrl(img.url) === getPublicImageUrl(initialImageUrl)) : null
  const mainImage = preferred || images.find((img) => img.role === "main") || images[0] || null
  const attachmentImages = (images.filter ? images.filter((img) => img.role === "attachment") : []).slice(0, 4)

  const hasTags = product.tags && product.tags.length > 0
  const hasShortDescription = !!product.shortDescription
  const hasPrice = !!product.price && (product.showPrice ?? true)
  const hasBody = !!product.body
  const hasAffiliateLinks = product.affiliateLinks && product.affiliateLinks.length > 0
  const hasNotes = !!product.notes
  const hasAttachments = attachmentImages.length > 0
  const hasRelatedLinks = product.relatedLinks && product.relatedLinks.length > 0

  const rightSideElementCount = [
    hasTags,
    hasShortDescription,
    hasPrice,
    hasBody,
    hasAffiliateLinks,
    hasNotes,
    hasAttachments,
    hasRelatedLinks
  ].filter(Boolean).length

  const useVerticalLayout = rightSideElementCount <= 1

  const modalClassName = useVerticalLayout
    ? 'relative w-[90%] sm:w-1/2 sm:max-w-[400px] h-auto max-h-[85vh] bg-background rounded-lg border shadow-lg animate-in zoom-in-95 fade-in-0 overflow-auto flex flex-col'
    : 'relative w-[95%] sm:w-[85%] lg:w-[75%] max-w-5xl h-auto max-h-[80vh] sm:h-[40vh] bg-background rounded-lg border shadow-lg animate-in zoom-in-95 fade-in-0 overflow-auto sm:overflow-hidden flex flex-col sm:flex-row'

  const leftImageClassName = useVerticalLayout
    ? 'flex-shrink-0 w-full p-4 flex items-center justify-center'
    : 'flex-shrink-0 sm:w-1/2 p-6 sm:border-r flex items-center justify-center sm:h-full'

  const innerImageClassName = useVerticalLayout
    ? 'relative w-full max-w-sm aspect-square mx-auto rounded-lg overflow-hidden bg-muted shadow-sm'
    : 'relative w-full aspect-square rounded-lg overflow-hidden bg-muted shadow-sm'

  const rightContentClassName = useVerticalLayout
    ? 'flex-1 p-6 space-y-4 text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2 overflow-auto'
    : 'flex-1 p-6 space-y-4 text-left sm:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      <div className={modalClassName} style={!useVerticalLayout && modalMinHeight ? { minHeight: `${modalMinHeight}px` } : undefined}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-background/90 backdrop-blur-sm p-1.5"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </button>

        <div ref={leftImageRef} className={leftImageClassName}>
          <div className={innerImageClassName}>
            <Image
              src={getPublicImageUrl(mainImage?.url) || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className={rightContentClassName}>
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

          {hasPrice ? (
            <div className="flex items-center gap-3">
                <p className="text-2xl font-bold">
                ¥{product.price?.toLocaleString()}
              </p>
              {isOnSale && (
                <Badge variant="destructive" className="text-sm px-3 py-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {saleName || 'セール'}
                </Badge>
              )}
            </div>
          ) : (
            isOnSale && (
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="text-sm px-3 py-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {saleName || 'セール'}
                </Badge>
              </div>
            )
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
              {product.affiliateLinks.map((link, index) => {
                // If label is missing, fall back to hostname or generic text
                let label = link.label
                if (!label) {
                  try {
                    const u = new URL(link.url)
                    label = u.hostname.replace('www.', '')
                  } catch (e) {
                    label = '購入リンク'
                  }
                }

                const isTikTok = typeof link.url === 'string' && /(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|vm.tiktok.com|vt.tiktok.com)/i.test(link.url)

                if (isTikTok) {
                  // Render a TikTok-specific button label for better UX
                  const tLabel = link.label || 'TikTokで見る'
                  return (
                    <Button key={index} asChild variant="default" size="lg" className="w-full">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <TikTokIcon className="w-5 h-5" />
                        <span className="truncate">{tLabel}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )
                }

                return (
                  <Button key={index} asChild variant="default" size="lg" className="w-full">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      {label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )
              })}
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
                    <Image src={getPublicImageUrl(img.url) || "/placeholder.svg"} alt="添付画像" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasRelatedLinks && (
            <div>
              <h3 className="font-semibold mb-2 text-sm text-center">関連リンク</h3>
              <div className="space-y-4">
                {(product.relatedLinks || []).map((link, index) => (
                  <EmbeddedLink key={index} url={link} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
