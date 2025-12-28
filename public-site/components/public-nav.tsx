"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Menu, X, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"

type Collection = { id: string; title: string; visibility?: string }

type Recipe = { id: string; title: string }

import apiFetch from "@/lib/api-client"
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.shirasame.com'

interface PublicNavProps {
  logoUrl?: string
  siteName: string
}

export function PublicNav({ logoUrl, siteName }: PublicNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [overlayHeight, setOverlayHeight] = useState<number | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [initialLoading, setInitialLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [colRes, recRes] = await Promise.all([
          apiFetch('/collections'),
          apiFetch('/recipes'),
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

  // measure menu height to limit overlay to only necessary area
  useEffect(() => {
    function updateHeight() {
      try {
        const h = menuRef.current?.getBoundingClientRect().height || null
        setOverlayHeight(h)
      } catch { setOverlayHeight(null) }
    }
    if (isMenuOpen) {
      // measure after next tick to ensure layout
      const id = window.setTimeout(updateHeight, 30)
      window.addEventListener('resize', updateHeight)
      return () => { window.clearTimeout(id); window.removeEventListener('resize', updateHeight) }
    } else {
      setOverlayHeight(null)
    }
  }, [isMenuOpen])

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="relative flex h-16 items-center justify-center px-2">
            <Link href="/" className="absolute left-4 translate-x-0 flex items-center">
              <div className="relative h-14 w-auto sm:h-12">
                {/* prefer provided PNG (attached), fallback to SVG */}
                <img
                  src={logoUrl || '/images/shirasame-logo.png'}
                  alt={siteName}
                  width={220}
                  height={56}
                  className="h-10 sm:h-10 w-auto object-contain"
                  onError={(e) => { try { (e.target as HTMLImageElement).src = '/images/shirasame-logo.svg' } catch {} }}
                />
              </div>
          </Link>
          <div className="absolute right-2 flex items-center gap-2">
            <Link href="/contact" className="inline-flex">
              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-sky-400 text-white hover:bg-sky-500 focus:ring-2 focus:ring-sky-300"
              >
                Contact
              </Button>
            </Link>
            <Button
              data-hamburger-button
              variant="ghost"
              size="icon-lg"
              className="rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-sm shadow-lg ring-1 ring-white/10 dark:ring-black/20 w-12 h-12 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-12 h-12" /> : <Menu className="w-12 h-12" />}
            </Button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        className={`fixed top-0 right-0 w-80 max-h-[90vh] overflow-auto bg-white border-l shadow-2xl z-60 rounded-l-xl menu-slide ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        <nav className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-serif font-semibold text-muted-foreground mb-3 tracking-wide uppercase">目次</h3>

            {/* 固定メニュー */}
            <a href="#" onClick={(e) => handleAnchorClick(e, "top")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">Top</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">0</span>
              </div>
            </a>

            <a href="#all-products" onClick={(e) => handleAnchorClick(e, "all-products")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">All Items</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">1</span>
              </div>
            </a>

            <a href="#recipes" onClick={(e) => handleAnchorClick(e, "recipes")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">Recipes</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">2</span>
              </div>
            </a>

            <a href="#profile" onClick={(e) => handleAnchorClick(e, "profile")} className="block group cursor-pointer">
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">Profile</span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">3</span>
              </div>
            </a>

            {/* 動的: Collections */}
            <div className="space-y-1 mt-4">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Collections</h4>
              {collections.length === 0 ? (
                initialLoading ? null : (
                  <div className="text-sm text-muted-foreground py-2">読み込み中…</div>
                )
              ) : (
                collections.map((col, index) => (
                  <a key={col.id} href={`#collection-${col.id}`} onClick={(e) => handleAnchorClick(e, `collection-${col.id}`)} className="block group cursor-pointer">
                    <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{col.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* 動的: Recipes */}
            <div className="space-y-1 mt-4">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Recipes</h4>
              {recipes.length === 0 ? (
                initialLoading ? null : (
                  <div className="text-sm text-muted-foreground py-2">読み込み中…</div>
                )
              ) : (
                recipes.map((r, index) => (
                  <a key={r.id} href={`#recipe-${r.id}`} onClick={(e) => handleAnchorClick(e, `recipe-${r.id}`)} className="block group cursor-pointer">
                    <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* overlay always present to allow smooth fade */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 menu-overlay-fade ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      {isMenuOpen && (
        <Button
          variant="ghost"
          size="icon-lg"
          className="fixed right-2 top-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm shadow-lg ring-1 ring-white/10 dark:ring-black/20 w-12 h-12 p-2 z-70"
          onClick={() => setIsMenuOpen(false)}
        >
          <X className="w-8 h-8" />
        </Button>
      )}
    </>
  )
}
