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
  const [reveal, setReveal] = useState(false)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
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

  // reveal animation control (clip-path) when opening
  useEffect(() => {
    let t: number | null = null
    if (isMenuOpen) {
      // compute hamburger button center as percentage of viewport
      try {
        const btn = document.querySelector('[data-hamburger-button]') as HTMLElement | null
        if (btn) {
          const r = btn.getBoundingClientRect()
          const x = ((r.left + r.width / 2) / (window.innerWidth || 1)) * 100
          const y = ((r.top + r.height / 2) / (window.innerHeight || 1)) * 100
          setAnchor({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
        }
      } catch {}
      // start from small, then trigger reveal in next tick for transition
      setReveal(false)
      t = window.setTimeout(() => setReveal(true), 20)
    } else {
      setReveal(false)
    }
    return () => { if (t) window.clearTimeout(t) }
  }, [isMenuOpen])

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
             <div className="absolute right-2 flex items-center gap-2">
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
        className={`fixed top-0 right-0 w-80 max-h-[90vh] overflow-auto bg-white border-l shadow-2xl z-60 transition-transform duration-300 ease-in-out rounded-l-xl ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        // clip-path animates from the hamburger button center when available
        style={{
          clipPath: (() => {
            const pos = anchor ? `${anchor.x}% ${anchor.y}%` : '96% 4%'
            return isMenuOpen ? (reveal ? `circle(160% at ${pos})` : `circle(0px at ${pos})`) : `circle(0px at ${pos})`
          })(),
          transition: 'clip-path 900ms cubic-bezier(.22,.9,.29,1), transform 300ms ease-in-out',
        }}
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

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsMenuOpen(false)} />
          {/* Ripple SVG: anchored near top-right (96,4 in viewBox coords) */}
          <svg className="fixed inset-0 pointer-events-none z-51 w-screen h-screen" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="turb" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="t" />
                <feDisplacementMap in="SourceGraphic" in2="t" scale="10" />
              </filter>
            </defs>
            <g filter="url(#turb)">
              {/* multiple expanding circles with staggered durations for a natural water spread */}
                <circle cx={String(anchor?.x ?? 96)} cy={String(anchor?.y ?? 4)} r="0" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" fill="none">
                  <animate attributeName="r" from="0" to="200" dur="1200ms" begin="0s" fill="freeze" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1200ms" begin="0s" fill="freeze" />
                </circle>
                <circle cx={String(anchor?.x ?? 96)} cy={String(anchor?.y ?? 4)} r="0" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none">
                  <animate attributeName="r" from="0" to="230" dur="1500ms" begin="200ms" fill="freeze" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1500ms" begin="200ms" fill="freeze" />
                </circle>
                <circle cx={String(anchor?.x ?? 96)} cy={String(anchor?.y ?? 4)} r="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
                  <animate attributeName="r" from="0" to="280" dur="2000ms" begin="400ms" fill="freeze" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2000ms" begin="400ms" fill="freeze" />
                </circle>
            </g>
          </svg>
          <Button
            variant="ghost"
            size="icon-lg"
            className="fixed right-2 top-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm shadow-lg ring-1 ring-white/10 dark:ring-black/20 w-12 h-12 p-2 z-70"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="w-8 h-8" />
          </Button>
        </>
      )}
    </>
  )
}
