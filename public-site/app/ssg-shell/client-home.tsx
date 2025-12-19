'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

export default function ClientHome() {
  const [data, setData] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    apiFetch('/site-settings')
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch((e) => setErr(String(e)))
  }, [])

  if (err) return <div className="text-sm text-rose-600">Failed to load: {err}</div>
  if (!data) return <div>Loading…</div>
  return (
    <div>
      <div className="mb-2">Loaded site settings (from Worker):</div>
      <pre className="bg-muted p-3 rounded text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
