import type { Product } from "@/lib/db/schema"

/**
 * 商品サービス層
 * 現在はモックデータを使用していますが、将来的にデータベース接続に切り替え可能
 */

export class ProductsService {
  /**
   * 全商品を取得
   */
  static async getAll(): Promise<Product[]> {
    try {
      const res = await fetch("/api/products")
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  /**
   * 公開済み商品のみを取得
   */
  static async getPublished(): Promise<Product[]> {
    try {
      const res = await fetch("/api/products?published=true")
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  /**
   * IDで商品を取得
   */
  static async getById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`)
      const json = await res.json()
      const d = json.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  /**
   * スラッグで商品を取得
   */
  static async getBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      const json = await res.json()
      const d = json.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  /**
   * タグで商品を検索
   */
  static async getByTag(tag: string): Promise<Product[]> {
    try {
      const res = await fetch(`/api/products?tag=${encodeURIComponent(tag)}`)
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  /**
   * 商品を作成
   */
  static async create(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const res = await fetch(`/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    const json = await res.json()
    if (res.ok && json.data) return json.data
    throw new Error(json.error || "Failed to create product")
  }

  /**
   * 商品を更新
   */
  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    const json = await res.json()
    if (res.ok && json.data) return json.data
    return null
  }

  /**
   * 商品を削除
   */
  static async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" })
    if (!res.ok) return false
    const json = await res.json()
    return !!json.ok
  }
}
