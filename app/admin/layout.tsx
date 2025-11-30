"use client"

import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { usePathname } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import AdminLoading from '@/components/admin-loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isRecipeEditPage = pathname?.includes('/admin/recipes/') && pathname?.includes('/edit')
  const isLoginPage = pathname === '/admin/login'

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
      } else {
        const user = auth.getCurrentUser()
        if (!user) {
          // Do not force client-side navigation to /admin/login here because
          // middleware already redirects unauthenticated requests server-side.
          // Forcing a push from the client can create redirect loops.
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      }
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [pathname, isLoginPage])

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

  const useStandardShell = !isRecipeEditPage && !isLoginPage

  return (
    <div className={`min-h-screen bg-muted/30 ${isRecipeEditPage ? 'overflow-hidden' : ''}`}>
      {useStandardShell ? (
        <div className="flex min-h-screen flex-col md:flex-row md:items-stretch">
          <AdminNav />
          <main className="flex-1 min-h-screen px-4 py-6 md:px-10 md:py-10 lg:px-12">
            {children}
          </main>
        </div>
      ) : (
        <main className={isRecipeEditPage ? 'h-screen' : 'min-h-screen'}>{children}</main>
      )}
      <Toaster />
    </div>
  )
}
