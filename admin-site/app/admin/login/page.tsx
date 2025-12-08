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

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginEmailError, setLoginEmailError] = useState('')
  const [loginPasswordError, setLoginPasswordError] = useState('')

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
    setLoginEmailError('')
    setLoginPasswordError('')

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
      toast({ title: 'ログイン成功', description: 'ようこそ！' })
      window.location.href = '/admin'
    } else {
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
      // Prefer an explicit admin API origin when configured so the OAuth
      // flow runs on the admin domain (where the Worker can set cookies).
      const adminBase = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')
      const dest = adminBase ? `${adminBase}/api/auth/google` : '/api/auth/google'
      window.location.href = dest
    } catch (e) {
      console.error('[auth] google oauth start error', e)
      toast({ title: 'Googleログイン失敗', description: '開始処理でエラーが発生しました: ' + String(e), variant: 'destructive' })
    }
  }

  useEffect(() => {
    // Fragment token capture: if URL hash contains access_token, post to /api/auth/set_tokens
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash) {
        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const expires_in = params.get('expires_in')
        if (access_token) {
          try { console.log('[login] フラグメントでトークンを検出しました（トークンの値は出しません）', 'hasAccess=true', 'hasRefresh=' + (!!refresh_token), 'expires_in=' + (expires_in || '')) } catch (e) {}
          // Send tokens to the proxy so it can set HttpOnly cookies for admin domain
          (async () => {
            try {
              const params = new URLSearchParams()
              params.set('access_token', access_token || '')
              params.set('refresh_token', refresh_token || '')
              params.set('expires_in', expires_in || '')

              const r = await fetch('/api/auth/set_tokens', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
                redirect: 'manual'
              })

              try { console.log('[login] /api/auth/set_tokens response', 'status=' + r.status, 'ok=' + r.ok) } catch (e) {}
              const keys: string[] = []
              try { for (const h of r.headers.keys()) keys.push(h) } catch (e) {}
              try { console.log('[login] /api/auth/set_tokens response headers keys', keys) } catch (e) {}

              // If server returns JSON ok, treat as success
              if (r.ok) {
                const j = await r.json().catch(() => null)
                if (j && j.ok) {
                  window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
                  window.location.href = '/admin'
                  return
                }
              }

              // If server indicated redirect (302), treat as success as well
              if (r.status === 302) {
                window.location.href = '/admin'
                return
              }

              toast({ title: 'ログイン失敗', description: 'トークンを保存できませんでした。', variant: 'destructive' })
            } catch (err) {
              try { console.error('[login] /api/auth/set_tokens ネットワークエラー', err) } catch (e) {}
              toast({ title: 'ログイン失敗', description: 'ネットワークエラーが発生しました。', variant: 'destructive' })
            }
          })()
          return
        }
      }
    } catch (e) {
      // ignore and continue to other checks
    }

    let mounted = true
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
      try {
        const sp = new URL(window.location.href)
        sp.searchParams.delete('oauth_error')
        window.history.replaceState({}, '', sp.toString())
      } catch {}
    }

    // NOTE: Do not perform automatic authentication checks when the login
    // page is displayed. Calling /api/auth/whoami on mount can race with
    // cookie propagation after OAuth redirects and cause spurious 401s.
    // Authentication is performed only after explicit flows (fragment
    // posting or session sync), which already redirect to /admin on success.
    return () => { mounted = false }
  }, [searchParams, toast])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupEmailError('')
    setSignupPasswordError('')
    setSignupUsernameError('')

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
      toast({ title: '入力エラー', description: 'すべてのフィールドを入力してください', variant: 'destructive' })
      setIsLoading(false)
      return
    }

    const result = await auth.signup(signupEmail, signupPassword, signupUsername)
    
    if (result.success) {
      toast({ title: 'アカウント作成成功', description: 'ようこそ！' })
      window.location.href = '/admin'
    } else {
      toast({ title: 'アカウント作成失敗', description: result.error, variant: 'destructive' })
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
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginEmailError('') }}
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
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginPasswordError('') }}
                      required
                    />
                    {loginPasswordError ? <p className="text-sm text-destructive mt-1">{loginPasswordError}</p> : null}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((s) => !s)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'ログイン中...' : 'ログイン'}</Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={handleGoogleLogin} disabled={isLoading} className="flex-1">Googleでログイン</Button>
                  <Button type="button" variant="outline" onClick={handleSendMagicLink} disabled={isLoading} className="flex-1">メール認証</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">ユーザー名</Label>
                  <Input id="signup-username" type="text" placeholder="username" value={signupUsername} onChange={(e) => { setSignupUsername(e.target.value); setSignupUsernameError('') }} required />
                  {signupUsernameError ? <p className="text-sm text-destructive mt-1">{signupUsernameError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input id="signup-email" type="email" placeholder="email@example.com" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); setSignupEmailError('') }} required />
                  {signupEmailError ? <p className="text-sm text-destructive mt-1">{signupEmailError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={(e) => { setSignupPassword(e.target.value); setSignupPasswordError('') }} required />
                    {signupPasswordError ? <p className="text-sm text-destructive mt-1">{signupPasswordError}</p> : null}
                    <button type="button" onClick={() => setShowSignupPassword((s) => !s)} aria-label={showSignupPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100">{showSignupPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'アカウント作成中...' : 'アカウント作成'}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
