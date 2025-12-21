import clsx from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

// 画像URLヘルパ: public-worker が提供する URL をそのまま返す（URL-only ポリシー）
export function cdnImage(url: string, _width = 200, _format: 'auto' | 'webp' | 'jpeg' = 'auto'): string {
  if (!url) return ''
  return url
}

