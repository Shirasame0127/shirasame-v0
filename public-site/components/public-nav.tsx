"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"

type Collection = { id: string; title: string; visibility?: string }

type Recipe = { id: string; title: string }

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.shirasame.com'
const api = (p: string) => `${API_BASE}${p}`

interface PublicNavProps {
  logoUrl?: string
  siteName: string
}

export function PublicNav({ logoUrl, siteName }: PublicNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [initialLoading, setInitialLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [colRes, recRes] = await Promise.all([
          fetch(api('/collections')),
          fetch(api('/recipes')),
        ])
        const colJson = await colRes.json().catch(() => ({ data: [] }))
        const recJson = await recRes.json().catch(() => ({ data: [] }))
        const cols = Array.isArray(colJson.data) ? colJson.data : (colJson.data ? [colJson.data] : [])
        const recs = Array.isArray(recJson.data) ? recJson.data : (recJson.data ? [recJson.data] : [])
        if (mounted) {
          setCollections(cols.filter((c: any) => c.visibility ? c.visibility === 'public' : true))
          setRecipes(recs.filter((r: any) => r.published !== false))
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    try {
      setInitialLoading(Boolean((window as any).__v0_initial_loading))
    } catch (e) {}
    const handler = (e: any) => {
      try { setInitialLoading(Boolean(e.detail)) } catch {}
    }
    try { window.addEventListener('v0-initial-loading', handler as EventListener) } catch {}
    return () => { try { window.removeEventListener('v0-initial-loading', handler as EventListener) } catch {} }
  }, [])

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    e.preventDefault()
    setIsMenuOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="relative flex h-16 items-center justify-center px-2">
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="relative h-12 w-auto">
                {/* prefer provided PNG (attached), fallback to SVG */}
                {/* use plain <img> so we can fallback on error easily */}
                <img
                  src={logoUrl || '/images/shirasame-logo.png'}
                  alt={siteName}
                  width={180}
                  height={48}
                  className="h-10 w-auto object-contain"
                  onError={(e) => { try { (e.target as HTMLImageElement).src = '/images/shirasame-logo.svg' } catch {} }}
                />
              </div>
          </Link>
          <div className="absolute right-2 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className={`fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-white border-l shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <nav className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-serif font-semibold text-muted-foreground mb-3 tracking-wide uppercase">目次</h3>

            {/* 固定メニュー */}
            <a href="#" onClick={(e) => handleAnchorClick(e, "top")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Top</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">0</span>
              </div>
            </a>

            <a href="#all-products" onClick={(e) => handleAnchorClick(e, "all-products")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">All Items</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">1</span>
              </div>
            </a>

            <a href="#recipes" onClick={(e) => handleAnchorClick(e, "recipes")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Recipes</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">2</span>
              </div>
            </a>

            <a href="#profile" onClick={(e) => handleAnchorClick(e, "profile")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Profile</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">3</span>
              </div>
            </a>

            {/* 動的: Collections */}
            <div className="space-y-1 mt-4">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">Collections</h4>
              {collections.length === 0 ? (
                initialLoading ? null : (
                  <div className="text-sm text-muted-foreground py-2">読み込み中…</div>
                )
              ) : (
                collections.map((col, index) => (
                  <a key={col.id} href={`#collection-${col.id}`} onClick={(e) => handleAnchorClick(e, `collection-${col.id}`)} className="block group cursor-pointer">
                    <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{col.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* 動的: Recipes */}
            <div className="space-y-1 mt-4">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">Recipes</h4>
              {recipes.length === 0 ? (
                initialLoading ? null : (
                  <div className="text-sm text-muted-foreground py-2">読み込み中…</div>
                )
              ) : (
                recipes.map((r, index) => (
                  <a key={r.id} href={`#recipe-${r.id}`} onClick={(e) => handleAnchorClick(e, `recipe-${r.id}`)} className="block group cursor-pointer">
                    <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t">
            <Link href={ADMIN_BASE}>
              <Button variant="default" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                管理画面へ
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-30" onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  )
}
