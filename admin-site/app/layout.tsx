import React from 'react'
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
          <header className="fixed top-0 left-0 right-0 z-50 bg-card text-card-foreground border-b p-4">
            <div className="max-w-6xl mx-auto font-semibold">しらさめ - 管理画面</div>
          </header>
          <div className="max-w-6xl mx-auto p-4 pt-16">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
// (Duplicate metadata and RootLayout removed.)
