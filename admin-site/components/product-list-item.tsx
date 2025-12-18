"use client"

import { responsiveImageForUsage, getPublicImageUrl } from "@/lib/image-url"
import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import type { Product } from "@/lib/db/schema"

interface ProductListItemProps {
  product: Product
  onUpdate?: () => void
}

export function ProductListItem({ product, onUpdate }: ProductListItemProps) {
  const router = useRouter()
  const [publishedState, setPublishedState] = useState<boolean>(!!product.published)

  const handleTogglePublished = async (newVal: boolean) => {
    // optimistic
    const prev = publishedState
    setPublishedState(newVal)
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}/published`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: newVal }) })
      if (!res || !res.ok) {
        throw new Error('Failed')
      }
      if (onUpdate) onUpdate()
    } catch (e) {
      console.error('公開切替失敗', e)
      alert('公開ステータスの切替に失敗しました')
      setPublishedState(prev)
    }
  }
  // Prefer authoritative `main_image_key` column when present, otherwise fall back to images array
  const mainImageFromImages = product.images?.find((img) => img.role === "main") || product.images?.[0]
  const mainImage = product.main_image_key ? { key: product.main_image_key } as any : mainImageFromImages

  const handleDelete = async () => {
    if (!product?.id) {
      alert('削除対象のIDが見つかりません。しばらくしてから再度お試しください。')
      return
    }

    if (!confirm(`「${product.title}」を削除してもよろしいですか？`)) return
    
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      if (onUpdate) onUpdate()
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert('削除に失敗しました')
    }
  }

  return (
    <Card>
      <CardContent className="h-24">
        <div className="flex gap-4 h-full">
          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
            {
              (() => {
                // Resolve candidate the same way as `site-settings` then
                // normalize to a public CDN URL before asking for resized variants.
                const raw = (mainImage as any)?.key || (mainImage as any)?.basePath || (mainImage as any)?.url || null
                const candidate = (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('/'))) ? raw : db.images.getUpload(String(raw)) || String(raw || '')
                // Ensure we have a canonical public base URL (matches site-settings behavior)
                const publicBase = getPublicImageUrl(candidate) || candidate || ''
                const resp = responsiveImageForUsage(publicBase || null, 'list')
                const placeholder = "/placeholder.svg?height=200&width=200"
                return <img src={resp.src || (publicBase || placeholder)} srcSet={resp.srcSet || undefined} sizes={resp.sizes} alt={product.title} className="w-full h-full object-cover" />
              })()
            }
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between relative">
            {/* Top row: published badge + switch aligned to right */}
            <div className="flex items-start justify-end">
              <div className="flex items-center gap-2">
                  <Badge variant={publishedState ? "default" : "secondary"}>
                    {publishedState ? "公開中" : "下書き"}
                  </Badge>
                  <Switch
                    data-no-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    checked={publishedState}
                    onCheckedChange={(v) => handleTogglePublished(!!v)}
                  />
                </div>
            </div>

            {/* Middle row: product name */}
            <div className="flex-1 flex items-center">
              <h3 className="font-semibold line-clamp-2">{product.title}</h3>
            </div>

            {/* Bottom row: only ellipsis menu button which toggles actions */}
            <div className="flex items-end justify-end">
              <MenuActions productId={product?.id} onEdit={() => {
                if (product?.id) router.push(`/admin/products/edit?id=${product.id}`)
              }} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MenuActions({ productId, onEdit, onDelete }: { productId?: string | null; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
      <div className="relative" ref={ref}>
      <Button
        data-no-drag
        variant="ghost"
        size="icon"
        aria-label="項目の操作"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute right-0 bottom-10 z-20 w-40 rounded-md border bg-card shadow-md">
          <button className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2" data-no-drag onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => { setOpen(false); onEdit() }}>
            <Edit className="w-4 h-4" /> 編集
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-muted text-destructive flex items-center gap-2" data-no-drag onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => { setOpen(false); onDelete() }}>
            <Trash2 className="w-4 h-4" /> 削除
          </button>
        </div>
      )}
    </div>
  )
}
