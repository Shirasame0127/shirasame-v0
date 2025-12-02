import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/api'

export async function GET() {
  const payload: ApiResponse<any[]> = { data: [] }
  return NextResponse.json(payload)
}
