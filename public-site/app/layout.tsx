import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AppInitializer } from "@/components/app-initializer"
import InitialLoading from "@/components/initial-loading"
import "./globals.css"

export const metadata: Metadata = {
  title: "しらさめ - ガジェット＆デスク紹介",
  description: "ガジェットとデスク周りが好きなクリエイター、しらさめの商品紹介サイト。おすすめのデスク環境とガジェットをシェアします。",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <InitialLoading />
        <AppInitializer />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
