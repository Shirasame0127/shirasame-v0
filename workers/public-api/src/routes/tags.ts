import { Context } from 'hono'
import { getSupabaseAdmin } from '../lib/supabase'
import type { Env } from '../lib/types'

export async function handleTags(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const supabase = getSupabaseAdmin(env)
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, group, link_url, link_label, user_id, sort_order, created_at')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (error) return c.json({ data: [] })
    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      group: row.group ?? undefined,
      linkUrl: row.link_url ?? undefined,
      linkLabel: row.link_label ?? undefined,
      userId: row.user_id ?? undefined,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    }))
    return c.json({ data: mapped })
  } catch (e) {
    return c.json({ data: [] })
  }
}
