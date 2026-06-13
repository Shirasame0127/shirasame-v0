"use client"

import { responsiveImageForUsage, getPublicImageUrl } from "@/lib/image-url"
import { db } from "@/lib/db/storage"
import apiFetch from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { confirm } from "@/components/ui/confirm"
import type { Product } from "@/lib/db/schema"

interface ProductListItemProps {
  product: Product
  onDeleted?: () => void
}

export function ProductListItem({ product, onDeleted }: ProductListItemProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [publishedState, setPublishedState] = useState<boolean>(!!product.published)
  const [deleting, setDeleting] = useState(false)

  const handleTogglePublished = async (newVal: boolean) => {
    const prev = publishedState
    setPublishedState(newVal) // optimistic
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}/published`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: newVal }),
      })
      if (!res || !res.ok) throw new Error('Failed')
      toast({ title: newVal ? '公開しました' : '下書きに戻しました' })
    } catch {
      setPublishedState(prev)
      toast({ title: '公開ステータスの切替に失敗しました', variant: 'destructive' })
    }
  }

  const mainImageFromImages = product.images?.find((img) => img.role === "main") || product.images?.[0]
  const mainImage = product.main_image_key ? ({ key: product.main_image_key } as any) : mainImageFromImages

  const handleDelete = async () => {
    if (!product?.id) return
    const ok = await confirm({
      title: '商品を削除しますか？',
      description: `「${product.title}」を削除します。この操作は取り消せません。`,
      confirmText: '削除する',
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: '削除しました' })
      onDeleted?.()
    } catch {
      toast({ title: '削除に失敗しました', variant: 'destructive' })
      setDeleting(false)
    }
  }

  return (
    <Card className={`gap-0 overflow-hidden py-0 transition-colors hover:border-primary/30 ${deleting ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex min-h-[6rem] gap-4 p-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
          {(() => {
            const raw = (mainImage as any)?.key || (mainImage as any)?.basePath || (mainImage as any)?.url || null
            const candidate = (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('/'))) ? raw : db.images.getUpload(String(raw)) || String(raw || '')
            const publicBase = getPublicImageUrl(candidate) || candidate || ''
            const resp = responsiveImageForUsage(publicBase || null, 'list')
            const placeholder = "/placeholder.svg?height=160&width=160"
            return <img src={resp.src || (publicBase || placeholder)} srcSet={resp.srcSet || undefined} sizes={resp.sizes} alt={product.title} className="h-full w-full object-cover" />
          })()}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-medium leading-snug">{product.title}</h3>
              {product.shortDescription && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.shortDescription}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2" data-no-drag onPointerDown={(e) => e.stopPropagation()}>
              <Badge variant={publishedState ? "default" : "secondary"} className={publishedState ? "" : "text-muted-foreground"}>
                {publishedState ? "公開中" : "下書き"}
              </Badge>
              <Switch
                checked={publishedState}
                onCheckedChange={(v) => handleTogglePublished(!!v)}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="公開状態の切替"
              />
            </div>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="num-display text-sm text-foreground">
              {typeof product.price === 'number' && product.showPrice !== false
                ? `¥${product.price.toLocaleString()}`
                : <span className="label-mono">price hidden</span>}
            </div>
            <MenuActions
              onEdit={() => product?.id && router.push(`/admin/products/edit?id=${product.id}`)}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function MenuActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative" ref={ref} data-no-drag onPointerDown={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon-sm" aria-label="操作メニュー" onTouchStart={(e) => e.stopPropagation()} onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute bottom-9 right-0 z-20 w-36 overflow-hidden rounded-md border bg-popover shadow-md">
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent" onClick={() => { setOpen(false); onEdit() }}>
            <Edit className="h-4 w-4" /> 編集
          </button>
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10" onClick={() => { setOpen(false); onDelete() }}>
            <Trash2 className="h-4 w-4" /> 削除
          </button>
        </div>
      )}
    </div>
  )
}
