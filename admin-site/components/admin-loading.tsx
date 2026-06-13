"use client"

import React, { useEffect, useState } from 'react'
import { getPublicImageUrl } from '@/lib/image-url'
import { db } from '@/lib/db/storage'
import LoadingAnimation from '@/components/loading-animation'

/**
 * Full-area loading state for the admin console. Prefers a custom loading
 * animation already cached on the user's row (no network fetch on every
 * mount — that caused redundant requests and auth races); otherwise shows the
 * on-brand Shirasame sparkle loader.
 */
export default function AdminLoading() {
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    try {
      const cached = db.user.get() as any
      const raw = cached?.loadingAnimation || cached?.loading_animation || null
      let url: string | null = null
      if (typeof raw === 'string') url = raw
      else if (raw && typeof raw === 'object') url = raw?.url || raw?.key || null
      if (url) setGifUrl(getPublicImageUrl(url) || url)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-6">
      {gifUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={gifUrl} alt="" className="h-32 w-32 rounded-lg object-cover" />
      ) : (
        <LoadingAnimation size={96} />
      )}
      <span className="label-mono">Loading</span>
    </div>
  )
}
