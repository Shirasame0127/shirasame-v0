import { Context } from 'hono'
import { getSupabaseAdmin } from '../lib/supabase'
import { getOwnerUserId } from '../lib/publicMode'
import type { Env } from '../lib/types'

export async function handleTagGroups(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const supabase = getSupabaseAdmin(env)
  try {
    const ownerId = await getOwnerUserId(env)
    if (!ownerId) return c.json({ data: [] })
    const res = await supabase
      .from('tag_groups')
      .select('name, label, sort_order, created_at, user_id')
      .eq('user_id', ownerId)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (res.error) {
      const msg = String(res.error.message || '')
      if (msg.includes('user_id') || msg.includes('column') || msg.includes('does not exist')) {
        const fb = await supabase
          .from('tag_groups')
          .select('name, label, sort_order, created_at')
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })
        return c.json({ data: fb.data || [] })
      }
      return c.json({ data: [] })
    }
    return c.json({ data: res.data || [] })
  } catch (e) {
    return c.json({ data: [] })
  }
}
