"use client"

import React from 'react'
import HeaderProfile from '@/components/header-profile'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Box, Layers, BookOpen, Settings } from 'lucide-react'

export default function HeaderVisibility() {
  const pathname = usePathname() || ''
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/reset')
  if (isLoginPage) return null

  const navItems = [
    { key: 'dashboard', href: '/admin', Icon: Home, label: 'ダッシュボード' },
    { key: 'products', href: '/admin/products', Icon: Box, label: '商品一覧' },
    { key: 'collections', href: '/admin/collections', Icon: Layers, label: 'コレクション' },
    { key: 'recipes', href: '/admin/recipes', Icon: BookOpen, label: 'レシピ' },
    { key: 'settings', href: '/admin/settings', Icon: Settings, label: '設定' },
  ]

  const isActive = (href: string) => {
    if (!href) return false
    if (href === '/admin') return pathname === '/admin' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed bottom-0 left-0 right-0 z-20 bg-card text-card-foreground border-t md:sticky md:top-0 md:border-b md:border-t-0">
      {/* Desktop / tablet header */}
      <div className="hidden md:flex w-full items-center justify-between p-4 h-16">
        <div className="font-semibold">Dealer</div>
        <div>
          <HeaderProfile />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="flex md:hidden w-full items-center justify-around h-16">
        {navItems.map((it) => {
          const active = isActive(it.href)
          return (
            <button
              key={it.key}
              aria-label={it.label}
              onClick={() => router.push(it.href)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 grow ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <it.Icon className="h-5 w-5" />
              <span className="text-[10px] leading-3">{it.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
