import supabaseClient from '@/lib/supabase/client'
import apiFetch, { apiPath } from '@/lib/api-client'

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
        const msg = error.message || ''
        const mapped =
          msg.includes('Invalid login credentials') ? 'メールアドレスまたはパスワードが正しくありません' :
          msg.includes('Email not confirmed') ? 'メールアドレスがまだ確認されていません。確認メールをご確認ください' :
          msg.includes('For security purposes, you can only request this once every 60 seconds') ? '再試行が多すぎます。少し待ってからもう一度お試しください' :
          msg
        return { success: false, error: mapped }
      }
      const user = data?.user
      if (!user) return { success: false, error: '認証に失敗しました' }

      try {
        const sessDbg = data?.session
        // Debug: log session object to verify server-side session sync
        console.log('[auth] login: session value', sessDbg)
      } catch (e) {
        console.warn('[auth] login: session debug failed', e)
      }

      // Do not rely on /api/auth/link (may not exist). Skip linking here.

      const authUser = { id: user.id, email: user.email || null }
      // send tokens to server to set httpOnly cookies when possible.
      // For static admin (external API_BASE) we cannot rely on Set-Cookie for admin domain,
      // so persist tokens locally (localStorage) and let apiFetch attach Authorization.
      const session = data?.session
      if (session?.access_token) {
        try {
          const target = apiPath('/api/auth/session')
          let isExternal = false
          try {
            const u = new URL(target, window.location.origin)
            isExternal = u.origin !== window.location.origin
          } catch (e) {}

          if (isExternal) {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sb-access-token', session.access_token)
                if (session.refresh_token) localStorage.setItem('sb-refresh-token', session.refresh_token)
              }
              // mirror in-memory session for immediate use
              try { ;(window as any).__SUPABASE_SESSION = { access_token: session.access_token, refresh_token: session.refresh_token } } catch {}
            } catch (e) {
              console.warn('[auth] failed to persist tokens locally', e)
            }
          } else {
            const res = await apiFetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
            })
            if (res.status !== 200) {
              let msg = 'サーバーにセッションを保存できませんでした'
              try { const j = await res.json().catch(() => null); if (j?.error) msg = j.error } catch(e) {}
              return { success: false, error: msg }
            }
          }
        } catch (e) {
          console.warn('[auth] failed to set server session cookie', e)
          return { success: false, error: 'サーバーに接続できませんでした' }
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
        const chk = await apiFetch('/api/auth/check-email', {
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
        const msg = error.message || ''
        const mapped =
          msg.includes('User already registered') ? 'このメールアドレスは既に登録済みです' :
          msg.includes('Email not confirmed') ? '確認メールを送信しました。メール内リンクで確認後ログインしてください' :
          msg.includes('Password should be at least') ? 'パスワードが短すぎます。十分な長さにしてください' :
          msg
        return { success: false, error: mapped }
      }
      const user = data?.user
      if (!user) return { success: false, error: 'サインアップに失敗しました' }

      try {
        const sessDbg = data?.session
        // Debug: log session object after signup
        console.log('[auth] signup: session value', sessDbg)
      } catch (e) {
        console.warn('[auth] signup: session debug failed', e)
      }

      // Do not call /api/auth/link here — it's not required for login success.

      const authUser = { id: user.id, email: user.email || null }
      const session = data?.session
      if (session?.access_token) {
        try {
          // Determine whether /api/auth/session resolves to external API base.
          const target = apiPath('/api/auth/session')
          let isExternal = false
          try { const u = new URL(target, typeof window !== 'undefined' ? window.location.origin : ''); isExternal = u.origin !== (typeof window !== 'undefined' ? window.location.origin : '') } catch (e) {}
          if (isExternal) {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('sb-access-token', session.access_token)
                if (session.refresh_token) localStorage.setItem('sb-refresh-token', session.refresh_token)
              }
              try { ;(window as any).__SUPABASE_SESSION = { access_token: session.access_token, refresh_token: session.refresh_token } } catch {}
            } catch (e) {
              console.warn('[auth] failed to persist tokens locally', e)
            }
          } else {
            const res = await apiFetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
            })
            if (res.status !== 200) {
              let msg = 'サーバーにセッションを保存できませんでした'
              try { const j = await res.json().catch(() => null); if (j?.error) msg = j.error } catch(e) {}
              return { success: false, error: msg }
            }
          }
        } catch (e) {
          console.warn('[auth] failed to set server session cookie', e)
          return { success: false, error: 'サーバーに接続できませんでした' }
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
  logout: async (): Promise<boolean> => {
    let ok = true
    try {
      // Run server-side logout and Supabase signOut in parallel with timeouts.
      const serverLogout = (async () => {
            try {
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), 5000)
            try {
            await apiFetch('/api/auth/logout', { method: 'POST', signal: controller.signal })
          } catch (e) {
            // ignore network errors — still proceed to clear client state
          } finally {
            clearTimeout(id)
          }
        } catch (e) {
          // swallow
        }
      })()

      const clientSignOut = (async () => {
        try {
          await supabaseClient.auth.signOut()
        } catch (e) {
          console.warn('[auth] signOut error', e)
        }
      })()

      await Promise.allSettled([serverLogout, clientSignOut])
    } catch (e) {
      ok = false
      console.warn('[auth] logout flow error', e)
    }

    // Clear local mirror and stop any periodic refresh via onAuthStateChange handler
    try {
      writeLocalUser(null)
    } catch (e) {
      console.warn('[auth] clear local user failed', e)
    }

    if (typeof window !== 'undefined') {
      try {
        // use replace to avoid keeping the previous page in history
        window.location.replace('/admin/login')
      } catch (e) {
        try { window.location.href = '/admin/login' } catch {}
      }
    }
    return ok
  },

  // Try to refresh session server-side using refresh token cookie
  refresh: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch('/api/auth/refresh', { method: 'POST' })
      if (!res.ok) {
        // Treat refresh as an internal helper only. Do not perform logout
        // or redirect here — UI login state must be determined via
        // GET /api/auth/whoami only.
        const j = await res.json().catch(() => null)
        return { success: false, error: j?.error || 'refresh failed' }
      }
      return { success: true }
    } catch (e: any) {
      console.warn('[auth] refresh exception', e)
      // Do not mutate UI state or perform redirects here.
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
            // Periodic refresh failed — treat as an internal helper failure.
            // Do NOT perform logout/redirect here; UI decision is based on
            // GET /api/auth/whoami only.
            console.warn('[auth] periodic refresh failed', r.error)
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
        try {
          // Debug: log auth state change event and session payload
          console.log('[auth] onAuthStateChange', event, session)
        } catch (e) {
          console.warn('[auth] onAuthStateChange debug failed', e)
        }
        const user = session?.user || session?.access_token ? session?.user : null
        if (user) {
          const authUser: AuthUser = { id: user.id, email: user.email || null }
          // Do not automatically POST session here; login/signup flows
          // explicitly persist session to server and treat that as the
          // success signal. Avoid using onAuthStateChange for login decision.

          writeLocalUser(authUser)
          // We do not create/link server-side user rows here to avoid
          // relying on an endpoint that may not exist. UI auth decision
          // is based on /api/auth/session 200 response from login flow.
          // start periodic refresh only when in admin UI
          try {
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
              startAutoRefresh()
            }
          } catch (e) {
            console.warn('[auth] startAutoRefresh guard failed', e)
          }
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
  
  // If we already have a local user (e.g. page reload), start the periodic refresh
  // only when the user is viewing the admin UI. This prevents public pages
  // from triggering periodic refresh+redirect when the admin session expires.
  try {
    if (readLocalUser() && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      startAutoRefresh()
    }
  } catch (e) {
    console.warn('[auth] startAutoRefresh on load failed', e)
  }
}
