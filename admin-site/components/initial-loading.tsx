"use client"

import React, { useEffect, useState } from 'react'
import apiFetch from '@/lib/api-client'
import { getPublicImageUrl } from '@/lib/image-url'
import { db } from '@/lib/db/storage'

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
        // Avoid calling /api/site-settings from the public login page when
        // the local token mirror is not present — this prevents unauthenticated
        // fetches and potential logout/redirect churn while the client is
        // still synchronizing the HttpOnly session cookie.
        let pathname = ''
        try { pathname = typeof window !== 'undefined' ? window.location.pathname : '' } catch (e) { pathname = '' }
        const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/reset')
        let hasLocalToken = false
        try { hasLocalToken = !!(localStorage.getItem('sb-access-token') || localStorage.getItem('auth_user')) } catch (e) { hasLocalToken = false }
        if (isLoginPage && !hasLocalToken) {
          // Skip non-auth site-settings fetch on the public login page.
          throw new Error('skip-site-settings-on-login')
        }

        // Try to read loading animation from the user's row when available.
        try {
          let raw: any = null
          // If running on admin pages, prefer cached user -> remote users API
          try {
            const cached = db.user.get()
            const uid = cached?.id || null
            if (cached && (cached.loadingAnimation || cached.loading_animation)) raw = cached.loadingAnimation || cached.loading_animation
            else if (uid) {
              const r = await apiFetch(`/api/admin/users/${encodeURIComponent(String(uid))}`)
              if (r.ok) {
                const j = await r.json().catch(() => null)
                const u = j?.data || (Array.isArray(j) ? j[0] : j)
                raw = u?.loadingAnimation || u?.loading_animation || null
              }
            }
          } catch (e) {}

          let url: string | null = null
          if (!raw) url = null
          else if (typeof raw === 'string') url = raw
          else if (typeof raw === 'object') url = raw?.url || raw?.key || null

          // Normalize to public URL when possible
          try {
            let normalized = getPublicImageUrl(url) || url
            const looksAbsolute = typeof normalized === 'string' && /^(https?:)?\//.test(normalized)
            if (!looksAbsolute) {
              const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
              if (envUrl) normalized = envUrl
            }
            if (mounted) setGifUrl(normalized || null)
          } catch (e) {
            const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
            if (mounted) setGifUrl(envUrl || url)
          }
        } catch (e) {
          // ignore — will fallback to env var below
          try {
            const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
            if (envUrl && mounted) setGifUrl(envUrl)
          } catch {}
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
