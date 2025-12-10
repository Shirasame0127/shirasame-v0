"use client"

import { useEffect } from "react"
import apiFetch from '@/lib/api-client'
import supabaseClient from '@/lib/supabase/client'

export function AppInitializer() {
  useEffect(() => {
    console.log("[v0] AppInitializer: Starting initialization (cloud-first)")

    // Run a minimal, authoritative initialization: ask the server whoami.
    // AppInitializer intentionally avoids performing an additional whoami
    // network call because the authoritative check is already performed
    // in `app/admin/layout.tsx` before rendering. Keep this component
    // lightweight and avoid duplicate network requests.
    ;(async () => {
      try {
        // Ensure local mirror exists for UI without performing network calls here.
        // Do not call network-side whoami from this component to prevent
        // duplicate requests on page load.
        const local = (typeof window !== 'undefined') ? localStorage.getItem('auth_user') : null
        if (local) {
          console.log('[v0] AppInitializer: local auth mirror present')
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  return null
}
