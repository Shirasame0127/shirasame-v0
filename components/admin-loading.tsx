"use client"

import React, { useEffect, useState } from 'react'

export default function AdminLoading() {
  const [gifUrl, setGifUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/site-settings')
        if (!res.ok) return
        const json = await res.json()
        const url = json?.data?.loading_animation?.url || null
        if (mounted) setGifUrl(url)
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
