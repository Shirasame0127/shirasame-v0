import { NextResponse } from 'next/server'

export async function GET() {
  // Minimal stub for local dev: no profile image
  return NextResponse.json({ ok: true, data: { profileImage: null } })
}

export const runtime = 'nodejs'
