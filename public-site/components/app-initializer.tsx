"use client"

import { useEffect } from "react"
import apiFetch from "@/lib/api-client"

export function AppInitializer() {
  useEffect(() => {
    ;(async () => {
      try { await apiFetch('/profile') } catch {}
    })()
  }, [])
  return null
}
