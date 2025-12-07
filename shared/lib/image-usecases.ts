export const ALLOWED_WIDTHS = [200, 400, 800] as const
export const DEFAULT_QUALITY = 75

export type AllowedWidth = typeof ALLOWED_WIDTHS[number]

export type ImageUsage =
  | 'header-large'
  | 'list'
  | 'detail'
  | 'attachment'
  | 'gallery'
  | 'recipe'
  | 'avatar'
  | 'original'

export function snapToAllowed(w: number): AllowedWidth {
  const clamped = Math.max(1, Math.min(4096, Math.round(w)))
  if (clamped <= 200) return 200
  if (clamped <= 400) return 400
  return 800
}

export function usageToWidths(u: ImageUsage): number[] {
  switch (u) {
    case 'header-large':
      return [800]
    case 'list':
      return [200, 400]
    case 'detail':
      return [400]
    case 'attachment':
      return [200, 400]
    case 'gallery':
      return [200, 400]
    case 'recipe':
      return [400, 800]
    case 'avatar':
      return [200]
    case 'original':
    default:
      return []
  }
}

function getEnvImagesDomain(fallback?: string): string | null {
  try {
    // prefer explicit IMAGES_DOMAIN (used in workers), otherwise NEXT_PUBLIC_IMAGES_DOMAIN
    const d = (typeof process !== 'undefined' && (process.env?.IMAGES_DOMAIN || process.env?.NEXT_PUBLIC_IMAGES_DOMAIN)) || fallback
    if (!d) return null
    return String(d).replace(/\/$/, '')
  } catch {
    return fallback || null
  }
}

export function getPublicImageUrl(raw?: string | null, domainOverride?: string | null): string | null {
  if (!raw) return null
  if ((raw as any).startsWith && (raw as any).startsWith('data:')) return raw
  const imagesRoot = (domainOverride || getEnvImagesDomain() || '').replace(/\/$/, '')
  if (!imagesRoot) return raw
  if (raw.startsWith('http')) {
    if (raw.startsWith(imagesRoot)) {
      try {
        const u = new URL(raw)
        return `${u.protocol}//${u.hostname}` + (u.port ? `:${u.port}` : '') + (u.pathname || '')
      } catch {
        return raw.split(/[?#]/)[0]
      }
    }
    try {
      const url = new URL(raw)
      let key = url.pathname.replace(/^\/+/, '')
      if (key.startsWith('images/')) key = key.slice('images/'.length)
      const bucket = (typeof process !== 'undefined' ? (process.env?.R2_BUCKET || '') : '') as string
      if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)
      key = key.replace(/^\/+/, '')
      // Normalize duplicated uploads prefix like "uploads/uploads/..." => "uploads/..."
      key = key.replace(/(^|\/)uploads\/+uploads\//, '$1uploads/')
      // Collapse multiple slashes
      key = key.replace(/\/+/g, '/')
      if (key) return `${imagesRoot}/${key}`
    } catch {}
    return raw
  }
  // Normalize raw key strings (remove leading slashes, collapse duplicate segments)
  let k = String(raw).replace(/^\/+/, '')
  k = k.replace(/(^|\/)uploads\/+uploads\//, '$1uploads/')
  k = k.replace(/\/+/g, '/')
  return `${imagesRoot}/${k}`
}

export function buildResizedImageUrl(raw?: string | null, opts?: { width?: number; format?: 'auto' | 'webp' | 'jpeg'; quality?: number }, domainOverride?: string | null): string | null {
  const base = getPublicImageUrl(raw, domainOverride)
  if (!base) return null
  const width = Math.max(1, Math.min(4096, opts?.width || 200))
  const format = opts?.format || 'auto'
  const quality = typeof opts?.quality === 'number' ? Math.max(1, Math.min(100, Math.round(opts!.quality))) : DEFAULT_QUALITY
  if (base.includes('/cdn-cgi/image/')) return base
  try {
    const u = new URL(base)
    const origin = `${u.protocol}//${u.hostname}` + (u.port ? `:${u.port}` : '')
    const path = u.pathname.replace(/^\/+/, '')
    return `${origin}/cdn-cgi/image/width=${width},format=${format},quality=${quality}/${path}`
  } catch (e) {
    return `/cdn-cgi/image/width=${width},format=${format},quality=${quality}/${base}`
  }
}

export function buildSrcSet(raw?: string | null, widths: number[] = [200, 400], format: 'auto' | 'webp' | 'jpeg' = 'auto', quality = DEFAULT_QUALITY, domainOverride?: string | null) {
  if (!raw) return { src: null, srcSet: null, sizes: undefined }
  const unique = Array.from(new Set(widths.map(w => snapToAllowed(w)))).sort((a,b) => a-b)
  const srcSet = unique.map(w => {
    const url = buildResizedImageUrl(raw, { width: w, format, quality }, domainOverride)
    return url ? `${url} ${w}w` : undefined
  }).filter(Boolean).join(', ')
  const src = buildResizedImageUrl(raw, { width: unique[unique.length-1], format, quality }, domainOverride)
  return { src, srcSet: srcSet || null, sizes: undefined }
}

export function responsiveImageForUsage(raw?: string | null, usage: ImageUsage = 'list', domainOverride?: string | null) {
  if (!raw) return { src: null, srcSet: null, sizes: undefined }
  const Q = DEFAULT_QUALITY
  const widths = usageToWidths(usage)
  if (usage === 'original' || widths.length === 0) return { src: getPublicImageUrl(raw, domainOverride), srcSet: null, sizes: undefined }
  return buildSrcSet(raw, widths, 'auto', Q, domainOverride)
}

// Deprecated compatibility helpers (maintain old public-site API names)
export function buildR2VariantFromBasePath(basePath?: string | null, variant?: 'thumb-400' | 'detail-800') {
  if (!basePath) return null
  const width = variant === 'thumb-400' ? 400 : 800
  return buildResizedImageUrl(basePath, { width, format: 'auto', quality: DEFAULT_QUALITY })
}

export function buildR2VariantFromBasePathWithFormat(basePath?: string | null, variant?: 'thumb-400' | 'detail-800', format?: 'jpg' | 'webp') {
  if (!basePath) return null
  const width = variant === 'thumb-400' ? 400 : 800
  const fmt = format === 'webp' ? 'webp' : (format === 'jpg' ? 'jpeg' : 'auto')
  return buildResizedImageUrl(basePath, { width, format: fmt as 'auto' | 'webp' | 'jpeg', quality: DEFAULT_QUALITY })
}
