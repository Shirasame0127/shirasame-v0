import type { Product } from '@/lib/db/schema'

import { apiFetch } from '@/lib/api-client'

export class ProductsService {
  static async getAll(): Promise<Product[]> {
    try {
      const res = await apiFetch('/api/products')
      const json = await res.json().catch(() => null)
      return json?.data || []
    } catch (e) {
      return []
    }
  }

  static async getPublished(): Promise<Product[]> {
    try {
      const res = await apiFetch('/api/products?published=true&shallow=true')
      const json = await res.json().catch(() => null)
      return json?.data || []
    } catch (e) {
      return []
    }
  }

  static async getById(id: string): Promise<Product | null> {
    try {
      const res = await apiFetch(`/api/products?id=${encodeURIComponent(id)}`)
      const json = await res.json().catch(() => null)
      const d = json?.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  static async getBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await apiFetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      const json = await res.json().catch(() => null)
      const d = json?.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  static async getByTag(tag: string): Promise<Product[]> {
    try {
      const res = await apiFetch(`/api/products?tag=${encodeURIComponent(tag)}`)
      const json = await res.json().catch(() => null)
      return json?.data || []
    } catch (e) {
      return []
    }
  }

  static async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const res = await apiFetch(`/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) return json.data
    throw new Error((json && json.error) || 'Failed to create product')
  }

  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const res = await apiFetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) return json.data
    return null
  }

  static async delete(id: string): Promise<boolean> {
    const res = await apiFetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return false
    const json = await res.json().catch(() => null)
    return !!json?.ok
  }
}
