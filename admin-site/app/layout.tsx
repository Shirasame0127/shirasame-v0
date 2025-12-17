import React from 'react'
import HeaderProfile from '@/components/header-profile'
import './globals.css'

export const metadata = {
  title: '管理 - しらさめ',
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
          <header className="sticky top-0 z-20 bg-card text-card-foreground border-b p-4 h-16 flex items-center">
            <div className="flex w-full items-center justify-between">
              <div className="font-semibold">しらさめ - 管理画面</div>
              {/* HeaderProfile is a client component that shows avatar and handles mobile swipe */}
              <div>
                <HeaderProfile />
              </div>
            </div>
          </header>
          <div className="w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
// (Duplicate metadata and RootLayout removed.)
