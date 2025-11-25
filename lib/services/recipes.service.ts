import { db } from "@/lib/db/storage"
import type { Recipe } from "@/lib/db/schema"

type Annotation = any
type RecipeImage = any

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

    try {
      await db.recipes.refresh()
    } catch (e) {}
    return db.recipes.getAll()
  }

  /**
   * IDでレシピを取得
   */
  static async getById(id: string): Promise<Recipe | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipes').select('*').eq('id', id).single()
    // return data

    try {
      await db.recipes.refresh()
    } catch (e) {}
    return db.recipes.getById(id)
  }

  /**
   * レシピの画像を取得
   */
  static async getRecipeImage(imageId: string): Promise<RecipeImage | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipe_images').select('*').eq('id', imageId).single()
    // return data

    try {
      return db.recipeImages.getByRecipeId(imageId)
    } catch (e) {
      return null
    }
  }

  /**
   * レシピの注釈を取得
   */
  static async getAnnotations(recipeId: string): Promise<Annotation[]> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').select('*').eq('recipe_id', recipeId)
    // return data || []

    try {
      return db.recipeItems.getByRecipeId(recipeId)
    } catch (e) {
      return []
    }
  }

  /**
   * レシピを作成
   */
  static async create(recipeData: Omit<Recipe, "id" | "createdAt">): Promise<Recipe> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('recipes').insert(recipeData).select().single()
    // return data

    // Delegate to client-side db layer which will persist to server best-effort
    const created = db.recipes.create({ ...(recipeData as any) })
    return created
  }

  /**
   * 注釈を作成
   */
  static async createAnnotation(annotationData: Omit<Annotation, "id">): Promise<Annotation> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').insert(annotationData).select().single()
    // return data

    const created = db.recipeItems.create(annotationData as any)
    return created
  }

  /**
   * 注釈を更新
   */
  static async updateAnnotation(id: string, annotationData: Partial<Annotation>): Promise<Annotation | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('annotations').update(annotationData).eq('id', id).select().single()
    // return data

    try {
      db.recipeItems.update(id, annotationData as any)
      const items = db.recipeItems.getByRecipeId((annotationData as any).recipeId || "")
      return items ? items.find((i: any) => i.id === id) : null
    } catch (e) {
      return null
    }
  }

  /**
   * 注釈を削除
   */
  static async deleteAnnotation(id: string): Promise<boolean> {
    // TODO: データベース接続時
    // const { error } = await supabase.from('annotations').delete().eq('id', id)
    // return !error

    try {
      db.recipeItems.delete(id)
      return true
    } catch (e) {
      return false
    }
  }
}
