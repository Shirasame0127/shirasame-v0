"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { getPublicImageUrl, responsiveImageForUsage } from "@/lib/image-url"
import { db } from "@/lib/db/storage"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  Camera,
  Layout,
  Settings,
  Palette,
  Tag,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  type LucideIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import apiFetch from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ href: "/admin", icon: Home, label: "ダッシュボード" }]
  },
  {
    title: "コンテンツ",
    items: [
      { href: "/admin/products", icon: Package, label: "商品管理" },
      { href: "/admin/recipes", icon: Camera, label: "レシピ管理" },
      { href: "/admin/collections", icon: Layout, label: "コレクション" },
      { href: "/admin/tags", icon: Tag, label: "タグ管理" }
    ]
  },
  {
    title: "運用・設定",
    items: [
      { href: "/admin/amazon-sales", icon: Calendar, label: "セールスケジュール" },
      { href: "/admin/theme", icon: Palette, label: "テーマ" },
      { href: "/admin/settings", icon: Settings, label: "設定" }
    ]
  }
]

const STORAGE_KEY = "v0-admin-sidebar"

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any | null>(null)

  useEffect(() => {
    setIsHydrated(true)
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "collapsed") {
      setIsExpanded(false)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, isExpanded ? "expanded" : "collapsed")
  }, [isExpanded, isHydrated])

  useEffect(() => {
    let active = true
    const loadProfileImage = async () => {
      try {
        const res = await apiFetch('/api/profile')
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const data = json?.data || null
        // Prefer profile image key => build public URL; fallback to avatarUrl or legacy profileImage
        const extractKey = (u: any) => {
          if (!u) return null
          try {
            const url = new URL(u)
            let p = url.pathname.replace(/^\/+/, '')
            p = p.replace(/^cdn-cgi\/image\/[^\/]+\//, '')
            return p || null
          } catch (e) {
            return typeof u === 'string' && u.includes('/') ? u : null
          }
        }

        let image: string | null = null
        // Prefer canonical `profile_image_key` stored on the server. If present,
        // build a public URL from that key (avoid using a possibly stale client-side cache).
        const profileKey = data?.profile_image_key ?? data?.profileImageKey ?? (data?.profileImage ? extractKey(data.profileImage) : null)
        if (profileKey) {
          let candidate: string
          if (data?.profile_image_key) {
            // If we have the canonical key, prefer creating a public URL from it.
            candidate = getPublicImageUrl(String(profileKey)) || String(profileKey)
          } else {
            // Backwards compatibility: try client cache first, then normalize.
            const cached = db.images.getUpload(profileKey)
            const raw = (typeof cached === 'string' && cached) ? cached : String(profileKey)
            candidate = (raw.startsWith('http') || raw.startsWith('/')) ? raw : (getPublicImageUrl(raw) || raw)
          }

          try {
            const resp = responsiveImageForUsage(candidate, 'avatar')
            image = resp?.src || getPublicImageUrl(String(profileKey)) || candidate
          } catch (e) {
            image = getPublicImageUrl(String(profileKey)) || candidate
          }
        } else {
          image = data?.avatarUrl || data?.profileImage || null
        }
        if (active) {
          setProfileData(data)
          setProfileImageUrl(image || null)
          try {
            if (typeof window !== 'undefined' && data) {
              const mirror = { id: data.id, email: data.email || null, username: data.username || data.displayName || null }
              window.localStorage.setItem('auth_user', JSON.stringify(mirror))
            }
          } catch (e) {
            // ignore localStorage errors
          }
        }
      } catch (error) {
        console.warn("[admin-nav] failed to load profile image", error)
      }
    }
    loadProfileImage()
    return () => {
      active = false
    }
  }, [])

  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const ok = await auth.logout()
      if (!ok) {
        try {
          toast({ title: 'ログアウトに失敗しました', description: 'サーバーまたはネットワークの問題が発生しました。' })
        } catch {
          // fallback
          alert('ログアウトに失敗しました')
        }
      }
    } catch (e) {
      try { toast({ title: 'ログアウトに失敗しました' }) } catch { alert('ログアウトに失敗しました') }
    }
  }

  const currentUser = auth.getCurrentUser()
  const userLabel = profileData?.username || profileData?.displayName || currentUser?.username || currentUser?.email || "ログインユーザー"

  const initials = useMemo(() => {
    const sourceName = profileData?.username || profileData?.displayName || currentUser?.username || currentUser?.email || ""
    if (!sourceName) return "?"
    const sanitized = sourceName.includes("@") ? sourceName.split("@")[0] : sourceName
    return (
      sanitized
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?"
    )
  }, [currentUser, profileData])

  const renderNavItems = (showLabels: boolean, closeOnClick?: boolean) => (
    <div className="space-y-6">
      {navSections.map((section) => (
        <div key={section.title}>
          {showLabels && (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {section.title}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const isDashboard = item.href === "/admin"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "group relative flex items-center gap-3 text-sm font-medium transition-colors",
                    showLabels ? "w-full rounded-lg px-3 py-2" : "h-12 w-12 justify-center rounded-xl",
                    isActive
                      ? isDashboard
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => {
                    if (closeOnClick) {
                      setIsMobileOpen(false)
                    }
                  }}
                >
                  <Icon className={cn("h-5 w-5", !showLabels && "h-6 w-6")} />
                  {showLabels && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  const desktopSidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt="プロフィール画像"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-primary/20 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials !== "?" ? initials : "Sh"}
            </div>
          )}
          {isExpanded && (
            <div>
              <p className="text-sm font-semibold">Samehome Console</p>
              <p className="text-xs text-muted-foreground">管理ページ</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">{renderNavItems(isExpanded)}</div>
      <div className={cn("border-t px-3 py-4", !isExpanded && "px-2")}>
        {(profileData || currentUser) ? (
          <div
            className={cn("flex items-center gap-3", !isExpanded && "justify-center")}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="プロフィール画像"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {initials}
              </div>
            )}
            {isExpanded && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userLabel}</p>
                {(profileData?.email || currentUser.email) && (
                  <p className="truncate text-xs text-muted-foreground">{profileData?.email || currentUser.email}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/admin/login"
            className={cn(
              "flex items-center gap-3 text-sm text-muted-foreground",
              !isExpanded && "justify-center"
            )}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="プロフィール画像"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">?</div>
            )}
            {isExpanded && <span>ログイン</span>}
          </Link>
        )}
        <Button
          variant="outline"
          size={isExpanded ? "sm" : "icon"}
          className={cn(
            "mt-4 transition-all",
            isExpanded ? "w-full justify-start gap-2" : "mx-auto h-10 w-10 justify-center rounded-lg"
          )}
          aria-label={isExpanded ? "サイドバーを折りたたむ" : "サイドバーを展開する"}
          title={isExpanded ? "サイドバーを折りたたむ" : "サイドバーを展開する"}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {isExpanded && <span>サイドバーを折りたたむ</span>}
        </Button>
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => router.push("/")}
          >
            <ExternalLink className="h-4 w-4" />
            {isExpanded && <span>公開ページを見る</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isExpanded && <span>ログアウト</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  const mobileHeader = (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt="プロフィール画像"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-primary/20 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials !== "?" ? initials : "Sh"}
          </div>
        )}
        <div className="leading-tight">
          <p className="text-sm font-semibold">Samehome Console</p>
          <p className="text-xs text-muted-foreground">管理ページ</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  )

  const mobileSidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt="プロフィール画像"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials !== "?" ? initials : "Sh"}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-semibold">Samehome Console</p>
            <p className="text-xs text-muted-foreground">管理ページ</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close menu"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{renderNavItems(true, true)}</div>
      <div className="border-t px-4 py-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => {
            router.push("/")
            setIsMobileOpen(false)
          }}
        >
          <ExternalLink className="h-4 w-4" />
          公開ページを見る
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => {
            setIsMobileOpen(false)
            handleLogout()
          }}
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {mobileHeader}
      <aside
        className={cn(
          "hidden md:flex sticky top-0 self-start shrink-0 border-r bg-card shadow-sm transition-[width] duration-300 min-h-screen",
          isExpanded ? "w-68" : "w-17"
        )}
      >
        {desktopSidebar}
      </aside>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-card shadow-xl transition-transform md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {mobileSidebar}
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
