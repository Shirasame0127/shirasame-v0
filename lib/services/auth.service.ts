import type { User } from "@/lib/db/schema"

/**
 * 認証サービス層
 * 将来的にSupabase AuthやNextAuth.jsと統合
 */

export class AuthService {
  /**
   * 現在のユーザーを取得
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      const json = await res.json().catch(() => null)
      return json || null
    } catch (e) {
      console.error('[AuthService] getCurrentUser error', e)
      return null
    }
  }

  /**
   * ログイン
   */
  static async signIn(email: string, password: string): Promise<User | null> {
    // TODO: 認証実装時
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) throw error
    // return this.getCurrentUser()

    console.log("[Auth] Sign in:", email)
    return this.getCurrentUser()
  }

  /**
   * ログアウト
   */
  static async signOut(): Promise<void> {
    // TODO: 認証実装時
    // await supabase.auth.signOut()

    console.log("[Auth] Sign out")
  }

  /**
   * ユーザー権限チェック
   */
  static async checkPermission(userId: string, action: "read" | "write" | "delete"): Promise<boolean> {
    // TODO: ロールベースアクセス制御の実装
    // const user = await this.getCurrentUser()
    // if (!user) return false
    // return hasPermission(user.role, action)

    // モック: 管理者のみ全権限
    const user = await this.getCurrentUser()
    return user?.role === "owner"
  }
}
