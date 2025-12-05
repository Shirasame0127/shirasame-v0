'use client'
import { useEffect, useState } from 'react'

export default function ClientHome() {
  const [data, setData] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    const url = base ? `${base}/site-settings` : '/site-settings'
    fetch(url, { method: 'GET', credentials: 'include' })
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
