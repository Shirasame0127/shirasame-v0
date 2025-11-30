"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/auth'
import supabaseClient from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // ログインフォーム
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginEmailError, setLoginEmailError] = useState('')
  const [loginPasswordError, setLoginPasswordError] = useState('')

  // サインアップフォーム
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmailError, setSignupEmailError] = useState('')
  const [signupPasswordError, setSignupPasswordError] = useState('')
  const [signupUsernameError, setSignupUsernameError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // clear previous errors
    setLoginEmailError('')
    setLoginPasswordError('')

    // basic client-side validation using local flags
    let hasError = false
    const emailValid = /\S+@\S+\.\S+/.test(loginEmail)
    if (!loginEmail) {
      setLoginEmailError('メールアドレスを入力してください')
      hasError = true
    } else if (!emailValid) {
      setLoginEmailError('有効なメールアドレスを入力してください')
      hasError = true
    }
    if (!loginPassword) {
      setLoginPasswordError('パスワードを入力してください')
      hasError = true
    }

    if (hasError) return

    setIsLoading(true)

    const result = await auth.login(loginEmail, loginPassword)
    
    if (result.success) {
      console.log('[v0] User logged in:', loginEmail)
      toast({
        title: 'ログイン成功',
        description: 'ようこそ！',
      })
      window.location.href = '/admin'
    } else {
      // server-side auth errors (invalid credentials etc.) still shown via toast
      toast({ title: 'ログイン失敗', description: result.error, variant: 'destructive' })
    }

    setIsLoading(false)
  }

  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!loginEmail) {
      toast({ title: '入力エラー', description: 'メールアドレスを入力してください', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      // Redirect back to the login page so client-side code can complete the session handshake,
      // then navigate to the protected /admin area.
      const redirectTo = `${location.origin}/admin/login`
      const { data, error } = await supabaseClient.auth.signInWithOtp({ email: loginEmail, options: { emailRedirectTo: redirectTo } })
      if (error) {
        toast({ title: '送信失敗', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'メール送信済み', description: 'マジックリンクをメールで送信しました。メール内のリンクからログインしてください。' })
      }
    } catch (e) {
      console.error('[auth] magic link error', e)
      toast({ title: '送信中にエラー', description: String(e), variant: 'destructive' })
    }
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      window.location.href = '/api/auth/google'
    } catch (e) {
      console.error('[auth] google oauth start error', e)
      toast({ title: 'Googleログイン失敗', description: '開始処理でエラーが発生しました: ' + String(e), variant: 'destructive' })
    }
  }

  // Google OAuth removed — email/password and magic link only

  // If the page is loaded and the user is already signed in (e.g. returning from OAuth callback),
  // navigate to the protected admin page. We check the minimal local mirror as well as supabase session.
  useEffect(() => {
    let mounted = true
    // OAuthエラー表示
    const oauthError = searchParams?.get('oauth_error')
    if (oauthError) {
      const messages: Record<string, { title: string; desc: string }> = {
        config_missing: { title: '設定エラー', desc: '認証設定が不足しています。管理者に連絡してください。' },
        no_code: { title: '認証コード欠落', desc: 'Googleログインが中断されました。もう一度試してください。' },
        exchange_failed: { title: 'トークン交換失敗', desc: 'Google認証コードの交換に失敗しました。リダイレクトURL設定を確認してください。' },
        access_missing: { title: 'アクセストークンなし', desc: 'アクセストークンを取得できませんでした。再度ログインしてください。' },
        internal_error: { title: '内部エラー', desc: '内部処理で問題が発生しました。時間を空けて再試行してください。' },
        cookie_blocked: { title: 'Cookieが無効', desc: 'ブラウザでCookieがブロックされている可能性があります。設定を確認してください。' },
      }
      const m = messages[oauthError] || { title: '不明なエラー', desc: '不明なエラーが発生しました。再度お試しください。' }
      toast({ title: m.title, description: m.desc, variant: 'destructive' })
      // クエリ除去（履歴汚さないようreplace）
      try {
        const sp = new URL(window.location.href)
        sp.searchParams.delete('oauth_error')
        window.history.replaceState({}, '', sp.toString())
      } catch {}
    }

    async function checkSignedInOnce() {
      try {
        const s = await (supabaseClient as any).auth.getSession()
        const sess = s?.data?.session
        if (sess && mounted) {
          const access = sess.access_token
          const refresh = sess.refresh_token
          if (access && refresh) {
            await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: access, refresh_token: refresh }) }).catch(() => {})
          }
          window.location.href = '/admin'
          return
        }
        const local = auth.getCurrentUser()
        if (local && mounted) {
          try {
            const r = await fetch('/api/auth/refresh', { method: 'POST' })
            if (r.ok) {
              window.location.href = '/admin'
              return
            }
          } catch {}
          try { localStorage.removeItem('auth_user') } catch {}
        }
      } catch {}
    }
    checkSignedInOnce()
    return () => { mounted = false }
  }, [searchParams, toast])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    // clear previous errors
    setSignupEmailError('')
    setSignupPasswordError('')
    setSignupUsernameError('')

    // basic client-side validation
    const emailValid = /\S+@\S+\.\S+/.test(signupEmail)
    if (!signupUsername) setSignupUsernameError('ユーザー名を入力してください')
    if (!signupEmail) setSignupEmailError('メールアドレスを入力してください')
    else if (!emailValid) setSignupEmailError('有効なメールアドレスを入力してください')
    if (!signupPassword) setSignupPasswordError('パスワードを入力してください')

    if (signupUsernameError || signupEmailError || signupPasswordError || !signupUsername || !signupEmail || !signupPassword || !emailValid) {
      return
    }

    setIsLoading(true)

    if (!signupEmail || !signupPassword || !signupUsername) {
      toast({
        title: '入力エラー',
        description: 'すべてのフィールドを入力してください',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    const result = await auth.signup(signupEmail, signupPassword, signupUsername)
    
    if (result.success) {
      console.log('[v0] New user created:', signupEmail)
      toast({
        title: 'アカウント作成成功',
        description: 'ようこそ！',
      })
      window.location.href = '/admin'
    } else {
      toast({
        title: 'アカウント作成失敗',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ガジェット紹介サイト</CardTitle>
          <CardDescription>管理画面へログイン</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">ログイン</TabsTrigger>
              <TabsTrigger value="signup">新規登録</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">メールアドレス</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      setLoginEmailError('')
                    }}
                    required
                  />
                  {loginEmailError ? <p className="text-sm text-destructive mt-1">{loginEmailError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">パスワード</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value)
                        setLoginPasswordError('')
                      }}
                      required
                    />
                    {loginPasswordError ? <p className="text-sm text-destructive mt-1">{loginPasswordError}</p> : null}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((s) => !s)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                    >
                      {showLoginPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.05-2.59 2.77-4.78 4.8-6.24"/><path d="M1 1l22 22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={handleGoogleLogin} disabled={isLoading} className="flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0-.68-.06-1.34-.17-1.97H12v3.73h5.36c-.23 1.25-1.03 2.31-2.2 3.02v2.5h3.56C20.55 19.06 22 15.87 22 12z"/><path d="M12 22c2.97 0 5.47-.98 7.29-2.66l-3.56-2.5c-.98.66-2.24 1.06-3.73 1.06-2.86 0-5.28-1.93-6.15-4.53H2.14v2.84C3.95 19.97 7.73 22 12 22z"/><path d="M5.85 13.31A6.99 6.99 0 0 1 5.2 12c0-.4.05-.79.11-1.17V8.0H2.14A10.98 10.98 0 0 0 1 12c0 1.83.44 3.56 1.21 5.07l3.64-3.76z"/><path d="M12 6.5c1.62 0 3.08.56 4.22 1.66l3.17-3.17C17.47 2.51 14.97 1.5 12 1.5 7.73 1.5 3.95 3.53 2.14 6.5l3.66 2.84C6.72 8.43 9.14 6.5 12 6.5z"/></svg>
                    Googleでログイン
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSendMagicLink} disabled={isLoading} className="flex-1">
                    メール認証
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">ユーザー名</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="username"
                    value={signupUsername}
                    onChange={(e) => {
                      setSignupUsername(e.target.value)
                      setSignupUsernameError('')
                    }}
                    required
                  />
                  {signupUsernameError ? <p className="text-sm text-destructive mt-1">{signupUsernameError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value)
                      setSignupEmailError('')
                    }}
                    required
                  />
                  {signupEmailError ? <p className="text-sm text-destructive mt-1">{signupEmailError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value)
                        setSignupPasswordError('')
                      }}
                      required
                    />
                    {signupPasswordError ? <p className="text-sm text-destructive mt-1">{signupPasswordError}</p> : null}
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((s) => !s)}
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                    >
                      {showSignupPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.05-2.59 2.77-4.78 4.8-6.24"/><path d="M1 1l22 22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'アカウント作成中...' : 'アカウント作成'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
