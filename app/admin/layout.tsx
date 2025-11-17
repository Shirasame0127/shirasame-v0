"use client"

import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { usePathname } from 'next/navigation'
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isRecipeEditPage = pathname?.includes('/admin/recipes/') && pathname?.includes('/edit')

  return (
    <div className={`min-h-screen bg-muted/30 ${isRecipeEditPage ? 'overflow-hidden' : ''}`}>
      {!isRecipeEditPage && <AdminNav />}
      <main className={isRecipeEditPage ? 'h-screen' : ''}>{children}</main>
      <Toaster />
    </div>
  )
}
