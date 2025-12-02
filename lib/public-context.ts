import { getOwnerUserId } from '@/lib/owner'

export type PublicContext = {
  isPublicRequest: boolean
  ownerUserId: string | null
}

export async function resolvePublicContext(req: Request): Promise<PublicContext> {
  const url = new URL(req.url)
  const cookieHeader = req.headers.get('cookie') || ''
  const hasAccessCookie = cookieHeader.includes('sb-access-token')
  const PUBLIC_HOST = process.env.PUBLIC_HOST || process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
  const isHostPublic = PUBLIC_HOST ? url.hostname === PUBLIC_HOST : false
  const isPublicRequest = !hasAccessCookie || isHostPublic || (url.searchParams.get('published') === 'true')

  let ownerUserId: string | null = null
  if (isPublicRequest) {
    try {
      ownerUserId = await getOwnerUserId()
    } catch {
      ownerUserId = null
    }
  }

  return { isPublicRequest, ownerUserId }
}
