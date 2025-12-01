"use client"

import React, { useEffect, useState } from 'react'
import { getPublicImageUrl } from '@/lib/image-url'

export default function InitialLoading() {
  const [mountedVisible, setMountedVisible] = useState(true) // DOM present
  const [fadeOut, setFadeOut] = useState(false) // controls opacity transition
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    // 通知: ローディング開始（PublicNav 等が参照）
    try {
      ;(window as any).__v0_initial_loading = true
      window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: true }))
    } catch (e) {}
    const start = Date.now()

    ;(async () => {
      try {
        const res = await fetch('/api/site-settings')
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const raw = json?.data?.loading_animation
        let url: string | null = null
        if (!raw) url = null
        else if (typeof raw === 'string') url = raw
        else if (typeof raw === 'object') url = raw?.url || null

        // Normalize to public URL when possible
        try {
          let normalized = getPublicImageUrl(url) || url
          // If we still don't have an absolute/usable URL, try env fallback
          const looksAbsolute = typeof normalized === 'string' && /^(https?:)?\//.test(normalized)
          if (!looksAbsolute) {
            const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
            if (envUrl) normalized = envUrl
          }
          if (mounted) setGifUrl(normalized || null)
        } catch (e) {
          // final fallback: env var or null
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (mounted) setGifUrl(envUrl || url)
        }
      } catch (e) {
        // ignore — no gif available
        // try env fallback when site-settings is unavailable
        try {
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (envUrl && mounted) setGifUrl(envUrl)
        } catch {}
      } finally {
        // ensure the loading screen is visible at least 1s for UX stability
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => {
          if (!mounted) return
          // start fade-out animation, then remove from DOM after transition
            setFadeOut(true)
            setTimeout(() => {
              if (!mounted) return
              setMountedVisible(false)
              // 通知: ローディング終了
              try {
                ;(window as any).__v0_initial_loading = false
                window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
              } catch (e) {}
            }, 500)
        }, remaining)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (!mountedVisible) return null

  // Determine whether this is a public page. For public pages we show the
  // full-screen pale-blue background with centered GIF that fades out.
  let isPublic = true
  try {
    const cookieHeader = typeof document !== 'undefined' ? document.cookie : ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const PUBLIC_HOST = process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
    const isHostPublic = PUBLIC_HOST ? (typeof window !== 'undefined' && window.location.hostname === PUBLIC_HOST) : false
    isPublic = (PUBLIC_HOST ? isHostPublic : !hasAccessCookie) || !hasAccessCookie
  } catch (e) {
    isPublic = true
  }

  // Use solid pale-blue while visible; fade-out will animate opacity to transparent.
  const bgStyle = isPublic ? { backgroundColor: '#add8e6' } : undefined
  const transitionStyle = { transition: 'opacity 500ms ease' }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ zIndex: 99999, ...(bgStyle || { backgroundColor: 'rgba(0,0,0,0.4)' }), ...transitionStyle }}
    >
      {isPublic ? (
        // Public pages: show GIF centered on pale-blue full-screen background
        // If gifUrl is not yet available, do not render a boxed placeholder
        // (avoids showing a white square). The background remains visible.
        gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gifUrl} alt="loading" className="w-40 h-40 object-contain" />
        ) : null
      ) : (
        // Non-public (admin) pages: preserve previous boxed look
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
