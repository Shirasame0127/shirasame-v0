"use client"

import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from "@/lib/utils"
import { Home, Package, Camera, Layout, Settings, Palette, Tag, Calendar, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

const navItems = [
  { href: "/admin", icon: Home, label: "ダッシュボード" },
  { href: "/admin/products", icon: Package, label: "商品管理" },
  { href: "/admin/recipes", icon: Camera, label: "レシピ管理" },
  { href: "/admin/collections", icon: Layout, label: "コレクション" },
  { href: "/admin/tags", icon: Tag, label: "タグ管理" },
  { href: "/admin/amazon-sales", icon: Calendar, label: "セールスケジュール" },
  { href: "/admin/theme", icon: Palette, label: "テーマ" },
  { href: "/admin/settings", icon: Settings, label: "設定" },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState(false)
  
  const handleLogout = () => {
    auth.logout()
    router.push('/admin/login')
    router.refresh()
  }

  const currentUser = auth.getCurrentUser()

  return (
    <nav className="border-b bg-card relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="font-bold text-xl">
            管理画面
          </Link>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {currentUser.username}
              </span>
            )}
            <Link href="/" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              公開ページを見る →
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline gap-2"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>

            {/* モバイル: ダッシュボードアイコン（ハンバーガーの左） */}
            <Link
              href="/admin"
              onClick={() => setOpenMenu(false)}
              className="inline-flex items-center justify-center p-2 rounded-md sm:hidden text-muted-foreground hover:text-foreground"
              aria-label="Dashboard"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* ハンバーガー: スマホ時は右端に配置 */}
            <button
              onClick={() => setOpenMenu(s => !s)}
              className="inline-flex items-center justify-center p-2 rounded-md sm:hidden"
              aria-label="Open menu"
            >
              {openMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* デスクトップ: 横並びメニュー */}
        <div className="hidden sm:flex gap-1 overflow-x-auto pb-px -mb-px">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* モバイルメニューのドロップダウン */}
        {openMenu && (
          <div className="sm:hidden absolute right-4 top-16 z-50 w-56 bg-card border rounded-md shadow-lg">
            <div className="flex flex-col">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMenu(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b transition-colors",
                      isActive ? "bg-zinc-100 text-foreground" : "text-muted-foreground hover:bg-zinc-50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              <button onClick={handleLogout} className="text-left px-4 py-3 text-sm text-muted-foreground hover:bg-zinc-50">ログアウト</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
