import {
  getPublicImageUrl as sharedGetPublicImageUrl,
  buildResizedImageUrl as sharedBuildResizedImageUrl,
  buildSrcSet as sharedBuildSrcSet,
  responsiveImageForUsage as sharedResponsiveImageForUsage,
  buildR2VariantFromBasePath as sharedBuildR2VariantFromBasePath,
  buildR2VariantFromBasePathWithFormat as sharedBuildR2VariantFromBasePathWithFormat,
  ImageUsage,
} from '../../shared/lib/image-usecases'

export const getPublicImageUrl = sharedGetPublicImageUrl
export const buildResizedImageUrl = sharedBuildResizedImageUrl
export const buildSrcSet = sharedBuildSrcSet
export const responsiveImageForUsage = sharedResponsiveImageForUsage
export type { ImageUsage }
export const buildR2VariantFromBasePath = sharedBuildR2VariantFromBasePath
export const buildR2VariantFromBasePathWithFormat = sharedBuildR2VariantFromBasePathWithFormat
