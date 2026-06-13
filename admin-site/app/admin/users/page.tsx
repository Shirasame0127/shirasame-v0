"use client"

import { useEffect, useState } from 'react'
import apiFetch from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { StarMark } from '@/components/brand'
import { Users } from 'lucide-react'

type User = { id: string; email?: string; displayName?: string; username?: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/users', { method: 'GET' })
        if (!res.ok) throw new Error('failed')
        const js = await res.json().catch(() => ({ data: [] }))
        setUsers(Array.isArray(js.data) ? js.data : [])
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    })()
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <p className="label-mono mb-2 flex items-center gap-2"><StarMark size={12} className="text-primary" /> Users</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">ユーザー管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">登録ユーザーの一覧</p>
      </div>

      {status === 'loading' ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-md border bg-muted/40" />)}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">ユーザーの読み込みに失敗しました</div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">ユーザーがいません</p>
        </div>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="p-3 text-left font-medium text-muted-foreground">メール</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">表示名</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-3">{u.email || '-'}</td>
                    <td className="p-3">{u.displayName || u.username || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
