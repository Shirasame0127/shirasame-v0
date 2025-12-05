export function getPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null
  if (raw.startsWith('data:')) return raw
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
  if (!pubRoot) return raw
  if (raw.startsWith("http")) {
    if (raw.startsWith(pubRoot)) {
      try {
        const u = new URL(raw)
        return `${u.protocol}//${u.hostname}` + (u.port ? `:${u.port}` : '') + (u.pathname || '')
      } catch {
        return raw.split(/[?#]/)[0]
      }
    }
    try {
      const url = new URL(raw)
      let key = url.pathname.replace(/^\/+/, "")
      if (key.startsWith("images/")) key = key.slice("images/".length)
      const bucket = (process.env.R2_BUCKET || "").replace(/^\/+|\/+$/g, "")
      if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
      key = key.replace(/^\/+/, "")
      if (key) return `${pubRoot}/${key}`
    } catch {}
    return raw
  }
  return `${pubRoot}/${raw.replace(/^\/+/, "")}`
}

export function buildR2VariantFromBasePath(basePath?: string | null, variant?: 'thumb-400' | 'detail-800'): string | null {
  if (!basePath) return null
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
  if (!pubRoot) return null
  const bp = basePath.replace(/^\/+|\/+$/g, "")
  const file = variant === 'thumb-400' ? 'thumb-400.jpg' : 'detail-800.jpg'
  return `${pubRoot}/${bp}/${file}`
}

export function buildR2VariantFromBasePathWithFormat(
  basePath?: string | null,
  variant?: 'thumb-400' | 'detail-800',
  format?: 'jpg' | 'webp'
): string | null {
  if (!basePath) return null
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
  if (!pubRoot) return null
  const bp = basePath.replace(/^\/+|\/+$/g, "")
  const fileBase = variant === 'thumb-400' ? 'thumb-400' : 'detail-800'
  const ext = format === 'webp' ? 'webp' : 'jpg'
  return `${pubRoot}/${bp}/${fileBase}.${ext}`
}

// Cloudflare Image Resizing 前提のURL生成（CASE A準拠）
export function buildResizedImageUrl(raw?: string | null, opts?: { width?: number; format?: 'auto' | 'webp' | 'jpeg'; quality?: number }) : string | null {
  const base = getPublicImageUrl(raw)
  if (!base) return null
  const width = Math.max(1, Math.min(4096, opts?.width || 200))
  const format = opts?.format || 'auto'
  const quality = typeof opts?.quality === 'number' ? Math.max(1, Math.min(100, Math.round(opts!.quality))) : 75
  if (base.includes('/cdn-cgi/image/')) return base
  try {
    const u = new URL(base)
    const origin = `${u.protocol}//${u.hostname}` + (u.port ? `:${u.port}` : '')
    // intentionally exclude search and hash to keep a canonical base path
    const path = u.pathname.replace(/^\/+/, '')
    return `${origin}/cdn-cgi/image/width=${width},format=${format},quality=${quality}/${path}`
  } catch (e) {
    return `/cdn-cgi/image/width=${width},format=${format},quality=${quality}/${base}`
  }
}

export type ImageUsage =
  | 'header-large'
  | 'list'
  | 'detail'
  | 'attachment'
  | 'gallery'
  | 'recipe'
  | 'avatar'
  | 'original'

export function buildSrcSet(raw?: string | null, widths: number[] = [200, 400], format: 'auto' | 'webp' | 'jpeg' = 'auto', quality = 75) {
  if (!raw) return { src: null, srcSet: null, sizes: undefined }
  // Allowed representative widths to limit unique Cloudflare transforms
  const ALLOWED = [200, 400, 800]
  // Map requested widths to nearest allowed width to avoid accidental new transforms
  const snapToAllowed = (w: number) => {
    const clamped = Math.max(1, Math.min(4096, w))
    if (clamped <= 200) return 200
    if (clamped <= 400) return 400
    return 800
  }
  const unique = Array.from(new Set(widths.map(w => snapToAllowed(w)))).sort((a,b) => a-b)
  const srcSet = unique.map(w => {
    const url = buildResizedImageUrl(raw, { width: w, format, quality })
    return url ? `${url} ${w}w` : undefined
  }).filter(Boolean).join(', ')
  const src = buildResizedImageUrl(raw, { width: unique[unique.length-1], format, quality })
  return { src, srcSet: srcSet || null, sizes: undefined }
}

export function responsiveImageForUsage(raw?: string | null, usage: ImageUsage = 'list') {
  if (!raw) return { src: null, srcSet: null, sizes: undefined }
  // use a single quality default to avoid creating extra unique transforms
  const Q = 75
  switch (usage) {
    case 'header-large':
      return buildSrcSet(raw, [800], 'auto', Q)
    case 'list':
      return buildSrcSet(raw, [200, 400], 'auto', Q)
    case 'detail':
      return buildSrcSet(raw, [400], 'auto', Q)
    case 'attachment':
      return buildSrcSet(raw, [200, 400], 'auto', Q)
    case 'gallery':
      return buildSrcSet(raw, [200, 400], 'auto', Q)
    case 'recipe':
      return buildSrcSet(raw, [400, 800], 'auto', Q)
    case 'avatar':
      return buildSrcSet(raw, [200], 'auto', Q)
    case 'original':
    default:
      return { src: getPublicImageUrl(raw), srcSet: null, sizes: undefined }
  }
}
