/**
 * The four surfaces the home page is made of.
 *
 * Variants B and C both present these as switchable views rather than as one
 * long scroll. That ordering is deliberate: curated surfaces come first, and
 * the gallery — the only one that grows without bound — comes last, so adding
 * items never pushes collections or recipes out of reach.
 */
export type HomeView = "collections" | "recipes" | "items" | "gallery"

export const HOME_VIEWS: {
  id: HomeView
  label: string
  title: string
  subtitle: string
  /** Shown when the surface has no content yet. */
  empty: string
  /**
   * Whether the view gets a tab in the on-page index strip. All views are
   * always listed in the menu; the strip is kept to three so the tabs stay
   * comfortably tappable. "All items" is off the strip because the collection
   * view already ends with the full list.
   */
  inStrip: boolean
}[] = [
  {
    id: "collections",
    label: "コレクション",
    title: "Collection",
    subtitle: "テーマごとにまとめたアイテムです",
    empty: "まだコレクションがありません",
    inStrip: true,
  },
  {
    id: "recipes",
    label: "レシピ",
    title: "Recipe",
    subtitle: "写真の中の印をタップすると、そのアイテムを見られます",
    empty: "まだレシピがありません",
    inStrip: true,
  },
  {
    id: "items",
    label: "全アイテム",
    title: "All Items",
    subtitle: "登録されているアイテムの一覧です",
    empty: "まだアイテムがありません",
    inStrip: false,
  },
  {
    id: "gallery",
    label: "ギャラリー",
    title: "Gallery",
    subtitle: "すべての写真を並べて見られます",
    empty: "まだ写真がありません",
    inStrip: true,
  },
]

/** The subset that gets a tab in the on-page strip. */
export const STRIP_VIEWS = HOME_VIEWS.filter((v) => v.inStrip)

export function viewMeta(view: HomeView) {
  return HOME_VIEWS.find((v) => v.id === view) ?? HOME_VIEWS[0]
}

export function isHomeView(value: unknown): value is HomeView {
  return HOME_VIEWS.some((v) => v.id === value)
}
