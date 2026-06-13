"use client"

import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { AdminTopBar } from "@/components/admin/top-bar"
import { AdminMobileNav } from "@/components/admin/mobile-nav"
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"
import { Confirmer } from "@/components/ui/confirm"
import { useEffect, useState } from 'react'
import apiFetch from '@/lib/api-client'
import AdminLoading from '@/components/admin-loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isLoginPage = pathname === '/admin/login' || (pathname != null && pathname.startsWith('/admin/reset'))

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // Local-dev escape hatch matching the server middleware's DISABLE_AUTH.
    const clientDisableAuth =
      (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_DISABLE_AUTH || '').toLowerCase() === 'true') ||
      (typeof window !== 'undefined' && String((window as any).__env__?.DISABLE_AUTH || '').toLowerCase() === 'true')
    if (clientDisableAuth) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      // Authoritative server-side check. Retry briefly to allow cookie
      // propagation right after login.
      for (let i = 0; i < 3; i++) {
        try {
          const res = await apiFetch('/api/auth/whoami', { cache: 'no-store' })
          if (res && res.ok) {
            const json = await res.json().catch(() => null)
            const u = json?.user || json || null
            try {
              if (u && u.id) {
                localStorage.setItem('auth_user', JSON.stringify({ id: u.id, email: u.email || null, username: u.username || null }))
              }
            } catch {}
            if (!cancelled) { setIsAuthenticated(true); setIsLoading(false) }
            return
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 250))
      }
      try { localStorage.removeItem('auth_user') } catch {}
      if (!cancelled) { setIsAuthenticated(false); setIsLoading(false) }
    })()

    return () => { cancelled = true }
  }, [isLoginPage])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login')
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  // Login / reset pages render full-bleed without the admin chrome.
  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <AdminLoading />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold">ログインが必要です</h2>
          <p className="mb-4 text-sm text-muted-foreground">セッションが切れているか、ログインしていません。</p>
          <a href="/admin/login" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground">
            ログインへ
          </a>
        </div>
        <Toaster />
      </div>
    )
  }

  // Standard admin shell: sidebar + (top bar / scrollable main / mobile bottom nav).
  // The single <main> is the only scroll owner.
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AdminNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
        <AdminMobileNav />
      </div>
      <Toaster />
      <Confirmer />
    </div>
  )
}
