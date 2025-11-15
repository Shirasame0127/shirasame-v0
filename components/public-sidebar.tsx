"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicSidebar() {
  const [isOpen, setIsOpen] = useState(false)

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
          <Link
            href="/#products"
            className="block py-2 px-3 rounded-md hover:bg-accent transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            商品一覧
          </Link>
          <Link
            href="/#recipes"
            className="block py-2 px-3 rounded-md hover:bg-accent transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            デスクレシピ
          </Link>
        </nav>
      </aside>
    </>
  )
}
