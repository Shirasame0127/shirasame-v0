"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Settings, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { db } from "@/lib/db/storage"
import type { Collection } from "@/lib/mock-data/collections"

interface PublicNavProps {
  logoUrl?: string
  siteName: string
}

export function PublicNav({ logoUrl, siteName }: PublicNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    const loadedCollections = db.collections.getAll().filter((c) => c.visibility === "public")
    setCollections(loadedCollections)
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
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-auto">
              <Image
                src="/images/shirasame-logo.png"
                alt={siteName}
                width={180}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                管理画面
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">目次</h3>
            <div>
              <h4 className="text-sm font-medium mb-2">コレクション</h4>
              {collections.length === 0 ? (
                <a className="block py-2 px-3 rounded-md text-sm text-muted-foreground">読み込み中…</a>
              ) : (
                collections.map((col) => (
                  <a
                    key={col.id}
                    href={`#collection-${col.id}`}
                    onClick={(e) => handleAnchorClick(e, `collection-${col.id}`)}
                    className="block py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
                  >
                    {col.title}
                  </a>
                ))
              )}
            </div>
            <a
              href="#all-products"
              onClick={(e) => handleAnchorClick(e, "all-products")}
              className="block py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              すべての商品
            </a>
            <a
              href="#recipes"
              onClick={(e) => handleAnchorClick(e, "recipes")}
              className="block py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              デスクセットアップ
            </a>
            <a
              href="#profile"
              onClick={(e) => handleAnchorClick(e, "profile")}
              className="block py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              プロフィール
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
