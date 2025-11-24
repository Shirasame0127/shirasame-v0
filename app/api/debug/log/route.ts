export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    // Log to server terminal so developer can see client-side events
    try {
      // Use a concise prefix so it's easy to find in logs
      console.log('[client-debug-log]', JSON.stringify(body))
    } catch (e) {
      // fallback
      console.log('[client-debug-log] (unserializable payload)')
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('[client-debug-log] error', e)
    return new Response(null, { status: 500 })
  }
}
