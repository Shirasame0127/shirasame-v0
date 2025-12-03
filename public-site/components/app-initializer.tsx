"use client"

import { useEffect } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const api = (p: string) => `${API_BASE}${p}`

export function AppInitializer() {
  useEffect(() => {
    ;(async () => {
      try { await fetch(api('/profile')) } catch {}
    })()
  }, [])
  return null
}
