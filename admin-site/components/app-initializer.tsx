"use client"

import { useEffect } from "react"
import apiFetch from '@/lib/api-client'

export function AppInitializer() {
  useEffect(() => {
    console.log("[v0] AppInitializer: Starting initialization (cloud-first)")

    // Trigger profile endpoint to warm any server-side session checks.
    ;(async () => {
      try {
        await apiFetch('/api/profile')
      } catch (e) {
        // ignore — server may return null when unauthenticated
      }
    })()
  }, [])

  return null
}
