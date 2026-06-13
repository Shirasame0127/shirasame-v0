"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { NAV_SECTIONS, isNavItemActive } from "@/lib/nav"
import { PanelLeftClose, PanelLeftOpen, LogOut, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { StarMark, Wordmark } from "@/components/brand"

const STORAGE_KEY = "v0-admin-sidebar"

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <nav aria-label="管理メニュー" className="space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p className="label-mono px-3 pb-2">{section.title}</p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isNavItemActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex h-10 items-center rounded-md text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-0" : "gap-3 px-3",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function AdminNav() {
  const router = useRouter()
  const { toast } = useToast()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setHydrated(true)
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "collapsed") setCollapsed(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded")
    } catch {}
  }, [collapsed, hydrated])

  // Allow the mobile drawer to be opened/closed by header/edge-swipe events.
  useEffect(() => {
    const open = () => setMobileOpen(true)
    const close = () => setMobileOpen(false)
    const toggle = () => setMobileOpen((v) => !v)
    window.addEventListener("admin:open-mobile-sidebar", open)
    window.addEventListener("admin:close-mobile-sidebar", close)
    window.addEventListener("admin:toggle-mobile-sidebar", toggle)
    return () => {
      window.removeEventListener("admin:open-mobile-sidebar", open)
      window.removeEventListener("admin:close-mobile-sidebar", close)
      window.removeEventListener("admin:toggle-mobile-sidebar", toggle)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const ok = await auth.logout()
      if (!ok) toast({ title: "ログアウトに失敗しました", description: "時間をおいて再度お試しください。", variant: "destructive" })
    } catch {
      toast({ title: "ログアウトに失敗しました", variant: "destructive" })
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out md:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          {collapsed ? (
            <StarMark size={22} className="mx-auto text-primary" />
          ) : (
            <Wordmark subtitle="Console" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavList collapsed={collapsed} />
        </div>

        <div className="border-t p-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-2 text-muted-foreground", collapsed ? "justify-center px-0" : "justify-start")}
            onClick={() => window.open("/", "_blank")}
            title="公開ページを見る"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>公開ページを見る</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-2 text-muted-foreground hover:text-destructive", collapsed ? "justify-center px-0" : "justify-start")}
            onClick={handleLogout}
            title="ログアウト"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>ログアウト</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-2 text-muted-foreground", collapsed ? "justify-center px-0" : "justify-start")}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
            title={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>折りたたむ</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-label="管理メニュー"
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Wordmark subtitle="Console" />
          <Button variant="ghost" size="icon" aria-label="メニューを閉じる" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </div>
        <div className="border-t p-3 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => { setMobileOpen(false); router.push("/") }}>
            <ExternalLink className="h-4 w-4" /> 公開ページを見る
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={() => { setMobileOpen(false); handleLogout() }}>
            <LogOut className="h-4 w-4" /> ログアウト
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
