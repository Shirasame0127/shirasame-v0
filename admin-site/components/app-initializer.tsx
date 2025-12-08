"use client"

import { useEffect } from "react"
import apiFetch from '@/lib/api-client'
import supabaseClient from '@/lib/supabase/client'

export function AppInitializer() {
  useEffect(() => {
    console.log("[v0] AppInitializer: Starting initialization (cloud-first)")

    // Run a minimal, authoritative initialization: ask the server whoami.
    ;(async () => {
      try {
        const res = await fetch('/api/auth/whoami', { credentials: 'include', cache: 'no-store' })
        if (res.ok) {
          console.log('[v0] AppInitializer: whoami ok')
        } else {
          console.warn('[v0] AppInitializer: whoami not ok')
        }
      } catch (e) {
        console.warn('[v0] AppInitializer: whoami error', e)
      }
    })()
  }, [])

  return null
}
