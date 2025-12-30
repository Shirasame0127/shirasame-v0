"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from "react"

function detectLinkType(url: string): 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'twitch' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('twitch.tv') || url.includes('clips.twitch.tv')) return 'twitch'
  return 'other'
}

function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractTikTokId(url: string): string | null {
  // matches: https://www.tiktok.com/@user/video/1234567890
  let m = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)
  if (m) return m[1]
  // matches some mobile URLs like /v/12345.html
  m = url.match(/\/v\/(\d+)\.html/)
  if (m) return m[1]
  return null
}

function extractTwitchInfo(url: string) {
  let m = url.match(/clips\.twitch\.tv\/([^\/\?#]+)/)
  if (m) return { kind: 'clip', id: m[1] }
  m = url.match(/twitch\.tv\/videos\/(\d+)/)
  if (m) return { kind: 'video', id: m[1] }
  m = url.match(/twitch\.tv\/([^\/\?#]+)/)
  if (m) return { kind: 'channel', id: m[1] }
  return null
}

export function EmbeddedLink({ url, buttonClassName }: { url: string; buttonClassName?: string }) {
  const type = detectLinkType(url)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [embedFailed, setEmbedFailed] = useState(false)
  const createdRef = useRef(false)
  const _tweetIdMatch = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/)
  const tweetId = _tweetIdMatch ? _tweetIdMatch[1] : null

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
      // avoid adding script multiple times
      let s: HTMLScriptElement | null = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]') as HTMLScriptElement | null
      if (!s) s = loadScript('https://platform.twitter.com/widgets.js')
      if (containerRef.current) {
        obs = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (!mounted) return
            const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
            if (iframe) {
              iframe.addEventListener('load', () => mounted && setLoading(false))
              obs?.disconnect()
            }
          }
        })
        obs.observe(containerRef.current, { childList: true, subtree: true })
      }
      const tryCreate = () => {
        try {
          const tw = (window as any).twttr
          if (tw && tw.widgets) {
            if (tweetId && containerRef.current && !createdRef.current) {
              // clear container to avoid duplicates
              try { containerRef.current.innerHTML = '' } catch {}
              createdRef.current = true
              try {
                tw.widgets.createTweet(tweetId, containerRef.current, { theme: 'light' })
                  .then(() => mounted && setLoading(false))
                  .catch(() => mounted && setLoading(false))
              } catch { createdRef.current = false }
            } else if (!tweetId && containerRef.current && !createdRef.current) {
              // no id: try processing any blockquotes
              try { tw.widgets.load(containerRef.current); createdRef.current = true } catch { createdRef.current = false }
            }
          }
        } catch {}
      }
      s.onload = tryCreate
      // in case script already present
      tryCreate()
      // fallback: if embed not injected within timeout, show fallback button
      const t = setTimeout(() => {
        if (!containerRef.current) return
        const hasChildren = containerRef.current.children.length > 0
        if (!hasChildren) {
          setEmbedFailed(true)
          setLoading(false)
        }
      }, 2000)
      ;(window as any).__embedded_link_cleanup = () => clearTimeout(t)
    }
    if (type === 'instagram') {
      const s = loadScript('https://www.instagram.com/embed.js')
      if (containerRef.current) {
        obs = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (!mounted) return
            const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
            if (iframe) {
              iframe.addEventListener('load', () => mounted && setLoading(false))
              obs?.disconnect()
            }
          }
        })
        obs.observe(containerRef.current, { childList: true, subtree: true })
      }
      s.onload = () => {
        try { (window as any).instgrm && (window as any).instgrm.Embeds && (window as any).instgrm.Embeds.process() } catch {}
      }
      // @ts-ignore
      if ((window as any).instgrm && (window as any).instgrm.Embeds) try { (window as any).instgrm.Embeds.process() } catch {}
    }

    if (type === 'tiktok') {
      // try to render tiktok embed by leaving a blockquote and loading the embed script
      let s: HTMLScriptElement | null = document.querySelector('script[src="https://www.tiktok.com/embed.js"]') as HTMLScriptElement | null
      if (!s) s = loadScript('https://www.tiktok.com/embed.js')
      if (containerRef.current) {
        obs = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (!mounted) return
            const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
            if (iframe) {
              iframe.addEventListener('load', () => mounted && setLoading(false))
              obs?.disconnect()
            }
          }
        })
        obs.observe(containerRef.current, { childList: true, subtree: true })
      }
      s.onload = () => {
        try { /* tiktok script auto-processes blockquotes */ } catch {}
      }
      // fallback timeout
      const tt = setTimeout(() => {
        if (!containerRef.current) return
        const hasChildren = containerRef.current.children.length > 0
        if (!hasChildren) {
          setEmbedFailed(true)
          setLoading(false)
        }
      }, 2000)
      ;(window as any).__embedded_link_tiktok_cleanup = () => clearTimeout(tt)
    }

    return () => { mounted = false; obs?.disconnect(); try { (window as any).__embedded_link_cleanup && (window as any).__embedded_link_cleanup(); (window as any).__embedded_link_tiktok_cleanup && (window as any).__embedded_link_tiktok_cleanup() } catch {} }
  }, [type, url])

  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
      <svg className="w-10 h-10 text-white" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" onLoad={() => setLoading(false)} />
        </div>
      )
    }
  }

  if (type === 'tiktok') {
    const tiktokId = extractTikTokId(url)
    if (tiktokId) {
      if (embedFailed) {
        return (
          <Button asChild variant="external" size="sm" className={`${buttonClassName || 'w-full justify-start text-xs'}`}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-between">
              <span className="truncate">TikTokで見る</span>
              <ExternalLink className="w-3 h-3 text-white" />
            </a>
          </Button>
        )
      }
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
          <blockquote className="tiktok-embed" cite={url} data-video-id={tiktokId}>
            <section className="text-left">
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full justify-between text-xs">
                <span className="truncate">TikTokで見る</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </section>
          </blockquote>
        </div>
      )
    }
    return (
      <Button asChild variant="external" size="sm" className={`${buttonClassName || 'w-full justify-start text-xs'}`}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-between">
          <span className="truncate text-left">TikTokで見る</span>
          <ExternalLink className="w-3 h-3 text-white" />
        </a>
      </Button>
    )
  }

  if (type === 'twitch') {
    const info = extractTwitchInfo(url)
    const parent = typeof window !== 'undefined' ? window.location.hostname : ''
    if (info) {
      if (info.kind === 'clip') {
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
            {loading && <Spinner />}
            <iframe src={`https://clips.twitch.tv/embed?clip=${encodeURIComponent(info.id)}&parent=${encodeURIComponent(parent)}`} title="Twitch clip" frameBorder="0" allowFullScreen className="absolute inset-0 w-full h-full" onLoad={() => setLoading(false)} />
          </div>
        )
      }
      if (info.kind === 'video' || info.kind === 'channel') {
        const src = info.kind === 'video' ? `https://player.twitch.tv/?video=${encodeURIComponent(info.id)}&parent=${encodeURIComponent(parent)}&autoplay=false` : `https://player.twitch.tv/?channel=${encodeURIComponent(info.id)}&parent=${encodeURIComponent(parent)}&autoplay=false`
        return (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" ref={containerRef}>
            {loading && <Spinner />}
            <iframe src={src} title="Twitch player" frameBorder="0" allowFullScreen className="absolute inset-0 w-full h-full" onLoad={() => setLoading(false)} />
          </div>
        )
      }
    }
  }

  if (type === 'twitter') {
    if (tweetId) {
      if (embedFailed) {
        return (
          <Button asChild variant="external" size="sm" className={`${buttonClassName || 'w-full text-sm rounded-full'}`}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-between w-full">
              <span className="truncate">ツイートを見る</span>
              <ExternalLink className="w-3 h-3 text-white" />
            </a>
          </Button>
        )
      }
      return (
        <div className="flex justify-center">
          <div ref={containerRef} className="w-full max-w-[540px]" />
        </div>
      )
    }
  }

  if (type === 'instagram') {
    const postIdMatch = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/)
    if (postIdMatch) {
      return (
        <div className="flex justify-center" ref={containerRef}>
          <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ background: '#FFF', border: 0, borderRadius: '3px', boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth: '540px', minWidth: '326px', padding: 0, width: '99.375%' }}>
            <a href={url} target="_blank" rel="noopener noreferrer">Instagramで見る</a>
          </blockquote>
        </div>
      )
    }
  }

    return (
      <Button asChild variant="external" size="sm" className={`${buttonClassName || 'w-full text-sm rounded-full'}`}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-between w-full">
          <span className="truncate text-left">{url}</span>
          <ExternalLink className="w-3 h-3 text-white" />
        </a>
      </Button>
    )
}

export default EmbeddedLink
