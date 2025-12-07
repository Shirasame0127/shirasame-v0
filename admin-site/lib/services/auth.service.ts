import { apiFetch } from '@/lib/api-client'

export class AuthService {
  static async getCurrentUser() {
    try {
      const res = await apiFetch('/api/profile')
      if (!res.ok) return null
      const json = await res.json().catch(() => null)
      return json?.data || null
    } catch (e) {
      return null
    }
  }
}
