"use client"

import React, { useEffect, useState } from 'react'
import { getPublicImageUrl } from '@/lib/image-url'
import apiFetch from '@/lib/api-client'

export default function AdminLoading() {
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiFetch('/api/site-settings')
        if (!res.ok) return
        const json = await res.json()
        const raw = json?.data?.loading_animation
        let url: string | null = null
        if (!raw) url = null
        else if (typeof raw === 'string') url = raw
        else if (typeof raw === 'object') url = raw?.url || null

        try {
          const normalized = getPublicImageUrl(url) || url
          if (mounted) setGifUrl(normalized)
        } catch (e) {
          if (mounted) setGifUrl(url)
        }
      } catch (e) {
        // ignore
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-40 h-40 flex items-center justify-center rounded-md bg-white/90 overflow-hidden">
        {gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gifUrl} alt="loading" className="w-full h-full object-cover" />
        ) : (
          // Fallback to static placeholder image when GIF not configured
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/placeholder.svg" alt="loading" className="w-12 h-12 object-contain" />
        )}
      </div>
    </div>
  )
}
