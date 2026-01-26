"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, X, Sparkles } from 'lucide-react'
import EmbeddedLink from './embedded-link'
import Image from "next/image"
import { buildResizedImageUrl } from '@/lib/image-url'

import { useEffect, useRef, useState } from "react"


interface ProductDetailModalProps {
  product: any | null
  isOpen: boolean
  onClose: () => void
  initialImageUrl?: string
  saleName?: string | null
}

export function ProductDetailModal({ product, isOpen, onClose, initialImageUrl, saleName }: ProductDetailModalProps) {
  const scrollYRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isOpen) {
      if (scrollYRef.current !== null) {
        const y = scrollYRef.current
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, y)
        scrollYRef.current = null
      }
      return
    }
    // lock scroll: fix body in place and preserve scroll position to avoid jump on mobile/iOS
    scrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollYRef.current}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    return () => {
      if (scrollYRef.current !== null) {
        const y = scrollYRef.current
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, y)
        scrollYRef.current = null
      }
    }
  }, [isOpen])

  const leftImageRef = useRef<HTMLDivElement | null>(null)
  const [modalMinHeight, setModalMinHeight] = useState<number | undefined>(undefined)
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  useEffect(() => {
    function updateHeight() {
      const isDesktop = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
      if (isDesktop && leftImageRef.current) setModalMinHeight(leftImageRef.current.clientHeight); else setModalMinHeight(undefined)
    }
    updateHeight(); window.addEventListener('resize', updateHeight); return () => window.removeEventListener('resize', updateHeight)
  }, [isOpen, product])
  if (!isOpen) return null

  // API now returns `main_image: { src, srcSet } | null` and `attachment_images: [{ src, srcSet }]`.
  // Normalize sources: prefer `main_image`/`attachment_images`, fall back to legacy `images` shape.
  const apiMainImage = product && product.main_image && typeof product.main_image === 'object' ? product.main_image : null
  const apiAttachments = Array.isArray(product?.attachment_images) ? product.attachment_images : []

  // Legacy images normalization (if worker hasn't provided main_image): images[].url -> {src, srcSet}
  const legacyImages = Array.isArray(product?.images) ? product.images.map((img: any) => ({ src: img?.url || null, srcSet: img?.srcSet || img?.src || null, role: img?.role || null, id: img?.id || null })) : []

  // Determine initial/main image
  let mainImage: { src?: string | null; srcSet?: string | null } | null = null
  if (initialImageUrl) {
    // try match against apiMainImage, apiAttachments or legacyImages
    if (apiMainImage && apiMainImage.src === initialImageUrl) mainImage = apiMainImage
    else {
      const matchLegacy = legacyImages.find((l: any) => l.src === initialImageUrl)
      if (matchLegacy) mainImage = { src: matchLegacy.src, srcSet: matchLegacy.srcSet }
      else {
        const matchAttach = apiAttachments.find((a: any) => a && a.src === initialImageUrl)
        if (matchAttach) mainImage = matchAttach
      }
    }
  }
  // If initialImageUrl provided but no match was found, use it directly so modal shows immediately
  if (initialImageUrl && !mainImage) {
    mainImage = { src: initialImageUrl, srcSet: null }
  }
  if (!mainImage) mainImage = apiMainImage || (legacyImages.find((l: any) => l.role === 'main') ? { src: legacyImages.find((l: any) => l.role === 'main').src, srcSet: legacyImages.find((l: any) => l.role === 'main').srcSet } : (legacyImages[0] ? { src: legacyImages[0].src, srcSet: legacyImages[0].srcSet } : null))

  // Attachment images to render (ensure {src,srcSet} shape)
  const attachmentImages = (apiAttachments.length > 0 ? apiAttachments : legacyImages.filter((l: any) => l.role === 'attachment').map((l: any) => ({ src: l.src, srcSet: l.srcSet }))) .slice(0, 4)

  const hasTags = product?.tags && product.tags.length > 0
  const hasShortDescription = !!product?.shortDescription
  // Treat 0 and numeric strings as valid prices. Respect explicit showPrice / show_price flags.
  const rawPrice = product?.price ?? null
  const parsedPrice = typeof rawPrice === 'number' ? rawPrice : (typeof rawPrice === 'string' && /^\d+$/.test(rawPrice) ? Number(rawPrice) : (rawPrice === null ? null : Number(rawPrice)))
  // Force-show price regardless of showPrice / show_price flags
  const hasPrice = parsedPrice !== null && !Number.isNaN(parsedPrice)
  const hasBody = !!product?.body
  const hasAffiliateLinks = product?.affiliateLinks && product.affiliateLinks.length > 0
  const hasNotes = !!product?.notes
  const hasAttachments = attachmentImages.length > 0
  const hasRelatedLinks = product?.relatedLinks && product.relatedLinks.length > 0

  const rightSideElementCount = [hasTags, hasShortDescription, hasPrice, hasBody, hasAffiliateLinks, hasNotes, hasAttachments, hasRelatedLinks].filter(Boolean).length
  const useVerticalLayout = rightSideElementCount <= 1

  // 調整可能なテキスト間隔（必要に応じて数値を変更してください）
  const textSpacing = {
    titleMarginBottom: '0.2rem',
    shortDescriptionMarginBottom: '0.5rem',
    sectionRowGap: '1rem'
  }

  const modalClassName = useVerticalLayout
    ? 'relative w-[90%] sm:w-1/2 sm:max-w-[400px] h-auto max-h-[85vh] bg-white dark:bg-slate-900 rounded-lg border shadow-lg animate-in zoom-in-95 fade-in-0 overflow-auto flex flex-col'
    : 'relative w-[95%] sm:w-[85%] lg:w-[75%] max-w-5xl h-auto max-h-[80vh] sm:h-[40vh] bg-white dark:bg-slate-900 rounded-lg border shadow-lg animate-in zoom-in-95 fade-in-0 overflow-auto sm:overflow-hidden flex flex-col sm:flex-row'

  const leftImageClassName = useVerticalLayout ? 'flex-shrink-0 w-full p-4 flex items-center justify-center' : 'flex-shrink-0 sm:w-1/2 p-6 sm:border-r flex items-center justify-center sm:h-full'
  // Force square (1:1) image container to avoid layout shift and ensure consistent presentation
  const innerImageClassName = useVerticalLayout
    ? 'relative w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center aspect-square'
    : 'relative w-full max-w-[640px] rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center aspect-square'
  const rightContentClassName = useVerticalLayout ? 'flex-1 pt-4 pb-6 px-6 space-y-4 text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2 overflow-auto' : 'flex-1 pt-4 pb-6 px-6 space-y-4 text-left sm:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded sm:[&::-webkit-scrollbar]:w-2'

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in-0" onClick={onClose} />

      <div className={modalClassName} style={!useVerticalLayout && modalMinHeight ? { minHeight: `${modalMinHeight}px` } : undefined}>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-sm opacity-90 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10 bg-white/95 dark:bg-black/70 p-1.5">
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </button>

        <div ref={leftImageRef} className={leftImageClassName}>
            <div className={innerImageClassName}>
                {
                  (() => {
                    const displaySrc = mainImage?.src || "/placeholder.svg"
                    const displaySrcSet = mainImage?.srcSet || undefined

                    const forceWidth = 1000
                    const tryForceCdnWidth = (url?: string | null) => {
                      if (!url) return url || null
                      try {
                        // If URL already contains Cloudflare's cdn-cgi/image/width=..., replace width value
                        const m = url.match(/(\/cdn-cgi\/image\/(?:[^/]*?)width=)\d+/)
                        if (m) {
                          return url.replace(/(\/cdn-cgi\/image\/(?:[^/]*?)width=)\d+/, `$1${forceWidth}`)
                        }
                      } catch {}
                      return null
                    }

                    let finalSrc: string | null = null
                    let finalSrcSet: string | undefined = undefined

                    // Prefer to rewrite existing CDN-transformed URLs
                    const rewritten = tryForceCdnWidth(displaySrc)
                    if (rewritten) {
                      finalSrc = rewritten
                      finalSrcSet = displaySrcSet ? displaySrcSet.replace(/\b\d+w\b/g, `${forceWidth}w`) : `${finalSrc} ${forceWidth}w`
                    } else {
                      // Fallback: attempt to build a resized variant (handles raw keys/URLs)
                      try {
                        const built = buildResizedImageUrl(displaySrc, { width: forceWidth, format: 'auto', quality: 75 })
                        if (built) {
                          finalSrc = built
                          finalSrcSet = `${built} ${forceWidth}w`
                        }
                      } catch {}
                    }

                    if (!finalSrc) {
                      finalSrc = displaySrc
                      finalSrcSet = displaySrcSet || undefined
                    }

                    return <img src={finalSrc || "/placeholder.svg"} srcSet={finalSrcSet} alt={product.title || '商品画像'} className="w-full h-full object-cover" onLoad={(e) => { try { const t = e.currentTarget as HTMLImageElement; setImageAspectRatio(t.naturalWidth / t.naturalHeight); } catch {} }} />
                  })()
                }
            {saleName && (
              <div className="absolute left-3 top-3 z-10">
                <span className="inline-flex items-center rounded-full bg-pink-600 text-white text-[11px] font-semibold px-2 py-0.5 shadow-sm">
                  {saleName}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={rightContentClassName} style={{ rowGap: textSpacing.sectionRowGap }}>
          {!product ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="space-y-2 text-center">
                <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">読み込み中...</p>
              </div>
            </div>
          ) : (
            <>
              {hasTags && (
                <div className="flex flex-wrap gap-2">
                  {product?.tags?.map((tag: any) => (
                    <span key={tag} className="inline-flex items-center bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {hasShortDescription && (
                <p className="text-sm text-muted-foreground" style={{ marginBottom: '0em' }}>{product?.shortDescription}</p>
              )}

              <h1 className="text-xl font-bold" style={{ marginBottom: textSpacing.titleMarginBottom }}>{product?.title || ''}</h1>

              {hasPrice ? (
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold">¥{(typeof parsedPrice === 'number' && !Number.isNaN(parsedPrice)) ? parsedPrice.toLocaleString() : String(parsedPrice)}</p>
                  {saleName && (
                    <Badge variant="destructive" className="text-sm px-3 py-1.5 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {saleName || 'セール'}
                    </Badge>
                  )}
                </div>
              ) : (
                saleName && (
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
                    <p className="text-sm leading-relaxed">{product?.body}</p>
                  </CardContent>
                </Card>
              )}

              {hasAffiliateLinks && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-center">購入リンク</h3>
                  <div className="space-y-2">
                    {product?.affiliateLinks?.map((link: any, index: number) => {
                      let label = link.label
                      if (!label) {
                        try { const u = new URL(link.url); label = u.hostname.replace('www.', '') } catch (e) { label = '購入リンク' }
                      }
                      const isTikTok = typeof link.url === 'string' && /(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|vm.tiktok.com|vt.tiktok.com)/i.test(link.url)
                      const commonClass = 'w-full flex items-center justify-center gap-2 rounded-md text-white py-3 text-sm font-medium'
                      if (isTikTok) {
                        const tLabel = link.label || 'TikTokで見る'
                        return (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`block ${commonClass} bg-[#153b8a] hover:bg-[#0f2f6f]`}>
                            <span className="truncate ">{tLabel}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )
                      }
                      return (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`block ${commonClass} bg-[#153b8a] hover:bg-[#0f2f6f]`}>
                          <span className="truncate">{label}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {hasAttachments && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-center">添付画像</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {attachmentImages.map((img: any, idx: number) => (
                        <div key={`${product?.id ?? 'p'}-att-${idx}`} className="relative aspect-square rounded-md overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                              <img src={img?.src || "/placeholder.svg"} srcSet={img?.srcSet || undefined} alt={`添付画像 ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                </div>
              )}

              {hasRelatedLinks && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-center">関連リンク</h3>
                  <div className="space-y-2">
                    {(product?.relatedLinks || []).map((link: string, index: number) => (
                      <div key={index}>
                        <EmbeddedLink
                          url={link}
                          // ensure related link buttons are full-width pills
                          buttonClassName={`w-full rounded-full py-5 bg-sky-400 text-white hover:bg-sky-500 focus-visible:ring-sky-200`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
