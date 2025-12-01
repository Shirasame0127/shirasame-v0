"use client"
import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error)
  }, [error])

  return (
    <html>
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24 }}>
        <h1>エラーが発生しました</h1>
        <p style={{ color: '#ef4444' }}>{error?.message || String(error)}</p>
        {error?.digest && <p style={{ color: '#6b7280' }}>digest: {error.digest}</p>}
        <button onClick={() => reset()} style={{ marginTop: 12, padding: '8px 12px', background: '#111827', color: 'white', borderRadius: 6 }}>
          再試行
        </button>
      </body>
    </html>
  )
}
