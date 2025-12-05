export class CollectionsService {
  static async getAll() {
    try {
      const res = await fetch('/api/collections')
      const json = await res.json()
      return json.data || []
    } catch (e) {
      return []
    }
  }

  static async getById(id: string) {
    try {
      const res = await fetch(`/api/collections?id=${encodeURIComponent(id)}`)
      const json = await res.json()
      const d = json.data
      if (!d) return null
      return Array.isArray(d) ? d[0] || null : d
    } catch (e) {
      return null
    }
  }

  static async create(data: any) {
    const res = await fetch('/api/admin/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    if (res.ok && json.data) return json.data
    throw new Error(json.error || 'Failed to create collection')
  }

  static async update(id: string, updates: any) {
    const res = await fetch(`/api/admin/collections/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    const json = await res.json()
    return res.ok ? json.data : null
  }

  static async delete(id: string) {
    const res = await fetch(`/api/admin/collections/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return false
    const json = await res.json()
    return !!json.ok
  }
}
