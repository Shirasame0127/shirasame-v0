import {
  Home,
  Package,
  Camera,
  Layout,
  Tag,
  Calendar,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  /** short label for compact contexts (e.g. mobile bottom bar) */
  short?: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

/** Single source of truth for admin navigation — consumed by the sidebar,
 *  the mobile drawer and the mobile bottom bar so they never drift apart. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", icon: Home, label: "ダッシュボード", short: "ホーム" }],
  },
  {
    title: "コンテンツ",
    items: [
      { href: "/admin/products", icon: Package, label: "商品管理", short: "商品" },
      { href: "/admin/recipes", icon: Camera, label: "レシピ管理", short: "レシピ" },
      { href: "/admin/collections", icon: Layout, label: "コレクション", short: "コレクション" },
      { href: "/admin/tags", icon: Tag, label: "タグ管理", short: "タグ" },
    ],
  },
  {
    title: "運用・設定",
    items: [
      { href: "/admin/amazon-sales", icon: Calendar, label: "セールスケジュール", short: "セール" },
      { href: "/admin/theme", icon: Palette, label: "テーマ", short: "テーマ" },
      { href: "/admin/settings", icon: Settings, label: "設定", short: "設定" },
    ],
  },
]

/** Flattened list of every destination. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

/** Primary destinations surfaced in the mobile bottom bar (a "メニュー" button
 *  opens the full drawer for everything else). */
export const PRIMARY_NAV: NavItem[] = [
  NAV_SECTIONS[0].items[0], // ダッシュボード
  NAV_SECTIONS[1].items[0], // 商品管理
  NAV_SECTIONS[1].items[1], // レシピ管理
  NAV_SECTIONS[1].items[2], // コレクション
]

export function isNavItemActive(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false
  if (href === "/admin") return pathname === "/admin" || pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
