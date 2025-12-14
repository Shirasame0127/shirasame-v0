import {
  getPublicImageUrl as sharedGetPublicImageUrl,
  buildResizedImageUrl as sharedBuildResizedImageUrl,
  buildSrcSet as sharedBuildSrcSet,
  responsiveImageForUsage as sharedResponsiveImageForUsage,
  ImageUsage,
} from '../../shared/lib/image-usecases'

// Prefer configured env var, otherwise fall back to the public images host so
// admin UI generates absolute CDN URLs instead of relative `/cdn-cgi/...` paths
// which break when `NEXT_PUBLIC_IMAGES_DOMAIN` isn't set in dev or CI.
const DEFAULT_IMAGES_DOMAIN = (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_IMAGES_DOMAIN || process.env?.IMAGES_DOMAIN)) || 'https://images.shirasame.com'

export function getPublicImageUrl(raw?: string | null, domainOverride?: string | null) {
  const domain = domainOverride ?? DEFAULT_IMAGES_DOMAIN
  return sharedGetPublicImageUrl(raw, domain)
}

export function buildResizedImageUrl(raw?: string | null, opts?: { width?: number; format?: 'auto' | 'webp' | 'jpeg'; quality?: number }, domainOverride?: string | null) {
  const domain = domainOverride ?? DEFAULT_IMAGES_DOMAIN
  return sharedBuildResizedImageUrl(raw, opts, domain)
}

export function buildSrcSet(raw?: string | null, widths: number[] = [200, 400], format: 'auto' | 'webp' | 'jpeg' = 'auto', quality = undefined as any, domainOverride?: string | null) {
  const domain = domainOverride ?? DEFAULT_IMAGES_DOMAIN
  return sharedBuildSrcSet(raw, widths, format as any, quality as any, domain)
}

export function responsiveImageForUsage(raw?: string | null, usage: ImageUsage = 'list', domainOverride?: string | null) {
  const domain = domainOverride ?? DEFAULT_IMAGES_DOMAIN
  // Respect the requested usage so admin UI can request resized
  // variants (via Cloudflare Image Resizing) when appropriate.
  return sharedResponsiveImageForUsage(raw, usage, domain)
}

export type { ImageUsage }
