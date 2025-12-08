"use client"

import { useEffect } from "react"
import apiFetch from '@/lib/api-client'
import supabaseClient from '@/lib/supabase/client'

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

      try {
        // Ensure Supabase session (if present) is synced to server-side cookies
        const s = await (supabaseClient as any).auth.getSession()
        const session = s?.data?.session
        console.log('[v0] AppInitializer: supabase session', session)
        if (session && session.access_token) {
          try {
            await apiFetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token })
            })
            console.log('[v0] AppInitializer: posted session to /api/auth/session')
          } catch (err) {
            console.warn('[v0] AppInitializer: failed to post session', err)
          }
        }
      } catch (e) {
        console.warn('[v0] AppInitializer: session sync error', e)
      }
    })()
  }, [])

  return null
}
