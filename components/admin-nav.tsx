"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Package, Camera, Layout, Settings, Palette, Tag } from "lucide-react"

const navItems = [
  { href: "/admin", icon: Home, label: "ダッシュボード" },
  { href: "/admin/products", icon: Package, label: "商品管理" },
  { href: "/admin/recipes", icon: Camera, label: "レシピ管理" },
  { href: "/admin/collections", icon: Layout, label: "コレクション" },
  { href: "/admin/tags", icon: Tag, label: "タグ管理" },
  { href: "/admin/theme", icon: Palette, label: "テーマ" },
  { href: "/admin/settings", icon: Settings, label: "設定" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="font-bold text-xl">
            しらさめ管理画面
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            公開ページを見る →
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-px -mb-px">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
