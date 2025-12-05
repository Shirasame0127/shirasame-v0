import clsx from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

// 画像URLヘルパ: Resizing付きURLへの変換（CASE A）
import { buildResizedImageUrl } from './image-url'

export function cdnImage(url: string, width = 200, format: 'auto' | 'webp' | 'jpeg' = 'auto'): string {
  const w = Math.max(1, Math.min(4096, width))
  if (!url) return ''
  const out = buildResizedImageUrl(url, { width: w, format, quality: 75 })
  return out || ''
}

