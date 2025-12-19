// Minimal auth helpers to satisfy build; public routes remain unauthenticated.
// These are lightweight stubs — do not rely on these for secure admin flows.
export async function getTokenFromRequest(c: any): Promise<string | null> {
  try {
    const auth = c.req.header('Authorization') || c.req.header('authorization') || ''
    if (!auth) return null
    const m = (auth as string).match(/^Bearer\s+(.+)$/i)
    return m ? m[1] : null
  } catch { return null }
}

export async function verifyTokenWithSupabase(token: string, c: any): Promise<string | null> {
  // Minimal stub: return null (not verified). Admin flows should use real implementation.
  return null
}

export async function parseJwtPayload(token: string): Promise<any | null> {
  try { return null } catch { return null }
}

export async function fetchUserFromToken(token: string, env: any): Promise<any | null> {
  return null
}

export async function getUserFromRequest(c: any): Promise<any | null> {
  return null
}

export async function getRequestUserId(c: any): Promise<string | null> {
  return null
}

export async function resolveRequestUserContext(c: any): Promise<{ trusted: boolean; userId?: string | null }> {
  return { trusted: false }
}

export default { getTokenFromRequest, verifyTokenWithSupabase, resolveRequestUserContext }
