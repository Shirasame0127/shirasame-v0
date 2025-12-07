import { apiFetch } from '@/lib/api-client'

export class RecipesService {
  static async getAll() {
    try {
      const res = await apiFetch('/api/recipes')
      const json = await res.json().catch(() => null)
      return json?.data || []
    } catch (e) {
      return []
    }
  }

  static async getById(id: string) {
    try {
      const res = await apiFetch(`/api/recipes?id=${encodeURIComponent(id)}`)
      const json = await res.json().catch(() => null)
      const d = json?.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  static async create(data: any) {
    const res = await apiFetch('/api/admin/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) return json.data
    throw new Error((json && json.error) || 'Failed to create recipe')
  }

  static async update(id: string, updates: any) {
    const res = await apiFetch(`/api/admin/recipes/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    const json = await res.json().catch(() => null)
    return res.ok ? json?.data : null
  }

  static async delete(id: string) {
    const res = await apiFetch(`/api/admin/recipes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return false
    const json = await res.json().catch(() => null)
    return !!json?.ok
  }
}
