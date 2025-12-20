"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useRef } from "react"
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
  const [isExpandedWidth, setIsExpandedWidth] = useState(true)
  // controls only the label/content visibility (opacity fade)
  const [labelsVisible, setLabelsVisible] = useState(true)
  // whether label occupies layout space (max-width > 0)
  const [labelsInLayout, setLabelsInLayout] = useState(true)
  const timersRef = useRef<number[]>([])
  const FADE_MS = 300
  const STAGGER_MS = 20
  const CHAR_MS = 80
  const WIDTH_MS = 300 // matches CSS `duration-300` on aside
  const [isMobile, setIsMobile] = useState(false)

  const renderChars = (text: string, showLabelsFlag?: boolean) => {
    // On mobile viewports we render plain text (no per-character animation).
    if (isMobile) {
      return (
        <span className={cn(showLabelsFlag ? "ml-2" : "ml-0", "inline-flex items-center")}>
          {text}
        </span>
      )
    }

    const chars = Array.from(text)
    const wrapperStyle: React.CSSProperties = {
      overflow: 'hidden',
      display: 'inline-flex',
      maxWidth: labelsInLayout ? undefined : '0px',
      transition: `max-width ${FADE_MS}ms ease-in-out`,
    }
    return (
      <span className={cn(showLabelsFlag ? "ml-2" : "ml-0", "inline-flex items-center")}
            style={wrapperStyle}>
        {chars.map((ch, i) => {
          // When characters are visible (opening), show them simultaneously (no stagger).
          // When hiding (closing), stagger right->left using delay based on index.
          const delay = labelsVisible ? 0 : (chars.length - 1 - i) * STAGGER_MS
          const style: React.CSSProperties = {
            display: 'inline-block',
            transformOrigin: 'right',
            transform: labelsVisible ? 'scaleX(1)' : 'scaleX(0)',
            opacity: labelsVisible ? 1 : 0,
            transitionProperty: 'transform,opacity',
            transitionDuration: `${CHAR_MS}ms`,
            transitionTimingFunction: 'ease-in-out',
            transitionDelay: `${delay}ms`,
          }
          return (
            <span key={i} style={style} aria-hidden={ch === ' '}>
              {ch}
            </span>
          )
        })}
      </span>
    )
  }
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileImageResponsive, setProfileImageResponsive] = useState<{ src: string | null; srcSet: string | null; sizes?: string | undefined } | null>(null)
  const [profileData, setProfileData] = useState<any | null>(null)

  useEffect(() => {
    setIsHydrated(true)
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "collapsed") {
      setIsExpandedWidth(false)
      setLabelsVisible(false)
      setLabelsInLayout(false)
    }
  }, [])

  // Listen for header-initiated open/close events (e.g. swipe on mobile)
  useEffect(() => {
    const open = () => setIsMobileOpen(true)
    const close = () => setIsMobileOpen(false)
    const toggle = () => setIsMobileOpen((v) => !v)
    window.addEventListener('admin:open-mobile-sidebar', open)
    window.addEventListener('admin:close-mobile-sidebar', close)
    window.addEventListener('admin:toggle-mobile-sidebar', toggle)
    return () => {
      window.removeEventListener('admin:open-mobile-sidebar', open)
      window.removeEventListener('admin:close-mobile-sidebar', close)
      window.removeEventListener('admin:toggle-mobile-sidebar', toggle)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, isExpandedWidth ? "expanded" : "collapsed")
  }, [isExpandedWidth, isHydrated])

  // track whether we are on a mobile viewport so we can disable animations there
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(!!mq.matches)
    update()
    try {
      mq.addEventListener?.('change', update)
    } catch {
      mq.addListener?.(update)
    }
    return () => {
      try { mq.removeEventListener?.('change', update) } catch { mq.removeListener?.(update) }
    }
  }, [])

  useEffect(() => {
    return () => {
      // clear any pending timers on unmount
      try {
        timersRef.current.forEach((id) => clearTimeout(id))
      } catch {}
      timersRef.current = []
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadProfileImage = async () => {
      try {
        const res = await apiFetch('/api/profile')
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const data = json?.data || null
        // If profile endpoint doesn't include image info, fall back to site-settings
        if (data && !(data.profile_image_key || data.profileImageKey || data.profileImage || data.profile_image)) {
          try {
            const ss = await apiFetch('/api/site-settings')
            if (ss && ss.ok) {
              const ssj = await ss.json().catch(() => null)
              const sdata = ssj?.data || null
              if (sdata) {
                // merge possible profileImageKey from site-settings
                data.profileImageKey = data.profileImageKey || data.profile_image_key || sdata.profileImageKey || sdata.profile_image_key || sdata.profileImage || sdata.profile_image || sdata.profileImageKey
              }
            }
          } catch (e) {}
        }
        // Prefer profile image key => build public URL; fallback to avatarUrl or legacy profileImage
        function extractKeyFromUrl(u: any): string | null {
          if (!u || typeof u !== 'string') return null
          try {
            const url = new URL(u)
            let p = url.pathname.replace(/^\/+/, '')
            // strip possible /cdn-cgi/image/.../ prefix
            p = p.replace(/^cdn-cgi\/image\/[^\/]+\//, '')
            return p || null
          } catch (e) {
            // not a URL — maybe it's already a key
            if (typeof u === 'string' && u.length > 0) return u
            return null
          }
        }

        let image: string | null = null
        let resp: { src: string | null; srcSet: string | null; sizes?: string | undefined } | null = null
        // Align with site-settings: prefer canonical key, prefer local upload cache,
        // then generate a public URL via `getPublicImageUrl` before calling
        // `responsiveImageForUsage` so admin-nav matches site-settings behavior.
        const rawProfileCandidate = data?.profile_image_key ?? data?.profileImageKey ?? data?.profileImage ?? null
        const profileKey = extractKeyFromUrl(rawProfileCandidate) || (rawProfileCandidate ? String(rawProfileCandidate) : null)
        if (profileKey) {
          const cached = db.images.getUpload(profileKey)
          const baseInput = (typeof cached === 'string' && cached) ? cached : String(profileKey)
          // generate public base from either cached preview or canonical key
          const publicBase = getPublicImageUrl(baseInput) || ((baseInput && (baseInput.startsWith('http') || baseInput.startsWith('/'))) ? baseInput : String(profileKey))
          try {
            resp = responsiveImageForUsage(publicBase, 'avatar')
            image = resp?.src || publicBase
          } catch (e) {
            image = publicBase
            resp = { src: publicBase, srcSet: null, sizes: undefined }
          }
        } else {
          image = data?.avatarUrl || data?.profileImage || null
          if (image) {
            try {
              resp = responsiveImageForUsage(image, 'avatar')
              image = resp?.src || image
            } catch (e) {
              resp = { src: image, srcSet: null, sizes: undefined }
            }
          }
        }
        if (active) {
          setProfileData(data)
          setProfileImageUrl(image || null)
          setProfileImageResponsive(resp)
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

  const renderNavItems = (showLabels: boolean, closeOnClick?: boolean, forcePlainLabels?: boolean) => (
    <div className="space-y-6">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
            {/* On mobile always show the full section title without animation. Otherwise follow showLabels. */}
            {isMobile ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 ">{section.title}</span>
            ) : showLabels ? (
              <span className={cn("transition-opacity duration-300", "opacity-100 text-muted-foreground/70")}>
                {section.title}
              </span>
            ) : (
              <span className="inline-block w-3 text-center ml-1 text-transparent opacity-0">{String(section.title).charAt(0)}</span>
            )}
          </p>
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
                    "group relative flex items-center gap-3 text-sm font-medium transition-colors h-12",
                      showLabels ? "w-full rounded-lg px-4" : "w-12 justify-center rounded-lg",
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
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {(isMobile || labelsInLayout) ? (
                    <span className={cn(showLabels ? "ml-2" : "ml-0", "relative inline-block align-middle overflow-hidden", (isMobile || labelsInLayout) ? "max-w-[240px]" : "max-w-0")}>
                      {forcePlainLabels ? (
                        <span className={showLabels ? 'ml-2' : 'ml-0'}>{item.label}</span>
                      ) : (
                        renderChars(item.label, showLabels)
                      )}
                    </span>
                  ) : null}
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
      
      <div className="flex-1 overflow-y-auto px-2 py-4 admin-nav-hide-scrollbar">{renderNavItems(isExpandedWidth)}</div>
      <div className={cn("border-t px-3 py-4", !isExpandedWidth && "px-2")}>
        {! (profileData || currentUser) ? (
          <Link
            href="/admin/login"
            className={cn(
              "flex items-center gap-3 text-sm text-muted-foreground",
              !isExpandedWidth && "justify-center"
            )}
          >
            {profileImageUrl ? (
              <img
                src={profileImageResponsive?.src || profileImageUrl || undefined}
                srcSet={profileImageResponsive?.srcSet || undefined}
                sizes={profileImageResponsive?.sizes}
                alt="プロフィール画像"
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">?</div>
            )}
            {(isMobile || labelsInLayout) ? (
              <span className={cn("relative inline-block align-middle overflow-hidden", isExpandedWidth ? "ml-0" : "ml-0", (isMobile || labelsInLayout) ? "max-w-[240px]" : "max-w-0")}> 
                {renderChars('ログイン', isExpandedWidth)}
              </span>
            ) : null}
          </Link>
        ) : null}
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => router.push("/")}
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            {(isMobile || labelsInLayout) ? (
              <span className={cn("relative inline-block align-middle overflow-hidden", (isMobile || labelsInLayout) ? "max-w-[240px]" : "max-w-0")}>
                {renderChars('公開ページを見る', isExpandedWidth)}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  )

  const mobileHeader = (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        {profileImageUrl ? (
          <img
            src={profileImageResponsive?.src || profileImageUrl || undefined}
            srcSet={profileImageResponsive?.srcSet || undefined}
            sizes={profileImageResponsive?.sizes}
            alt="プロフィール画像"
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
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
      {/* Mobile: the header swipe opens the menu; no hamburger button */}
    </header>
  )

  const mobileSidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close menu"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5 flex-shrink-0" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 admin-nav-hide-scrollbar">{renderNavItems(true, true, true)}</div>
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
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
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
            <LogOut className="h-4 w-4 flex-shrink-0" />
          ログアウト
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <style jsx>{`
        .admin-nav-hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .admin-nav-hide-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .admin-nav-hide-scrollbar *::-webkit-scrollbar { display: none !important; }
        .admin-nav-hide-scrollbar { scrollbar-color: transparent transparent !important; }
      `}</style>
      {/* mobileHeader removed — global header provides profile and controls on mobile */}
      <aside
        style={{ willChange: 'width', transform: 'translateZ(0)' }}
        className={cn(
          "hidden md:flex self-start shrink-0 border-r bg-card shadow-2xl transition-[width] duration-300 h-full z-30 overflow-hidden admin-nav-hide-scrollbar",
          isExpandedWidth ? "w-72" : "w-20"
        )}
        aria-hidden={isMobileOpen}
      >
            <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-0">{desktopSidebar}</div>
          <div className="p-3">
            <button
              aria-label={isExpandedWidth ? 'サイドバーを折りたたむ' : 'サイドバーを展開する'}
              title={isExpandedWidth ? 'サイドバーを折りたたむ' : 'サイドバーを展開する'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-transparent"
              onClick={() => {
                // clear any existing timers so toggles don't interleave
                try {
                  timersRef.current.forEach((id) => clearTimeout(id))
                } catch {}
                timersRef.current = []

                // Compute a safe total per-char duration based on longest label
                const allLabels = navSections.flatMap((s) => s.items.map((it) => it.label))
                allLabels.push(userLabel)
                const maxLen = Math.max(...allLabels.map((t) => String(t || '').length), 1)
                const totalCharsMs = CHAR_MS + STAGGER_MS * Math.max(0, maxLen - 1)
                const totalMs = Math.min(1000, totalCharsMs + 20)

                if (isExpandedWidth) {
                  // Closing: start per-char right->left fade first.
                  setLabelsVisible(false)
                  // Start collapsing after the second character (from the right) has finished.
                  // This gives the perception of the sidebar closing while the rightmost letters
                  // are still fading, avoiding the feeling that text disappeared first then the bar closed.
                  const collapseAfter = CHAR_MS + STAGGER_MS * Math.max(0, 1 - 1) // start when 2nd char done
                  // Remove label layout slightly before starting width collapse to avoid icon shift
                  const layoutRemoveBefore = 30
                  const layoutRemoveAt = Math.max(0, collapseAfter - layoutRemoveBefore)
                  timersRef.current.push(window.setTimeout(() => {
                    setLabelsInLayout(false)
                  }, layoutRemoveAt))
                  // Then start the sidebar width collapse
                  timersRef.current.push(window.setTimeout(() => {
                    setIsExpandedWidth(false)
                  }, collapseAfter + 8))
                  // Fallback safety: ensure we eventually remove layout and collapse if something blocks
                  timersRef.current.push(window.setTimeout(() => {
                    setLabelsInLayout(false)
                    setIsExpandedWidth(false)
                  }, Math.min(1500, totalMs + 300)))
                } else {
                  // Expanding: open width then, just before it finishes, make labels occupy layout
                  // and fade in so the text doesn't appear to slide from the right.
                  setIsExpandedWidth(true)
                  const visibleAt = Math.max(0, WIDTH_MS - CHAR_MS - 20)
                  const layoutAt = Math.max(0, visibleAt - 40)
                  timersRef.current.push(window.setTimeout(() => {
                    setLabelsInLayout(true)
                  }, layoutAt))
                  // Start fade-in slightly before width finishes so characters appear naturally.
                  timersRef.current.push(window.setTimeout(() => {
                    setLabelsVisible(true)
                  }, visibleAt))
                }
              }}
            >
              {isExpandedWidth ? <ChevronLeft className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-card shadow-xl transition-transform md:hidden admin-nav-hide-scrollbar",
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
