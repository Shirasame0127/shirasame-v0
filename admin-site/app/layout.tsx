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
        {/* Inject runtime override for API base. Build-time env used as default. */}
        <script dangerouslySetInnerHTML={{ __html: `window.__env__ = window.__env__ || {}; window.__env__.API_BASE = ${JSON.stringify(process.env.PUBLIC_WORKER_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || '')}; window.__env__.FORCE_API_BASE = ${JSON.stringify(String(process.env.NEXT_PUBLIC_FORCE_API_BASE || 'false'))};` }} />
        <main className="min-h-screen">
          <header className="bg-card text-card-foreground border-b p-4">
            <div className="max-w-6xl mx-auto font-semibold">しらさめ - 管理画面</div>
          </header>
          <div className="max-w-6xl mx-auto p-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
// (Duplicate metadata and RootLayout removed.)
