"use client"

import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
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
  const isRecipeEditPage = pathname?.includes('/admin/recipes/') && pathname?.includes('/edit')
  const isLoginPage = pathname === '/admin/login' || (pathname && pathname.startsWith('/admin/reset'))

  useEffect(() => {
    // ログインページ以外でログイン状態をチェック
    if (!isLoginPage) {
      // Allow disabling auth for local development via env flag. The middleware
      // supports `DISABLE_AUTH=true` (server-side). Respect the client-visible
      // equivalent `NEXT_PUBLIC_DISABLE_AUTH` or runtime `window.__env__?.DISABLE_AUTH`.
      const clientDisableAuth =
        (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_DISABLE_AUTH || '').toLowerCase() === 'true') ||
        (typeof window !== 'undefined' && (window as any).__env__?.DISABLE_AUTH === true) ||
        (typeof window !== 'undefined' && String((window as any).__env__?.DISABLE_AUTH || '').toLowerCase() === 'true')

      if (clientDisableAuth) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else {
        // Authoritative server-side check. Do NOT accept localStorage mirror as
        // sufficient for admin UI. Attempt whoami and retry briefly if it
        // initially fails to allow short cookie propagation delays after login.
        (async () => {
          try {
            let res = null
            const maxAttempts = 3
            const delayMs = 250
            for (let i = 0; i < maxAttempts; i++) {
              try {
                // apiFetch already includes credentials: 'include'
                res = await apiFetch('/api/auth/whoami', { cache: 'no-store' })
                if (res && res.ok) break
              } catch (e) {
                // swallow and retry
              }
              // Small delay before retrying
              await new Promise((r) => setTimeout(r, delayMs))
            }

            if (res && res.ok) {
              const json = await res.json().catch(() => null)
              try {
                if (typeof window !== 'undefined') {
                  const u = json?.user || json || null
                  if (u && u.id) {
                    localStorage.setItem('auth_user', JSON.stringify({ id: u.id, email: u.email || null, username: u.username || null }))
                  }
                }
              } catch (e) {}
              setIsAuthenticated(true)
            } else {
              // Not authenticated server-side: clear local mirror and mark unauthenticated
              try {
                if (typeof window !== 'undefined') localStorage.removeItem('auth_user')
              } catch (e) {}
              setIsAuthenticated(false)
            }
          } catch (e) {
            // On network error: treat as unauthenticated for admin UI to be safe.
            try {
              if (typeof window !== 'undefined') localStorage.removeItem('auth_user')
            } catch (e) {}
            setIsAuthenticated(false)
          } finally {
            setIsLoading(false)
          }
        })()
      }
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [])

  // Redirect to login when unauthenticated to prevent viewing admin UI
  useEffect(() => {
    try {
      if (!isLoading && !isAuthenticated && !isLoginPage) {
        router.replace('/admin/login')
      }
    } catch (e) {
      // ignore
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  if (isLoading) {
    // 管理画面読み込み中は固定で現在のローディングアニメーションを表示する
    return <AdminLoading />
  }

  if (!isAuthenticated) {
    // サーバー側のミドルウェアが未認証時に /admin/login へリダイレクトしますが、
    // クライアント側で何らかの理由でそのリダイレクトが発生しない場合に備え
    // 空返し(null)するのではなくユーザーにログインへの案内を表示します。
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <h2 className="text-xl font-semibold mb-2">管理画面にアクセスするにはログインが必要です</h2>
          <p className="text-sm text-muted-foreground mb-4">ログインしていないか、セッションの設定に問題があります。</p>
          <a href="/admin/login" className="inline-block px-4 py-2 rounded-md bg-primary text-white">ログインへ</a>
        </div>
      </div>
    )
  }

  // Show the standard admin shell (side nav + header) even on the recipe edit page
  // to keep UI consistent. Reduce outer padding for the edit page below.
  const useStandardShell = !isLoginPage

  return (
    <div className={`h-[calc(100vh-4rem)] bg-muted/30 ${isRecipeEditPage ? 'overflow-hidden' : ''}`}>
      {useStandardShell ? (
          <div className="flex h-full flex-col md:flex-row md:items-stretch">
          <AdminNav />
          {/* Sidebar is a left flex column; main becomes the only scrollable area */}
          <main
            className={
              pathname?.includes('/admin/recipes/edit')
                ? 'flex-1 overflow-y-auto px-4 md:px-6 lg:px-8'
                : 'flex-1 overflow-y-auto px-4 md:px-10 lg:px-12'
            }
          >
            {children}
          </main>
        </div>
      ) : (
        <main className={isRecipeEditPage ? 'h-screen overflow-y-auto' : 'min-h-screen'}>{children}</main>
      )}
      <Toaster />
    </div>
  )
}
