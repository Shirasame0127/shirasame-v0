import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Import/seeding from local mock-data is disabled by design.
// The app should use Supabase / migrations for seeding. Keep this
// endpoint intentionally inert to avoid importing mock files.

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Import from local mock-data is disabled. Use migrations or Supabase seeding." }, { status: 403 })
}

export const GET = () => NextResponse.json({ ok: true, info: "Import endpoint disabled" })
