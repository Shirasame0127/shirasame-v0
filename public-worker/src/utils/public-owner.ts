export function getPublicOwnerUserId(env: any): string | null {
  try {
    if (!env || env.PUBLIC_OWNER_USER_ID == null) return null
    let v = String(env.PUBLIC_OWNER_USER_ID)
    // Trim whitespace and newlines
    v = v.trim()
    // Remove surrounding single/double quotes if present
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).trim()
    }
    return v.length > 0 ? v : null
  } catch {
    return null
  }
}
