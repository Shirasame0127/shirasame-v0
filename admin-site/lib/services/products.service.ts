import type { Product } from '@/lib/db/schema'

export class ProductsService {
  static async getAll(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products')
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  static async getPublished(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products?published=true&shallow=true')
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

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

  static async getByTag(tag: string): Promise<Product[]> {
    try {
      const res = await fetch(`/api/products?tag=${encodeURIComponent(tag)}`)
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  static async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const res = await fetch(`/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })
    const json = await res.json()
    if (res.ok && json.data) return json.data
    throw new Error(json.error || 'Failed to create product')
  }

  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })
    const json = await res.json()
    if (res.ok && json.data) return json.data
    return null
  }

  static async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return false
    const json = await res.json()
    return !!json.ok
  }
}
