import { mockProducts, type Product } from "@/lib/mock-data/products"

/**
 * 商品サービス層
 * 現在はモックデータを使用していますが、将来的にデータベース接続に切り替え可能
 */

export class ProductsService {
  /**
   * 全商品を取得
   */
  static async getAll(): Promise<Product[]> {
    // TODO: データベース接続時は以下のようなコードに置き換え
    // const { data } = await supabase.from('products').select('*')
    // return data || []

    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockProducts]), 100)
    })
  }

  /**
   * 公開済み商品のみを取得
   */
  static async getPublished(): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((p) => p.published)
  }

  /**
   * IDで商品を取得
   */
  static async getById(id: string): Promise<Product | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('products').select('*').eq('id', id).single()
    // return data

    const products = await this.getAll()
    return products.find((p) => p.id === id) || null
  }

  /**
   * スラッグで商品を取得
   */
  static async getBySlug(slug: string): Promise<Product | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('products').select('*').eq('slug', slug).single()
    // return data

    const products = await this.getAll()
    return products.find((p) => p.slug === slug) || null
  }

  /**
   * タグで商品を検索
   */
  static async getByTag(tag: string): Promise<Product[]> {
    const products = await this.getPublished()
    return products.filter((p) => p.tags.includes(tag))
  }

  /**
   * 商品を作成
   */
  static async create(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('products').insert(productData).select().single()
    // return data

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProducts.push(newProduct)
    return newProduct
  }

  /**
   * 商品を更新
   */
  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    // TODO: データベース接続時
    // const { data } = await supabase.from('products').update(productData).eq('id', id).select().single()
    // return data

    const index = mockProducts.findIndex((p) => p.id === id)
    if (index === -1) return null

    mockProducts[index] = {
      ...mockProducts[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    }

    return mockProducts[index]
  }

  /**
   * 商品を削除
   */
  static async delete(id: string): Promise<boolean> {
    // TODO: データベース接続時
    // const { error } = await supabase.from('products').delete().eq('id', id)
    // return !error

    const index = mockProducts.findIndex((p) => p.id === id)
    if (index === -1) return false

    mockProducts.splice(index, 1)
    return true
  }
}
