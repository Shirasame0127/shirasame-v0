import type { Env } from './types'

export function getPublicImageUrl(input: string | null | undefined, env: Env): string | null {
  if (!input) return null
  const s = String(input)
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, '')
  if (base) return `${base}/${s.replace(/^\//, '')}`
  return s
}

export function getTransformedListingUrl(origUrl: string | null, env: Env): string | null {
  if (!origUrl) return null
  const base = env.IMAGES_TRANSFORM_BASE?.replace(/\/$/, '/') || ''
  if (!base) return origUrl
  const width = parseInt(env.LIST_IMAGE_WIDTH || '400', 10)
  // Cloudflare Images Transform via URL expects: <base>width=...,quality=...,format=auto/<absolute-source-url>
  try {
    const abs = new URL(origUrl).toString()
    const params = `width=${width},quality=85,format=auto`
    return `${base}${params}/${abs}`
  } catch {
    return origUrl
  }
}
