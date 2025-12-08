"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabaseClient from '@/lib/supabase/client'
import apiFetch from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ResetPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [hasFragmentTokens, setHasFragmentTokens] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash) {
        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const a = params.get('access_token')
        const r = params.get('refresh_token')
        const e = params.get('expires_in')
        if (a) {
          setAccessToken(a)
          setRefreshToken(r)
          setExpiresIn(e)
          setHasFragmentTokens(true)
          setIsReady(true)
          return
        }
      }
    } catch (e) {
      // ignore
    }
    setIsReady(true)
  }, [])

  // If we have fragment tokens, set supabase client session in-memory so we
  // can call updateUser to change password, then persist session via server.
  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!accessToken) {
      toast({ title: 'エラー', description: '有効なトークンが見つかりません。リンクを再確認してください。', variant: 'destructive' })
      return
    }
    if (!newPassword || newPassword.length < 8) {
      toast({ title: '入力エラー', description: 'パスワードは8文字以上にしてください', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      // Set the session in the Supabase client (in-memory) so updateUser can use it
      await (supabaseClient as any).auth.setSession({ access_token: accessToken, refresh_token: refreshToken })

      // Update password
      const { data, error } = await (supabaseClient as any).auth.updateUser({ password: newPassword })
      if (error) {
        console.error('[reset] updateUser error', error)
        toast({ title: 'パスワード更新失敗', description: error.message || String(error), variant: 'destructive' })
        setIsLoading(false)
        return
      }

      // After successful password change, persist tokens server-side so HttpOnly cookies are set
      // Prefer to use fragment tokens we already have rather than relying on client session persistence.
      try {
        const body = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn || ''
        }
        const res = await apiFetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          toast({ title: 'セッション保存失敗', description: j?.error || 'セッションを保存できませんでした', variant: 'destructive' })
          setIsLoading(false)
          return
        }
        // Ensure server-side whoami recognizes the session before navigating
        const j = await res.json().catch(() => null)
        if (!j || !j.ok || !j.user) {
          toast({ title: 'セッション確認失敗', description: 'サーバーでユーザー情報を確認できませんでした', variant: 'destructive' })
          setIsLoading(false)
          return
        }
        let ok = false
        for (let i = 0; i < 5; i++) {
          try {
            const who = await apiFetch('/api/auth/whoami', { cache: 'no-store' })
            if (who && who.ok) { ok = true; break }
          } catch (e) {}
          await new Promise((r) => setTimeout(r, 200))
        }
        if (!ok) {
          toast({ title: 'ログイン失敗', description: 'セッションの確認に失敗しました。', variant: 'destructive' })
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error('[reset] session persist error', e)
        toast({ title: 'ネットワークエラー', description: 'サーバーに接続できませんでした', variant: 'destructive' })
        setIsLoading(false)
        return
      }

      toast({ title: 'パスワードを更新しました', description: 'ログイン状態で管理画面に移動します' })
      window.location.href = '/admin'
    } catch (e) {
      console.error('[reset] unexpected error', e)
      toast({ title: 'エラー', description: '予期せぬエラーが発生しました', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>パスワードのリセット</CardTitle>
        </CardHeader>
        <CardContent>
          {!isReady ? <p>処理中...</p> : null}

          {isReady && !hasFragmentTokens ? (
            <div>
              <p className="mb-4">パスワードリセット用のリンクが無効か、トークンが含まれていません。パスワードリセットのリクエストを再度行ってください。</p>
            </div>
          ) : null}

          {isReady && hasFragmentTokens ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="新しいパスワード(8文字以上)" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? '更新中...' : 'パスワードを更新してログイン'}</Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
