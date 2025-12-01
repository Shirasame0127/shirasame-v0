// Server Component: 公開トップページ（ISR + 初期データSSR）
import HomePageClient from "@/components/home-page-client";
import fs from 'fs/promises'
import path from 'path'

// ISR 設定: 12時間 (43200秒) ごとに再生成。
export const revalidate = 43200;

function buildUrl(path: string) {
  const envOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN || '').trim()
  if (envOrigin) {
    const origin = envOrigin.replace(/\/$/, '')
    const p = path.startsWith('/') ? path : `/${path}`
    return `${origin}${p}`
  }
  const isProd = process.env.NODE_ENV === 'production'
  const port = process.env.PORT || (isProd ? '' : '3000')
  const host = process.env.PUBLIC_HOST || `localhost${port ? `:${port}` : ''}`
  const proto = isProd ? 'https' : 'http'
  const p = path.startsWith('/') ? path : `/${path}`
  return `${proto}://${host}${p}`
}

async function fetchJson(url: string, init?: RequestInit & { next?: any }) {
  try {
    const res = await fetch(url, init)
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch (e) {
    try {
      if (process.env.ENABLE_ISR_LOGS === '1') {
        console.error('[ISR] fetchJson failed', { url, error: (e as any)?.message || String(e) })
      }
    } catch {}
    return null
  }
}

async function loadInitial() {
  // 静的データモード: public/data/*.json をビルド時に読み込み
  if (process.env.NEXT_PUBLIC_USE_STATIC_DATA === '1') {
    try {
      const base = path.join(process.cwd(), 'public', 'data')
      const [prodRaw, colRaw, tgRaw] = await Promise.all([
        fs.readFile(path.join(base, 'products.json'), 'utf8').catch(() => '{}'),
        fs.readFile(path.join(base, 'collections.json'), 'utf8').catch(() => '{}'),
        fs.readFile(path.join(base, 'tag-groups.json'), 'utf8').catch(() => '{}'),
      ])
      const products = JSON.parse(prodRaw).data || []
      const collections = JSON.parse(colRaw).data || []
      const tagGroups = JSON.parse(tgRaw).data || {}
      return { products, collections, tagGroups }
    } catch (e) {
      console.error('[SSG] failed to read public/data JSON', e)
      // フォールバック: 下のISRルートへ
    }
  }
  // ISR再生成や初回SSR呼び出しの簡易ログ（環境変数で抑制可能）
  try {
    if (process.env.ENABLE_ISR_LOGS === '1') {
      // グローバルカウンタで再生成回数を把握
      // @ts-ignore
      if (!(global as any)._pageIsrCount) (global as any)._pageIsrCount = 0
      // @ts-ignore
      (global as any)._pageIsrCount += 1
      // @ts-ignore
      const count = (global as any)._pageIsrCount
      console.info('[ISR] loadInitial invoked', { ts: new Date().toISOString(), count, revalidate })
    }
  } catch {}
  // products (shallow first page) / collections / tag-groups + tags → tagGroups mapping
  const productsJson = await fetchJson(buildUrl(`/api/products?published=true&shallow=true&limit=24&offset=0`), {
    next: { revalidate, tags: ["products"] },
  })
  const collectionsJson = await fetchJson(buildUrl(`/api/collections`), {
    next: { revalidate, tags: ["collections"] },
  })
  const tagGroupsJson = await fetchJson(buildUrl(`/api/tag-groups`), {
    next: { revalidate, tags: ["tag-groups"] },
  })
  const tagsJson = await fetchJson(buildUrl(`/api/tags`), {
    next: { revalidate, tags: ["tags"] },
  })

  const products = Array.isArray(productsJson?.data) ? productsJson!.data : []
  const collections = Array.isArray(collectionsJson?.data) ? collectionsJson!.data : []
  const serverTagGroups = Array.isArray(tagGroupsJson?.data) ? tagGroupsJson!.data : []
  const serverTags = Array.isArray(tagsJson?.data) ? tagsJson!.data : []

  // tagGroups mapping (groupName -> string[] tag names)
  const tagGroupsMap: Record<string, string[]> = {}
  for (const g of serverTagGroups) {
    if (!g || !g.name) continue
    tagGroupsMap[g.name] = []
  }
  for (const t of serverTags) {
    const tagName = t.name
    const groupName = t.group || '未分類'
    if (!tagGroupsMap[groupName]) tagGroupsMap[groupName] = []
    if (!tagGroupsMap[groupName].includes(tagName)) tagGroupsMap[groupName].push(tagName)
  }
  if (Object.keys(tagGroupsMap).length === 0) {
    // fallback derive from product tags
    const derived: Record<string, string[]> = {}
    products.filter((p: any) => p.published && Array.isArray(p.tags)).forEach((p: any) => {
      (p.tags as string[]).forEach(tag => {
        const isLinkTag = tag === 'Amazon' || tag === '楽天市場' || tag === 'Yahoo!ショッピング' || tag === '公式サイト'
        const groupName = isLinkTag ? 'リンク先' : 'その他'
        if (!derived[groupName]) derived[groupName] = []
        if (!derived[groupName].includes(tag)) derived[groupName].push(tag)
      })
    })
    return { products, collections, tagGroups: derived }
  }
  return { products, collections, tagGroups: tagGroupsMap }
}

export default async function Page() {
  const initial = await loadInitial()
  return (
    <HomePageClient
      initialProducts={initial.products}
      initialCollections={initial.collections}
      initialTagGroups={initial.tagGroups}
    />
  )
}
