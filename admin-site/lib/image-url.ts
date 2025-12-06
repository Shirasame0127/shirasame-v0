import {
  getPublicImageUrl as sharedGetPublicImageUrl,
  buildResizedImageUrl as sharedBuildResizedImageUrl,
  buildSrcSet as sharedBuildSrcSet,
  responsiveImageForUsage as sharedResponsiveImageForUsage,
  ImageUsage,
} from '../../shared/lib/image-usecases'

export const getPublicImageUrl = sharedGetPublicImageUrl
export const buildResizedImageUrl = sharedBuildResizedImageUrl
export const buildSrcSet = sharedBuildSrcSet
export const responsiveImageForUsage = sharedResponsiveImageForUsage
export type { ImageUsage }
