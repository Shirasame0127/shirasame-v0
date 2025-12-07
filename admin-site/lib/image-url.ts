import {
  getPublicImageUrl as sharedGetPublicImageUrl,
  buildResizedImageUrl as sharedBuildResizedImageUrl,
  buildSrcSet as sharedBuildSrcSet,
  responsiveImageForUsage as sharedResponsiveImageForUsage,
  ImageUsage,
} from '../../shared/lib/image-usecases'

const DEFAULT_IMAGES_DOMAIN = (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_IMAGES_DOMAIN || 'https://images.shirasame.com')) || 'https://images.shirasame.com'

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
  return sharedResponsiveImageForUsage(raw, usage, domain)
}

export type { ImageUsage }
