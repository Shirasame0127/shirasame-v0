"use client"

import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [sections, setSections] = useState<Array<{ id: string; href: string; label: string }>>([])

  // Known page sections we might link to. The sidebar should only show
  // links for sections that are actually present/visible on the current page.
  const CANDIDATE_SECTIONS = [
    { id: 'products', href: '/#products', label: '商品一覧' },
    { id: 'recipes', href: '/#recipes', label: 'デスクレシピ' },
  ]

  useEffect(() => {
    let mounted = true

    const check = () => {
      if (!mounted) return
      const visible = CANDIDATE_SECTIONS.filter((s) => {
        try {
          const el = document.getElementById(s.id)
          if (!el) return false
          // element is considered visible if it takes up layout space
          return el.offsetParent !== null && window.getComputedStyle(el).display !== 'none'
        } catch (e) {
          return false
        }
      })
      setSections(visible)
    }

    // initial check
    check()

    // Observe DOM changes in case sections are rendered asynchronously
    const mo = new MutationObserver(() => check())
    mo.observe(document.body, { childList: true, subtree: true })

    // also re-check on resize (layout changes)
    window.addEventListener('resize', check)

    return () => {
      mounted = false
      mo.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 md:hidden bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={`fixed right-0 top-14 bottom-0 w-64 bg-background border-l transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">目次</h3>
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">表示可能なセクションはありません</p>
          ) : (
            sections.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="block py-2 px-3 rounded-md hover:bg-accent transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                {s.label}
              </Link>
            ))
          )}
        </nav>
      </aside>
    </>
  )
}
