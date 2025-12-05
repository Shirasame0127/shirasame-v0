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
    } catch (e) {}
    return raw
  }
  return `${pubRoot}/${raw.replace(/^\/+/, "")}`
}

// Cloudflare Image Resizing 前提のURL生成
// 例: /cdn-cgi/image/width=200,format=auto/<public-image-url>
export function buildResizedImageUrl(raw?: string | null, opts?: { width?: number; format?: 'auto' | 'webp' | 'jpeg' }) : string | null {
  const base = getPublicImageUrl(raw)
  if (!base) return null
  const width = Math.max(1, Math.min(4096, opts?.width || 200))
  const format = opts?.format || 'auto'
  // If already a resizing URL, avoid double-wrapping
  if (base.includes('/cdn-cgi/image/')) return base
  return `/cdn-cgi/image/width=${width},format=${format}/${base}`
}
