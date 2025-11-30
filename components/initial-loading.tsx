"use client"

import React, { useEffect, useState } from 'react'
import { getPublicImageUrl } from '@/lib/image-url'

export default function InitialLoading() {
  const [mountedVisible, setMountedVisible] = useState(true) // DOM present
  const [fadeOut, setFadeOut] = useState(false) // controls opacity transition
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
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
          const normalized = getPublicImageUrl(url) || url
          if (mounted) setGifUrl(normalized)
        } catch (e) {
          if (mounted) setGifUrl(url)
        }
      } catch (e) {
        // ignore — no gif available
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
