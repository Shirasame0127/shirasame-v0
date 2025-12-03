export function getPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null
  if (raw.startsWith('data:')) return raw
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")
  if (!pubRoot) return raw
  if (raw.startsWith("http")) {
    if (raw.startsWith(pubRoot)) return raw
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
