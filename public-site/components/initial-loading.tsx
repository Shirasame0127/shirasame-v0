"use client"

import React, { useEffect, useState } from 'react'
import { getPublicImageUrl } from '@/lib/image-url'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const api = (p: string) => `${API_BASE}${p}`

export default function InitialLoading() {
  const [mountedVisible, setMountedVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    try {
      ;(window as any).__v0_initial_loading = true
      window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: true }))
    } catch {}
    const start = Date.now()

    ;(async () => {
      try {
        const res = await fetch(api('/site-settings'))
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const raw = json?.data?.loading_animation
        let url: string | null = null
        if (!raw) url = null
        else if (typeof raw === 'string') url = raw
        else if (typeof raw === 'object') url = raw?.url || null

        try {
          let normalized = getPublicImageUrl(url) || url
          const looksAbsolute = typeof normalized === 'string' && /^(https?:)?\//.test(normalized)
          if (!looksAbsolute) {
            const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
            if (envUrl) normalized = envUrl
          }
          if (mounted) setGifUrl(normalized || null)
        } catch {
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (mounted) setGifUrl(envUrl || url)
        }
      } catch {
        try {
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (envUrl && mounted) setGifUrl(envUrl)
        } catch {}
      } finally {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => {
          if (!mounted) return
          setFadeOut(true)
          setTimeout(() => {
            if (!mounted) return
            setMountedVisible(false)
            try {
              ;(window as any).__v0_initial_loading = false
              window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
            } catch {}
          }, 500)
        }, remaining)
      }
    })()

    return () => { mounted = false }
  }, [])

  if (!mountedVisible) return null

  let isPublic = true
  try {
    const cookieHeader = typeof document !== 'undefined' ? document.cookie : ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const PUBLIC_HOST = process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
    const isHostPublic = PUBLIC_HOST ? (typeof window !== 'undefined' && window.location.hostname === PUBLIC_HOST) : false
    isPublic = (PUBLIC_HOST ? isHostPublic : !hasAccessCookie) || !hasAccessCookie
  } catch {
    isPublic = true
  }

  const bgStyle = isPublic ? { backgroundColor: '#add8e6' } : undefined
  const transitionStyle = { transition: 'opacity 500ms ease' }

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ zIndex: 99999, ...(bgStyle || { backgroundColor: 'rgba(0,0,0,0.4)' }), ...transitionStyle }}>
      {isPublic ? (
        gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gifUrl} alt="loading" className="w-40 h-40 object-contain" />
        ) : (
          // public fallback: show a simple CSS spinner and small logo
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
            <div className="w-32 h-8">
              {/* prefer PNG logo if available (attached); fallback to svg */}
              <img
                src="/images/shirasame-logo.png"
                alt="logo"
                className="w-full h-full object-contain"
                onError={(e) => { try { (e.target as HTMLImageElement).src = '/images/shirasame-logo.svg' } catch {} }}
              />
            </div>
          </div>
        )
      ) : (
        <div className="w-36 h-36 flex items-center justify-center rounded-md bg-white/90 overflow-hidden">
          {gifUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gifUrl} alt="loading" className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/placeholder.svg" alt="loading" className="w-12 h-12 object-contain" />
          )}
        </div>
      )}
    </div>
  )
}
