"use client"

import React from 'react'
import HeaderProfile from '@/components/header-profile'
import { usePathname } from 'next/navigation'

export default function HeaderVisibility() {
  const pathname = usePathname() || ''
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/reset')
  if (isLoginPage) return null

  return (
    <header className="sticky top-0 z-20 bg-card text-card-foreground border-b p-4 h-16 flex items-center">
      <div className="flex w-full items-center justify-between">
        <div className="font-semibold">Dealer</div>
        <div>
          <HeaderProfile />
        </div>
      </div>
    </header>
  )
}
