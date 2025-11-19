import { db } from './db/storage'

export type AuthUser = {
  id: string
  email: string
  username: string
}

const AUTH_STORAGE_KEY = 'auth_user'
const USERS_STORAGE_KEY = 'auth_users'

export const auth = {
  // 現在のログインユーザーを取得
  getCurrentUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(AUTH_STORAGE_KEY)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  // ログイン
  login: async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    if (typeof window === 'undefined') return { success: false, error: 'サーバーエラー' }
    
    try {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
      const user = users.find((u: any) => u.email === email && u.password === password)
      
      if (!user) {
        return { success: false, error: 'メールアドレスまたはパスワードが間違っています' }
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
      console.log('[v0] User logged in:', authUser.email)
      
      return { success: true, user: authUser }
    } catch (error) {
      console.error('[v0] Login error:', error)
      return { success: false, error: 'ログインに失敗しました' }
    }
  },

  // サインアップ
  signup: async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    if (typeof window === 'undefined') return { success: false, error: 'サーバーエラー' }
    
    try {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
      
      // メールアドレスの重複チェック
      if (users.some((u: any) => u.email === email)) {
        return { success: false, error: 'このメールアドレスは既に登録されています' }
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // 本番環境ではハッシュ化が必要
        username,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // ユーザープロフィールを作成
      db.user.create({
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.username,
        bio: '',
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        createdAt: newUser.createdAt,
        updatedAt: newUser.createdAt,
      })

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
      console.log('[v0] User signed up:', authUser.email)
      
      return { success: true, user: authUser }
    } catch (error) {
      console.error('[v0] Signup error:', error)
      return { success: false, error: 'アカウント作成に失敗しました' }
    }
  },

  // ログアウト
  logout: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(AUTH_STORAGE_KEY)
    console.log('[v0] User logged out')
  },

  // ログイン状態をチェック
  isAuthenticated: (): boolean => {
    return auth.getCurrentUser() !== null
  },
}

export const getCurrentUser = auth.getCurrentUser
