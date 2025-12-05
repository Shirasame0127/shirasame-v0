export class AuthService {
  static async getCurrentUser() {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      const json = await res.json()
      return json.data || null
    } catch (e) {
      return null
    }
  }
}
