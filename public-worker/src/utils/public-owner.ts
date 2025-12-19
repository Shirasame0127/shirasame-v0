export function getPublicOwnerUserId(env: any): string | null {
  try {
    const v = (env && env.PUBLIC_OWNER_USER_ID) ? String(env.PUBLIC_OWNER_USER_ID).trim() : ''
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}
