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

function extractTwitchInfo(url: string) {
  let m = url.match(/clips\.twitch\.tv\/([^\/\?#]+)/)
  if (m) return { kind: 'clip', id: m[1] }
  m = url.match(/twitch\.tv\/videos\/(\d+)/)
  if (m) return { kind: 'video', id: m[1] }
  m = url.match(/twitch\.tv\/([^\/\?#]+)/)
  if (m) return { kind: 'channel', id: m[1] }
  return null
}

export function EmbeddedLink({ url }: { url: string }) {
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
      const s = loadScript('https://platform.twitter.com/widgets.js')
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
        try { (window as any).twttr && (window as any).twttr.widgets && (window as any).twttr.widgets.load(containerRef.current) } catch {}
      }
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

    return () => { mounted = false; obs?.disconnect() }
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
    return (
      <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <span className="truncate">TikTokで見る</span>
          <ExternalLink className="w-3 h-3" />
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
    const tweetIdMatch = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/)
    if (tweetIdMatch) {
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
    <Button asChild variant="outline" size="sm" className="w-full justify-start text-xs">
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <ExternalLink className="w-3 h-3" />
        <span className="truncate">{url}</span>
      </a>
    </Button>
  )
}

export default EmbeddedLink
