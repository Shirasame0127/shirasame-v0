export function normalizePublicUrl(raw?: string | null): string | null {
  if (!raw) return null
  try {
    // Prefer URL parser to handle weird cases, but fall back to string split
    const u = new URL(raw)
    u.search = ''
    u.hash = ''
    return u.toString()
  } catch (e) {
    // Fallback: strip after ? or #
    const s = raw.split(/[?#]/)[0]
    return s || null
  }
}
