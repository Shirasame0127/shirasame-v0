"use client"

import { Menu, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeaderProfile from "@/components/header-profile"
import { Wordmark } from "@/components/brand"

export function AdminTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card/80 px-3 backdrop-blur-sm md:px-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="メニューを開く"
          onClick={() => window.dispatchEvent(new CustomEvent("admin:open-mobile-sidebar"))}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="md:hidden">
          <Wordmark compact />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button asChild variant="ghost" size="sm" className="hidden gap-2 text-muted-foreground sm:inline-flex">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            公開ページ
          </a>
        </Button>
        <HeaderProfile />
      </div>
    </header>
  )
}
