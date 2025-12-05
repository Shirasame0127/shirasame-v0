import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function GET() {
  try {
    // If there's a custom_fonts table, return its rows; otherwise return []
    const res = await supabaseAdmin.from('custom_fonts').select('*')
    if (res.error) {
      // If the table doesn't exist, supabase will error — return empty list instead
      console.warn('[api/custom-fonts] supabase warning', res.error)
      return NextResponse.json({ data: [] })
    }
    return NextResponse.json({ data: res.data || [] })
  } catch (e: any) {
    console.error('[api/custom-fonts] exception', e)
    return NextResponse.json({ data: [] })
  }
}

