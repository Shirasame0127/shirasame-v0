"use client"

import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'

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
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // ログインページ以外でログイン状態をチェック
    if (!isLoginPage) {
      const user = auth.getCurrentUser()
      if (!user) {
        // Do not force client-side navigation to /admin/login here because
        // middleware already redirects unauthenticated requests server-side.
        // Forcing a push from the client can create redirect loops.
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [pathname, isLoginPage, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`min-h-screen bg-muted/30 ${isRecipeEditPage ? 'overflow-hidden' : ''}`}>
      {!isRecipeEditPage && !isLoginPage && <AdminNav />}
      <main className={isRecipeEditPage ? 'h-screen' : ''}>{children}</main>
      <Toaster />
    </div>
  )
}
