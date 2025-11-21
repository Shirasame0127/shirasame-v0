import type { Recipe as SchemaRecipe } from "@/lib/db/schema"

export type Recipe = SchemaRecipe

export interface AnnotationStyle {
  // 点のスタイル
  pinSize?: number
  pinColor?: string
  pinShape?: "circle" | "square" | "triangle"

  // 線のスタイル
  lineWidth?: number
  lineColor?: string
  lineStyle?: "solid" | "dashed" | "dotted"
  arrowEnd?: boolean

  // テキストのスタイル
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textColor?: string
  backgroundColor?: string
  fontFamily?: string
}

export interface RecipeItem {
  id: string
  recipeId: string
  linkedProductId: string
  // 点の位置
  pinXPct: number
  pinYPct: number
  // テキストの位置（自動計算可能）
  textXPct: number
  textYPct: number
  // 個別スタイル
  style?: AnnotationStyle
}

export type RecipeImage = any

export type CustomFont = any

export const mockRecipes: Recipe[] = [
  {
    id: "recipe-1",
    userId: "user-shirasame",
    title: "私のデスクセットアップ 2025",
    baseImageId: "recipe-img-1",
    imageDataUrl: "",
    imageWidth: 1920,
    imageHeight: 1080,
    aspectRatio: "16:9",
    pins: [],
    createdAt: "2025-01-10T12:00:00Z",
    updatedAt: "2025-01-10T12:00:00Z",
    published: false,
  },
  {
    id: "recipe-2",
    userId: "user-shirasame",
    title: "ゲーミング＆作業用デスク",
    baseImageId: "recipe-img-2",
    imageDataUrl: "",
    imageWidth: 1920,
    imageHeight: 1080,
    aspectRatio: "16:9",
    pins: [],
    createdAt: "2025-01-08T15:30:00Z",
    updatedAt: "2025-01-08T15:30:00Z",
    published: false,
  },
]

export const mockRecipeItems: RecipeItem[] = [
  {
    id: "item-1",
    recipeId: "recipe-1",
    linkedProductId: "prod-2",
    pinXPct: 25,
    pinYPct: 45,
    textXPct: 25,
    textYPct: 30,
  },
  {
    id: "item-2",
    recipeId: "recipe-1",
    linkedProductId: "prod-1",
    pinXPct: 60,
    pinYPct: 50,
    textXPct: 60,
    textYPct: 35,
  },
  {
    id: "item-3",
    recipeId: "recipe-1",
    linkedProductId: "prod-3",
    pinXPct: 50,
    pinYPct: 15,
    textXPct: 50,
    textYPct: 5,
  },
  {
    id: "item-4",
    recipeId: "recipe-1",
    linkedProductId: "prod-5",
    pinXPct: 75,
    pinYPct: 60,
    textXPct: 75,
    textYPct: 75,
  },
  {
    id: "item-5",
    recipeId: "recipe-2",
    linkedProductId: "prod-4",
    pinXPct: 40,
    pinYPct: 55,
    textXPct: 40,
    textYPct: 70,
  },
  {
    id: "item-6",
    recipeId: "recipe-2",
    linkedProductId: "prod-6",
    pinXPct: 65,
    pinYPct: 40,
    textXPct: 65,
    textYPct: 25,
  },
  {
    id: "item-7",
    recipeId: "recipe-2",
    linkedProductId: "prod-1",
    pinXPct: 30,
    pinYPct: 35,
    textXPct: 30,
    textYPct: 20,
  },
]

export const mockRecipeImages: RecipeImage[] = [
  {
    id: "recipe-img-1",
    recipeId: "recipe-1",
    url: "/minimalist-desk-setup-with-keyboard-and-monitor.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "recipe-img-2",
    recipeId: "recipe-2",
    url: "/gaming-desk-setup-with-rgb-lights.jpg",
    width: 1920,
    height: 1080,
  },
]

export const defaultAnnotationStyles: Record<string, AnnotationStyle> = {
  "recipe-1": {
    pinSize: 12,
    pinColor: "#3b82f6",
    pinShape: "circle",
    lineWidth: 3,
    lineColor: "#3b82f6",
    lineStyle: "solid",
    arrowEnd: true,
    fontSize: 18,
    fontWeight: "bold",
    textColor: "#ffffff",
    backgroundColor: "#3b82f6",
    fontFamily: "sans-serif",
  },
  "recipe-2": {
    pinSize: 12,
    pinColor: "#8b5cf6",
    pinShape: "circle",
    lineWidth: 3,
    lineColor: "#8b5cf6",
    lineStyle: "solid",
    arrowEnd: true,
    fontSize: 18,
    fontWeight: "bold",
    textColor: "#ffffff",
    backgroundColor: "#8b5cf6",
    fontFamily: "sans-serif",
  },
}

export const mockCustomFonts: CustomFont[] = [
  {
    id: "font-1",
    name: "Noto Sans JP",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap",
    addedAt: "2025-01-01T00:00:00Z",
  },
]

// 後方互換性のための型エクスポート
export interface Annotation {
  id: string
  recipeId: string
  type: "pin" | "line" | "text"
  xPct: number
  yPct: number
  x2Pct?: number
  y2Pct?: number
  label: string
  linkedProductId?: string
  style?: AnnotationStyle
}

export const mockAnnotations: Annotation[] = []
