import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { AppInitializer } from "@/components/app-initializer"
import { AbProvider, AB_BOOTSTRAP_SCRIPT } from "@/lib/ab"
import { AbAnalytics } from "@/components/ab-analytics"
import InitialLoading from "@/components/initial-loading-client"
import NoSelectClient from "@/components/no-select-client"
import "./globals.css"

export const metadata: Metadata = {
  title: "しらさめ - ガジェット＆デスク紹介",
  description: "ガジェットとデスク周りが好きなクリエイター、しらさめの商品紹介サイト。おすすめのデスク環境とガジェットをシェアします。",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* Paints `data-ab` before first paint so variant CSS applies without a
            flash. React resolves the same bucket again in AbProvider. */}
        <script dangerouslySetInnerHTML={{ __html: AB_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        {(() => {
          const enableGa = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_FORCE_GA === "true"
          if (!enableGa) return null
          return (
            <>
              {/* Client-side optimized loader for runtime */}
              <Script src="https://www.googletagmanager.com/gtag/js?id=G-SWEFCBS39M" strategy="afterInteractive" />
              <Script id="ga-init" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-SWEFCBS39M');`}
              </Script>
              {/* Static script tags so scanners that don't execute JS can detect GA */}
              <script async src="https://www.googletagmanager.com/gtag/js?id=G-SWEFCBS39M"></script>
              <script dangerouslySetInnerHTML={{ __html: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-SWEFCBS39M');" }} />
            </>
          )
        })()}
        <AbProvider>
          <InitialLoading />
          <AppInitializer />
          <AbAnalytics />
          <NoSelectClient />
          {children}
        </AbProvider>
        {/* Vercel Analytics removed for Cloudflare Pages deployment. */}
      </body>
    </html>
  )
}
