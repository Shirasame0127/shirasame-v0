export interface Bindings {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  PUBLIC_PROFILE_EMAIL?: string
  PUBLIC_HOST?: string
  NEXT_PUBLIC_PUBLIC_HOST?: string
  R2_PUBLIC_URL?: string
  IMAGES_TRANSFORM_BASE?: string
  LIST_IMAGE_WIDTH?: string
}

export type Env = Bindings
