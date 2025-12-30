import React from 'react'
import HeaderVisibility from '@/components/header-visibility'
import './globals.css'

export const metadata = {
  title: 'Dealer-管理画面',
  description: '管理画面 - しらさめサイト管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-background text-foreground">
        {/*
          NOTE: Do NOT inject runtime `API_BASE` / `FORCE_API_BASE` into
          admin-site HTML. Client must never call external public-worker
          directly from the admin domain — browser-origin requests must
          use the same-origin `/api` proxy so HttpOnly domain cookies are
          sent. This script was removed intentionally to prevent the
          client from being forced to an external API base.
        */}
        <main className="min-h-screen">
          <HeaderVisibility />
          <div className="w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
// (Duplicate metadata and RootLayout removed.)
