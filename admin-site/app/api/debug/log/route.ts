import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    console.log('[api/debug/log]', body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/debug/log] error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
