import { db } from "@/lib/db/storage"
import { ProductsService } from "./products.service"
import type { Collection } from "@/lib/db/schema"
import type { Product } from "@/lib/db/schema"

/**
 * コレクションサービス層
 */

export class CollectionsService {
  /**
   * 全コレクションを取得
   */
  static async getAll(): Promise<Collection[]> {
    // Use the client-side cache / API wrapper
    // Prefer to refresh to get fresh server data
    try {
      await db.collections.getAll && db.collections.refresh()
    } catch (e) {
      // ignore — fall back to cache
    }
    return db.collections.getAll()
  }

  /**
   * 公開コレクションのみを取得
   */
  static async getPublic(): Promise<Collection[]> {
    const collections = await this.getAll()
    return collections.filter((c) => c.visibility === "public")
  }

  /**
   * IDでコレクションを取得
   */
  static async getById(id: string): Promise<Collection | null> {
    try {
      // Refresh cache for single collection if available
      await db.collections.refresh()
    } catch (e) {}
    return db.collections.getById(id)
  }

  /**
   * コレクション内の商品を取得
   */
  static async getProductsInCollection(collectionId: string): Promise<Product[]> {
    // TODO: データベース接続時
    // const { data } = await supabase
    //   .from('collection_items')
    //   .select('*, products(*)')
    //   .eq('collection_id', collectionId)
    //   .order('position')

    // Use collectionItems cache to get ordered items
    try {
      await db.collectionItems.getByCollectionId(collectionId)
    } catch (e) {}

    const items = db.collectionItems.getByCollectionId(collectionId) || []
    const productIds = items.map((item: any) => item.productId)
    const allProducts = await ProductsService.getPublished()

    return productIds.map((id) => allProducts.find((p) => p.id === id)).filter((p): p is Product => p !== undefined)
  }

  /**
   * コレクションに商品を追加
   */
  static async addProductToCollection(collectionId: string, productId: string): Promise<CollectionItem> {
    // TODO: データベース接続時
    // const position = await this.getNextPosition(collectionId)
    // const { data } = await supabase.from('collection_items').insert({
    //   collection_id: collectionId,
    //   product_id: productId,
    //   position
    // }).select().single()
    // return data

    // Delegate to shared db collectionItems helper which updates cache and server
    try {
      db.collectionItems.addProduct(collectionId, productId)
    } catch (e) {
      // best-effort — continue
    }
    const items = db.collectionItems.getByCollectionId(collectionId) || []
    // return the last matching item
    const newItem = [...items].reverse().find((i: any) => i.productId === productId) || null
    return newItem
  }

  /**
   * コレクションから商品を削除
   */
  static async removeProductFromCollection(collectionId: string, productId: string): Promise<boolean> {
    // TODO: データベース接続時
    // const { error } = await supabase.from('collection_items')
    //   .delete()
    //   .eq('collection_id', collectionId)
    //   .eq('product_id', productId)
    // return !error

    try {
      db.collectionItems.removeProduct(collectionId, productId)
      return true
    } catch (e) {
      return false
    }
  }
}
