import { create } from 'zustand'

// ピンの型定義
export type RecipePin = {
  id: string
  productId: string
  dotXPercent: number
  dotYPercent: number
  dotSize: number
  dotColor: string
  dotShape: 'circle' | 'square' | 'triangle' | 'diamond'
  tagXPercent: number
  tagYPercent: number
  tagText: string
  tagFontSize: number
  tagFontFamily: string
  tagFontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700'
  tagTextColor: string
  tagTextShadow: string
  tagBackgroundColor: string
  tagBackgroundOpacity: number
  tagBorderWidth: number
  tagBorderColor: string
  tagBorderRadius: number
  tagShadow: string
  tagPaddingX: number
  tagPaddingY: number
  lineType: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'hand-drawn'
  lineWidth: number
  lineColor: string
}

// レシピ表示の状態管理ストア
type RecipeDisplayStore = {
  // レシピ画像のスケール情報
  imageScale: Map<string, number>  // recipeId -> scale
  setImageScale: (recipeId: string, scale: number) => void
  getImageScale: (recipeId: string) => number
}

export const useRecipeDisplayStore = create<RecipeDisplayStore>((set, get) => ({
  imageScale: new Map(),
  
  setImageScale: (recipeId: string, scale: number) => {
    set(state => {
      const newMap = new Map(state.imageScale)
      newMap.set(recipeId, scale)
      return { imageScale: newMap }
    })
  },
  
  getImageScale: (recipeId: string) => {
    const scale = get().imageScale.get(recipeId)
    return scale && isFinite(scale) && scale > 0 ? scale : 1
  },
}))
