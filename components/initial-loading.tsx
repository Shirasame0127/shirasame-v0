"use client"

import React, { useEffect, useState } from 'react'

export default function InitialLoading() {
  const [show, setShow] = useState(true)
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const start = Date.now()
    // mark global flag so other components can hide their textual placeholders
    try {
      ;(window as any).__v0_initial_loading = true
      try {
        window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: true }))
      } catch (e) {}
    } catch (e) {}

    ;(async () => {
      try {
        const res = await fetch('/api/site-settings')
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const url = json?.data?.loading_animation?.url || null
        if (mounted) setGifUrl(url)
      } catch (e) {
        // ignore — no gif available
      } finally {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => {
          if (mounted) setShow(false)
        }, remaining)
      }
    })()

    return () => {
      mounted = false
      try {
        ;(window as any).__v0_initial_loading = false
        try {
          window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
        } catch (e) {}
      } catch (e) {}
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-36 h-36 flex items-center justify-center rounded-md bg-white/90 overflow-hidden">
        {gifUrl ? (
          // show uploaded GIF (fit 1:1)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gifUrl} alt="loading" className="w-full h-full object-cover" />
        ) : (
          // built-in fallback spinner
          <svg className="w-12 h-12 text-primary" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="31.415, 31.415">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
      </div>
    </div>
  )
}

// Ensure global flag cleared on module load (safety)
try {
  if (typeof window !== 'undefined') (window as any).__v0_initial_loading = true
} catch (e) {}
