import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase'

export async function GET() {
  try {
    const res = await supabaseAdmin.from('amazon_sale_schedules').select('*').order('start_date', { ascending: true })
    if (res.error) {
      console.warn('[api/amazon-sale-schedules] supabase warning', res.error)
      return NextResponse.json({ data: [] })
    }
    return NextResponse.json({ data: res.data || [] })
  } catch (e: any) {
    console.error('[api/amazon-sale-schedules] exception', e)
    return NextResponse.json({ data: [] })
  }
}

