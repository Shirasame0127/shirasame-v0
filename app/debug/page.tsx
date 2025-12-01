export const revalidate = 0

export default function DebugPage() {
  const info = {
    ts: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN || null,
      NODE_ENV: process.env.NODE_ENV || null,
    },
  }
  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Debug</h1>
      <p>Server Component is rendering.</p>
      <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
        {JSON.stringify(info, null, 2)}
      </pre>
      <p>
        Health: <a href="/api/health" style={{ color: '#2563eb' }}>GET /api/health</a>
      </p>
    </main>
  )
}
