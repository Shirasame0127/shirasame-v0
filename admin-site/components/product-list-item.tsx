"use client"

import { responsiveImageForUsage, getPublicImageUrl } from "@/lib/image-url"
import { db } from "@/lib/db/storage"
import apiFetch from "@/lib/api-client"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { confirm } from "@/components/ui/confirm"
import type { Product } from "@/lib/db/schema"

interface ProductListItemProps {
  product: Product
  onDeleted?: () => void
  /** Bulk-selection state; omitted when the list is not in selection mode. */
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
}

/**
 * A row in 商品管理.
 *
 * The row itself is the link to the editor. Editing used to be two taps behind
 * a "…" menu — the most frequent action on the screen, hidden. The two controls
 * that are not "open this product" (publish, delete) sit outside that link so
 * they stay reachable and cannot be triggered by opening the row.
 */
export function ProductListItem({ product, onDeleted, selected, onSelectedChange }: ProductListItemProps) {
  const { toast } = useToast()
  const [publishedState, setPublishedState] = useState<boolean>(!!product.published)
  const [deleting, setDeleting] = useState(false)

  const handleTogglePublished = async (newVal: boolean) => {
    const prev = publishedState
    setPublishedState(newVal) // optimistic
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}/published`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newVal }),
      })
      if (!res || !res.ok) throw new Error("Failed")
      toast({ title: newVal ? "公開しました" : "下書きに戻しました" })
    } catch {
      setPublishedState(prev)
      toast({ title: "公開ステータスの切替に失敗しました", variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!product?.id) return
    const ok = await confirm({
      title: "商品を削除しますか？",
      description: `「${product.title}」を削除します。この操作は取り消せません。`,
      confirmText: "削除する",
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "削除しました" })
      onDeleted?.()
    } catch {
      toast({ title: "削除に失敗しました", variant: "destructive" })
      setDeleting(false)
    }
  }

  const mainImageFromImages = product.images?.find((img) => img.role === "main") || product.images?.[0]
  const mainImage = product.main_image_key ? ({ key: product.main_image_key } as any) : mainImageFromImages
  const tags = Array.isArray(product.tags) ? product.tags : []

  const thumb = (() => {
    const raw = (mainImage as any)?.key || (mainImage as any)?.basePath || (mainImage as any)?.url || null
    const candidate =
      typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("/"))
        ? raw
        : db.images.getUpload(String(raw)) || String(raw || "")
    const publicBase = getPublicImageUrl(candidate) || candidate || ""
    const resp = responsiveImageForUsage(publicBase || null, "list")
    return {
      src: resp.src || publicBase || "/placeholder.svg?height=176&width=176",
      srcSet: resp.srcSet || undefined,
      sizes: resp.sizes,
    }
  })()

  return (
    <Card
      className={`group gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40 ${
        deleting ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="flex items-stretch">
        {onSelectedChange && (
          <label
            className="flex w-11 shrink-0 cursor-pointer items-center justify-center border-r"
            data-no-drag
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!!selected}
              onChange={(e) => onSelectedChange(e.target.checked)}
              aria-label={`${product.title} を選択`}
              className="h-4 w-4 accent-[var(--primary)]"
            />
          </label>
        )}

        <Link
          href={`/admin/products/edit?id=${product.id}`}
          prefetch={false}
          className="flex min-w-0 flex-1 items-center gap-3 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${product.title} を編集`}
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
            <img
              src={thumb.src}
              srcSet={thumb.srcSet}
              sizes={thumb.sizes}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={publishedState ? "default" : "secondary"}
                className={publishedState ? "" : "text-muted-foreground"}
              >
                {publishedState ? "公開中" : "下書き"}
              </Badge>
              <span className="text-sm text-foreground">
                {typeof product.price === "number" && product.showPrice !== false
                  ? `¥${product.price.toLocaleString()}`
                  : <span className="text-muted-foreground">価格非表示</span>}
              </span>
            </div>

            <h3 className="line-clamp-2 font-medium leading-snug">{product.title}</h3>

            {product.shortDescription && (
              <p className="truncate text-xs text-muted-foreground">{product.shortDescription}</p>
            )}

            {/* Tags are what you filter this list by, so they belong on the row. */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-none text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="px-1 text-[11px] leading-none text-muted-foreground">+{tags.length - 4}</span>
                )}
              </div>
            )}
          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </Link>

        {/* Outside the link: opening the row must not toggle or delete anything. */}
        <div
          className="flex w-14 shrink-0 flex-col items-center justify-between border-l py-3"
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Switch
            checked={publishedState}
            onCheckedChange={(v) => handleTogglePublished(!!v)}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label={`${product.title} の公開状態`}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${product.title} を削除`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
