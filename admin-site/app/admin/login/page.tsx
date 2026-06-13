"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/auth'
import supabaseClient from '@/lib/supabase/client'
import apiFetch, { apiPath } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { StarMark } from '@/components/brand'

type LoginAction = 'login' | 'magic' | 'reset' | 'signup' | null

function LoginPageInner() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [action, setAction] = useState<LoginAction>(null)
  const busy = action !== null

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
    if (busy) return
    setLoginEmailError('')
    setLoginPasswordError('')

    let hasError = false
    const emailValid = /\S+@\S+\.\S+/.test(loginEmail)
    if (!loginEmail) { setLoginEmailError('メールアドレスを入力してください'); hasError = true }
    else if (!emailValid) { setLoginEmailError('有効なメールアドレスを入力してください'); hasError = true }
    if (!loginPassword) { setLoginPasswordError('パスワードを入力してください'); hasError = true }
    if (hasError) return

    setAction('login')
    const result = await auth.login(loginEmail, loginPassword)
    if (result.success) {
      toast({ title: 'ログインしました', description: 'ようこそ' })
      const r = searchParams?.get('r') || '/admin'
      try { router.replace(r) } catch { window.location.href = r }
    } else {
      toast({ title: 'ログインに失敗しました', description: result.error, variant: 'destructive' })
      setAction(null)
    }
  }

  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (busy) return
    if (!loginEmail) { toast({ title: '入力エラー', description: 'メールアドレスを入力してください', variant: 'destructive' }); return }
    setAction('magic')
    try {
      const redirectTo = `${location.origin}/admin/login`
      const { error } = await supabaseClient.auth.signInWithOtp({ email: loginEmail, options: { emailRedirectTo: redirectTo } })
      if (error) toast({ title: '送信に失敗しました', description: error.message, variant: 'destructive' })
      else toast({ title: 'メールを送信しました', description: 'マジックリンクから続行してください。' })
    } catch (e) {
      toast({ title: '送信中にエラー', description: String(e), variant: 'destructive' })
    }
    setAction(null)
  }

  const handleSendPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (busy) return
    if (!loginEmail) { toast({ title: '入力エラー', description: 'メールアドレスを入力してください', variant: 'destructive' }); return }
    setAction('reset')
    try {
      const redirectTo = `${location.origin}/admin/reset`
      const { error } = await supabaseClient.auth.resetPasswordForEmail(loginEmail, { redirectTo })
      if (error) toast({ title: '送信に失敗しました', description: error.message || String(error), variant: 'destructive' })
      else toast({ title: 'メールを送信しました', description: 'パスワード再設定用のリンクを送信しました。' })
    } catch (e) {
      toast({ title: '送信中にエラー', description: String(e), variant: 'destructive' })
    }
    setAction(null)
  }

  const handleGoogleLogin = async () => {
    try {
      const adminBase = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')
      const dest = adminBase ? `${adminBase}/api/auth/google` : '/api/auth/google'
      window.location.href = dest
    } catch (e) {
      toast({ title: 'Googleログインに失敗しました', description: String(e), variant: 'destructive' })
    }
  }

  useEffect(() => {
    // Fragment token capture: if URL hash contains access_token, post to /api/auth/session
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash) {
        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const expires_in = params.get('expires_in')
        if (access_token) {
          ;(async () => {
            try {
              const body = { access_token: access_token || '', refresh_token: refresh_token || '', expires_in: expires_in || '' }
              try {
                const target = apiPath('/api/auth/session')
                let isExternal = false
                try { const u = new URL(target, window.location.origin); isExternal = u.origin !== window.location.origin } catch (e) {}
                if (isExternal) {
                  try {
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('sb-access-token', access_token)
                      if (refresh_token) localStorage.setItem('sb-refresh-token', refresh_token)
                    }
                    try { ;(window as any).__SUPABASE_SESSION = { access_token, refresh_token } } catch {}
                    try { window.history.replaceState({}, document.title, window.location.pathname + window.location.search) } catch (e) {}
                    try { router.replace('/admin') } catch { window.location.href = '/admin' }
                    return
                  } catch (e) {
                    console.error('[login] local session persist error', e)
                  }
                } else {
                  const r = await apiFetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(body),
                  })
                  if (r.status === 200) {
                    try { window.history.replaceState({}, document.title, window.location.pathname + window.location.search) } catch (e) {}
                    try { const dest = searchParams?.get('r') || '/admin'; router.replace(dest) } catch { window.location.href = (searchParams?.get('r') || '/admin') }
                    return
                  }
                }
              } catch (err) {
                console.error('[login] /api/auth/session handling error', err)
              }
              toast({ title: 'ログインに失敗しました', description: 'トークンを保存できませんでした。', variant: 'destructive' })
            } catch (err) {
              toast({ title: 'ログインに失敗しました', description: 'ネットワークエラーが発生しました。', variant: 'destructive' })
            }
          })()
          return
        }
      }
    } catch (e) { /* ignore */ }

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
  }, [searchParams, toast, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setSignupEmailError('')
    setSignupPasswordError('')
    setSignupUsernameError('')

    const emailValid = /\S+@\S+\.\S+/.test(signupEmail)
    let hasError = false
    if (!signupUsername) { setSignupUsernameError('ユーザー名を入力してください'); hasError = true }
    if (!signupEmail) { setSignupEmailError('メールアドレスを入力してください'); hasError = true }
    else if (!emailValid) { setSignupEmailError('有効なメールアドレスを入力してください'); hasError = true }
    if (!signupPassword) { setSignupPasswordError('パスワードを入力してください'); hasError = true }
    if (hasError) return

    setAction('signup')
    const result = await auth.signup(signupEmail, signupPassword, signupUsername)
    if (result.success) {
      toast({ title: 'アカウントを作成しました', description: 'ようこそ' })
      window.location.href = '/admin'
    } else {
      toast({ title: 'アカウント作成に失敗しました', description: result.error, variant: 'destructive' })
      setAction(null)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* faint editorial star motif */}
      <StarMark size={420} variant="outline" strokeWidth={0.5} className="pointer-events-none absolute -right-24 -top-24 text-primary/5" />
      <StarMark size={240} variant="outline" strokeWidth={0.5} className="pointer-events-none absolute -bottom-16 -left-10 text-foreground/5" />

      <Card className="relative w-full max-w-md">
        <CardContent className="p-7">
          <div className="mb-6 flex flex-col items-center text-center">
            <StarMark size={30} className="mb-3 text-primary" />
            <div className="font-display text-3xl tracking-tight">Shirasame</div>
            <p className="label-mono mt-2">Admin Console</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">ログイン</TabsTrigger>
              <TabsTrigger value="signup">新規登録</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="login-email">メールアドレス</Label>
                  <Input id="login-email" type="email" placeholder="email@example.com" value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginEmailError('') }} disabled={busy} required />
                  {loginEmailError && <p className="text-sm text-destructive">{loginEmailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">パスワード</Label>
                  <div className="relative">
                    <Input id="login-password" type={showLoginPassword ? 'text' : 'password'} value={loginPassword} className="pr-10"
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginPasswordError('') }} disabled={busy} required />
                    <button type="button" onClick={() => setShowLoginPassword((s) => !s)} aria-label={showLoginPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-70 hover:opacity-100">
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginPasswordError && <p className="text-sm text-destructive">{loginPasswordError}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {action === 'login' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {action === 'login' ? 'ログイン中…' : 'ログイン'}
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleSendMagicLink} disabled={busy} className="flex-1">
                    {action === 'magic' && <Loader2 className="h-4 w-4 animate-spin" />}
                    メール認証
                  </Button>
                  <Button type="button" variant="link" onClick={handleSendPasswordReset} disabled={busy} className="flex-1">
                    {action === 'reset' && <Loader2 className="h-4 w-4 animate-spin" />}
                    パスワードをリセット
                  </Button>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="label-mono">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={busy} className="w-full gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
                  </svg>
                  Googleでログイン
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">ユーザー名</Label>
                  <Input id="signup-username" type="text" placeholder="username" value={signupUsername}
                    onChange={(e) => { setSignupUsername(e.target.value); setSignupUsernameError('') }} disabled={busy} required />
                  {signupUsernameError && <p className="text-sm text-destructive">{signupUsernameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input id="signup-email" type="email" placeholder="email@example.com" value={signupEmail}
                    onChange={(e) => { setSignupEmail(e.target.value); setSignupEmailError('') }} disabled={busy} required />
                  {signupEmailError && <p className="text-sm text-destructive">{signupEmailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showSignupPassword ? 'text' : 'password'} value={signupPassword} className="pr-10"
                      onChange={(e) => { setSignupPassword(e.target.value); setSignupPasswordError('') }} disabled={busy} required />
                    <button type="button" onClick={() => setShowSignupPassword((s) => !s)} aria-label={showSignupPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-70 hover:opacity-100">
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupPasswordError && <p className="text-sm text-destructive">{signupPasswordError}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {action === 'signup' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {action === 'signup' ? 'アカウント作成中…' : 'アカウント作成'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background" />}>
      <LoginPageInner />
    </Suspense>
  )
}
