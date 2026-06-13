"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY_NAV, isNavItemActive } from "@/lib/nav"

export function AdminMobileNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="主要メニュー"
      className="flex h-[3.25rem] shrink-0 items-stretch border-t bg-card md:hidden"
    >
      {PRIMARY_NAV.map((item) => {
        const Icon = item.icon
        const active = isNavItemActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.short ?? item.label}</span>
          </Link>
        )
      })}
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => window.dispatchEvent(new CustomEvent("admin:open-mobile-sidebar"))}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
        <span>メニュー</span>
      </button>
    </nav>
  )
}
