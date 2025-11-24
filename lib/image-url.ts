export function getPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null

  // Prefer client-exposed env var (Next.js) but allow server-side var too
  const pubRoot = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "")

  // If no pub root configured, return original value unchanged
  if (!pubRoot) return raw

  // If it's already an absolute URL, try to translate common R2/account-hosted
  // URLs to the pub-root. When `NEXT_PUBLIC_R2_PUBLIC_URL` is set we prefer
  // that host so admin previews and public pages always use the pub-domain.
  if (raw.startsWith("http")) {
    if (raw.startsWith(pubRoot)) return raw

    try {
      const url = new URL(raw)
      // Derive a best-effort key/path from the pathname
      let key = url.pathname.replace(/^\/+/, "")

      // Some deployments prefix with 'images/' — strip it
      if (key.startsWith("images/")) key = key.slice("images/".length)

      // If path starts with bucket name, strip known R2_BUCKET env (best-effort)
      const bucket = (process.env.R2_BUCKET || "").replace(/^\/+|\/+$/g, "")
      if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1)

      key = key.replace(/^\/+/, "")

      // If we derived a non-empty key, return the pubRoot-based URL
      if (key) return `${pubRoot}/${key}`
    } catch (e) {
      // fall back to returning raw below
    }

    // As a last resort, return the original absolute URL
    return raw
  }

  // Treat as a key/path (e.g. "uploads/..." or "header-...")
  return `${pubRoot}/${raw.replace(/^\/+/, "")}`
}
