import {
  mockRecipes,
  mockAnnotations,
  mockRecipeImages,
  type Recipe,
  type Annotation,
  type RecipeImage,
} from "@/lib/mock-data/recipes"

/**
 * レシピサービス層
 */

export class RecipesService {
  /**
   * 全レシピを取得
   */
  static async getAll(): Promise<Recipe[]> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipes').select('*')
    // return data || []

    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRecipes]), 100)
    })
  }

  /**
   * IDでレシピを取得
   */
  static async getById(id: string): Promise<Recipe | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipes').select('*').eq('id', id).single()
    // return data

    const recipes = await this.getAll()
    return recipes.find((r) => r.id === id) || null
  }

  /**
   * レシピの画像を取得
   */
  static async getRecipeImage(imageId: string): Promise<RecipeImage | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipe_images').select('*').eq('id', imageId).single()
    // return data

    return mockRecipeImages.find((img) => img.id === imageId) || null
  }

  /**
   * レシピの注釈を取得
   */
  static async getAnnotations(recipeId: string): Promise<Annotation[]> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').select('*').eq('recipe_id', recipeId)
    // return data || []

    return mockAnnotations.filter((ann) => ann.recipeId === recipeId)
  }

  /**
   * レシピを作成
   */
  static async create(recipeData: Omit<Recipe, "id" | "createdAt">): Promise<Recipe> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipes').insert(recipeData).select().single()
    // return data

    const newRecipe: Recipe = {
      ...recipeData,
      id: `recipe-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    mockRecipes.push(newRecipe)
    return newRecipe
  }

  /**
   * 注釈を作成
   */
  static async createAnnotation(annotationData: Omit<Annotation, "id">): Promise<Annotation> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').insert(annotationData).select().single()
    // return data

    const newAnnotation: Annotation = {
      ...annotationData,
      id: `ann-${Date.now()}`,
    }

    mockAnnotations.push(newAnnotation)
    return newAnnotation
  }

  /**
   * 注釈を更新
   */
  static async updateAnnotation(id: string, annotationData: Partial<Annotation>): Promise<Annotation | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').update(annotationData).eq('id', id).select().single()
    // return data

    const index = mockAnnotations.findIndex((ann) => ann.id === id)
    if (index === -1) return null

    mockAnnotations[index] = {
      ...mockAnnotations[index],
      ...annotationData,
    }

    return mockAnnotations[index]
  }

  /**
   * 注釈を削除
   */
  static async deleteAnnotation(id: string): Promise<boolean> {
    // TODO: データベース接続時
    // const { error } = await supabase.from('annotations').delete().eq('id', id)
    // return !error

    const index = mockAnnotations.findIndex((ann) => ann.id === id)
    if (index === -1) return false

    mockAnnotations.splice(index, 1)
    return true
  }
}
