"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const [isLoading, setIsLoading] = useState(false)

  // ログインフォーム
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // サインアップフォーム
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupUsername, setSignupUsername] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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
      toast({
        title: 'ログイン失敗',
        description: result.error,
        variant: 'destructive',
      })
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

  // Google OAuth removed — email/password and magic link only

  // If the page is loaded and the user is already signed in (e.g. returning from OAuth callback),
  // navigate to the protected admin page. We check the minimal local mirror as well as supabase session.
  useEffect(() => {
    let mounted = true
    async function checkSignedIn() {
      try {
        // Prefer an actual Supabase session (client-side) before redirecting.
        // Redirecting solely based on the localStorage mirror can cause a loop
        // where the app redirects to /admin but the server has no cookies yet,
        // and middleware sends the browser back to /admin/login.
        try {
          const s = await (supabaseClient as any).auth.getSession()
          const sess = s?.data?.session
          if (sess && mounted) {
            const access = sess.access_token || sess?.access_token
            const refresh = sess.refresh_token
            if (access && refresh) {
              await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: access, refresh_token: refresh }) }).catch(() => {})
            }
            window.location.href = '/admin'
            return
          }
        } catch (e) {
          // ignore errors from getSession
        }

        // If there's no Supabase client session, only redirect if server-side
        // refresh can confirm an active cookie-based session. Otherwise clear
        // the local mirror to avoid repeatedly trying to go to /admin.
        const local = auth.getCurrentUser()
        if (local && mounted) {
          try {
            const r = await fetch('/api/auth/refresh', { method: 'POST' })
            if (r.ok) {
              window.location.href = '/admin'
              return
            }
          } catch (e) {
            // ignore
          }

          // Poll /api/auth/whoami for a short window — this absorbs race where
          // provider callback sets cookies and redirects but client-side mirror
          // is not yet populated.
          try {
            const start = Date.now()
            const timeout = 5000
            while (Date.now() - start < timeout && mounted) {
              try {
                const who = await fetch('/api/auth/whoami')
                if (who.ok) {
                  window.location.href = '/admin'
                  return
                }
              } catch (e) {
                // ignore transient errors
              }
              // small delay between polls
              await new Promise((res) => setTimeout(res, 300))
            }
          } catch (e) {
            // ignore
          }

          try { localStorage.removeItem('auth_user') } catch {}
        }
      } catch (e) {
        // ignore outer errors
      }
    }
    checkSignedIn()
    return () => { mounted = false }
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
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
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">パスワード</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleSendMagicLink} disabled={isLoading} className="flex-1">
                    マジックリンクを送る（メール）
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
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
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
