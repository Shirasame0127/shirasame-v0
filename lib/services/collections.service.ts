import { mockCollections, mockCollectionItems, type Collection, type CollectionItem } from "@/lib/mock-data/collections"
import { ProductsService } from "./products.service"
import type { Product } from "@/lib/mock-data/products"

/**
 * コレクションサービス層
 */

export class CollectionsService {
  /**
   * 全コレクションを取得
   */
  static async getAll(): Promise<Collection[]> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('collections').select('*')
    // return data || []

    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCollections]), 100)
    })
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
    const collections = await this.getAll()
    return collections.find((c) => c.id === id) || null
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

    const items = mockCollectionItems
      .filter((item) => item.collectionId === collectionId)
      .sort((a, b) => a.position - b.position)

    const productIds = items.map((item) => item.productId)
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

    const items = mockCollectionItems.filter((item) => item.collectionId === collectionId)
    const position = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 1

    const newItem: CollectionItem = {
      id: `ci-${Date.now()}`,
      collectionId,
      productId,
      position,
      addedAt: new Date().toISOString(),
    }

    mockCollectionItems.push(newItem)
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

    const index = mockCollectionItems.findIndex(
      (item) => item.collectionId === collectionId && item.productId === productId,
    )

    if (index === -1) return false

    mockCollectionItems.splice(index, 1)
    return true
  }
}
