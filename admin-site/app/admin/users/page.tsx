"use client"

import { useEffect, useState } from 'react'

import apiFetch from '@/lib/api-client'

type User = { id: string; email?: string; displayName?: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/admin/users', { method: 'GET' })
        const js = await res.json().catch(() => ({ data: [] }))
        setUsers(Array.isArray(js.data) ? js.data : [])
      } finally { setLoading(false) }
    })()
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>
      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Display Name</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email || '-'}</td>
                <td className="p-2">{u.displayName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
