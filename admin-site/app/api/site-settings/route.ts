import { NextResponse } from 'next/server'

export async function GET() {
  // Minimal stub for local dev. Returns null loading animation.
  return NextResponse.json({ ok: true, data: { loading_animation: null } })
}

export const runtime = 'nodejs'
