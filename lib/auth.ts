import supabaseClient from '@/lib/supabase/client'

export type AuthUser = {
  id: string
  email?: string | null
  username?: string | null
}

const AUTH_STORAGE_KEY = 'auth_user'

function readLocalUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(AUTH_STORAGE_KEY)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

function writeLocalUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    }
  } catch (e) {
    console.warn('[auth] writeLocalUser error', e)
  }
}

export const auth = {
  // 現在のログインユーザーを取得（同期、既存コード互換）
  getCurrentUser: (): AuthUser | null => {
    return readLocalUser()
  },

  // ログイン
  login: async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
      if (error) {
        console.warn('[auth] signIn error', error)
        return { success: false, error: error.message }
      }
      const user = data?.user
      if (!user) return { success: false, error: '認証に失敗しました' }

      // Ensure there is a users row linked to this auth user
      try {
        await fetch('/api/auth/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email }),
        })
      } catch (e) {
        console.warn('[auth] failed to link user row', e)
      }

      const authUser = { id: user.id, email: user.email || null }
      // send tokens to server to set httpOnly cookies
      const session = data?.session
      if (session?.access_token) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
          })
        } catch (e) {
          console.warn('[auth] failed to set server session cookie', e)
        }
      }
      writeLocalUser(authUser) // keep minimal local mirror for compatibility (not used for security)
      return { success: true, user: authUser }
    } catch (e: any) {
      console.error('[auth] login exception', e)
      return { success: false, error: String(e) }
    }
  },

  // サインアップ
  signup: async (email: string, password: string, username?: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    try {
      // Prevent duplicate signup if an app-level users row already exists with this email
      try {
        const chk = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (chk.ok) {
          const j = await chk.json().catch(() => null)
          if (j?.exists) return { success: false, error: 'このメールアドレスは既に登録済みです' }
        }
      } catch (e) {
        console.warn('[auth] check-email failed', e)
      }

      const { data, error } = await supabaseClient.auth.signUp({ email, password })
      if (error) {
        console.warn('[auth] signUp error', error)
        return { success: false, error: error.message }
      }
      const user = data?.user
      if (!user) return { success: false, error: 'サインアップに失敗しました' }

      // Create or link a users row on the server side
      try {
        await fetch('/api/auth/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email, username }),
        })
      } catch (e) {
        console.warn('[auth] failed to link user row after signup', e)
      }

      const authUser = { id: user.id, email: user.email || null }
      const session = data?.session
      if (session?.access_token) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
          })
        } catch (e) {
          console.warn('[auth] failed to set server session cookie', e)
        }
      }
      writeLocalUser(authUser)
      return { success: true, user: authUser }
    } catch (e: any) {
      console.error('[auth] signup exception', e)
      return { success: false, error: String(e) }
    }
  },

  // ログアウト
  logout: async (): Promise<void> => {
    try {
      // Notify server to revoke/invalidate session and clear cookies
      try {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      } catch {}

      try {
        await supabaseClient.auth.signOut()
      } catch (e) {
        console.warn('[auth] signOut error', e)
      }
    } catch (e) {
      console.warn('[auth] logout flow error', e)
    }
    writeLocalUser(null)
    if (typeof window !== 'undefined') {
      try {
        window.location.href = '/admin/login'
      } catch {}
    }
  },

  // Try to refresh session server-side using refresh token cookie
  refresh: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        // On refresh failure, force local sign-out and redirect to login
        try {
          await auth.logout()
        } catch (e) {
          console.warn('[auth] logout after refresh failure failed', e)
        }
        try {
          writeLocalUser(null)
        } catch {}
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login'
        }
        return { success: false, error: j?.error || 'refresh failed' }
      }
      return { success: true }
    } catch (e: any) {
      console.warn('[auth] refresh exception', e)
      try {
        await auth.logout()
      } catch {}
      try {
        writeLocalUser(null)
      } catch {}
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login'
      }
      return { success: false, error: String(e) }
    }
  },

  // Start periodic auto-refresh (runs in browser)
  _startAutoRefresh: (): void => {},

  // Stop periodic auto-refresh
  _stopAutoRefresh: (): void => {},

  isAuthenticated: async (): Promise<boolean> => {
    const u = await auth.getCurrentUser()
    return !!u
  }
}

export const getCurrentUser = auth.getCurrentUser

// Subscribe to Supabase auth state changes and keep localStorage in sync.
if (typeof window !== 'undefined' && supabaseClient?.auth && (supabaseClient as any).auth.onAuthStateChange) {
  let __refreshInterval: any = null

  function startAutoRefresh() {
    try {
      // clear existing
      if (__refreshInterval) clearInterval(__refreshInterval)
      // refresh every 15 minutes
      __refreshInterval = setInterval(async () => {
        try {
          const r = await auth.refresh()
          if (!r.success) {
            console.warn('[auth] periodic refresh failed', r.error)
            // refresh() already handles logout+redirect on failure
          }
        } catch (e) {
          console.warn('[auth] periodic refresh exception', e)
        }
      }, 15 * 60 * 1000)
    } catch (e) {
      console.warn('[auth] startAutoRefresh error', e)
    }
  }

  function stopAutoRefresh() {
    try {
      if (__refreshInterval) {
        clearInterval(__refreshInterval)
        __refreshInterval = null
      }
    } catch (e) {
      console.warn('[auth] stopAutoRefresh error', e)
    }
  }

  ;(supabaseClient as any).auth.onAuthStateChange((event: string, session: any) => {
    try {
      // When signed in, write minimal user info to localStorage for sync with existing code
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = session?.user || session?.access_token ? session?.user : null
        if (user) {
          const authUser: AuthUser = { id: user.id, email: user.email || null }
          // When auth state changes (e.g., OAuth / magic link), send session tokens to server
          try {
            const sess = session?.access_token ? { access_token: session.access_token, refresh_token: session.refresh_token } : null
            if (sess) {
              fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sess),
              }).catch((e) => console.warn('[auth] link after auth state change failed', e))
            }
          } catch (e) {
            console.warn('[auth] session sync failed', e)
          }

          writeLocalUser(authUser)
          // Ensure server-side app users row exists
          fetch('/api/auth/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email }),
          }).catch((e) => console.warn('[auth] link after auth state change failed', e))
          // start periodic refresh
          startAutoRefresh()
        }
      }

      if (event === 'SIGNED_OUT') {
        writeLocalUser(null)
        stopAutoRefresh()
      }
    } catch (e) {
      console.warn('[auth] onAuthStateChange handler error', e)
    }
  })
}
