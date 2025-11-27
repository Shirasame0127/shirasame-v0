"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Settings, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { db } from "@/lib/db/storage"
import type { Collection } from "@/lib/db/schema"

interface PublicNavProps {
  logoUrl?: string
  siteName: string
}

export function PublicNav({ logoUrl, siteName }: PublicNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [initialLoading, setInitialLoading] = useState(false)

  useEffect(() => {
    const loadedCollections = db.collections.getAll().filter((c) => c.visibility === "public")
    setCollections(loadedCollections)
  }, [])

  useEffect(() => {
    // initialize from global flag and listen for changes from InitialLoading
    try {
      setInitialLoading(Boolean((window as any).__v0_initial_loading))
    } catch (e) {}
    const handler = (e: any) => {
      try {
        setInitialLoading(Boolean(e.detail))
      } catch (er) {}
    }
    try { window.addEventListener('v0-initial-loading', handler as EventListener) } catch (e) {}
    return () => { try { window.removeEventListener('v0-initial-loading', handler as EventListener) } catch (e) {} }
  }, [])

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    e.preventDefault()
    setIsMenuOpen(false)
    
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-auto">
              <Image
                src="/images/shirasame-logo.png"
                alt={siteName}
                width={180}
                height={48}
                className="ml-3 h-10 w-auto object-contain mx-3"
                priority
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground"> のコレクション</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                管理画面
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-auto">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-card border-l shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-serif font-semibold text-muted-foreground mb-3 tracking-wide uppercase">目次</h3>
            <div className="space-y-1">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">コレクション</h4>
              {collections.length === 0 ? (
                initialLoading ? null : (
                  <div className="text-sm text-muted-foreground py-2">読み込み中…</div>
                )
              ) : (
                collections.map((col, index) => (
                  <a
                    key={col.id}
                    href={`#collection-${col.id}`}
                    onClick={(e) => handleAnchorClick(e, `collection-${col.id}`)}
                    className="block group cursor-pointer"
                  >
                    <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {col.title}
                      </span>
                      <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                      <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
            <a
              href="#all-products"
              onClick={(e) => handleAnchorClick(e, "all-products")}
              className="block group cursor-pointer"
            >
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  すべての商品
                </span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">{collections.length + 1}</span>
              </div>
            </a>
            <a
              href="#recipes"
              onClick={(e) => handleAnchorClick(e, "recipes")}
              className="block group cursor-pointer"
            >
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  デスクセットアップ
                </span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">{collections.length + 2}</span>
              </div>
            </a>
            <a
              href="#profile"
              onClick={(e) => handleAnchorClick(e, "profile")}
              className="block group cursor-pointer"
            >
              <div className="flex items-baseline justify-between py-2 px-1 hover:bg-accent/50 rounded transition-colors">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  プロフィール
                </span>
                <span className="flex-1 mx-2 border-b border-dotted border-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground font-mono">{collections.length + 3}</span>
              </div>
            </a>
          </div>

          <div className="pt-6 border-t">
            <Link href="/admin">
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
