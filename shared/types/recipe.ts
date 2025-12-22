export interface PublicRecipeImage {
  key: string
  url: string
  width: number
  height: number
}

export interface PublicRecipePin {
  id: string
  product_id: string
  dot_x_percent: number
  dot_y_percent: number
  dot_size_percent: number
  tag_text: string | null
}

export type { PublicRecipeImage as RecipeImage, PublicRecipePin as RecipePin }
