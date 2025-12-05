import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 画像URLヘルパ: Resizing付きURLへの変換（CASE A）
export function cdnImage(url: string, width = 200, format: 'auto' | 'webp' | 'jpeg' = 'auto'): string {
  const w = Math.max(1, Math.min(4096, width))
  if (!url) return ''
  if (url.includes('/cdn-cgi/image/')) return url
  return `/cdn-cgi/image/width=${w},format=${format}/${url}`
}
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
