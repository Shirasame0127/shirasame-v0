import { getSupabase } from '../../supabase'
import { getPublicOwnerUserId } from '../../utils/public-owner'

export async function fetchPublicTagGroups(env: any) {
  const ownerId = getPublicOwnerUserId(env)
  if (!ownerId) return { data: [] }
  const supabase = getSupabase(env)
  try {
    const { data } = await supabase.from('tag_groups').select('name, label, sort_order, created_at, is_immutable').eq('user_id', ownerId).order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })

    // Fetch visibility mappings if table exists. Be tolerant to several possible column names.
    const { data: visRows } = await supabase.from('tag_group_visibility').select('*').eq('user_id', ownerId)

    const visMap: Record<string, string[]> = {}
    if (Array.isArray(visRows)) {
      for (const r of visRows) {
        try {
          // Determine group identifier column
          const groupName = r.group_name || r.group || r.name || r.tag_group || r.groupName || r.target_group || null
          if (!groupName) continue

          // If row provides an array field, use it
          if (Array.isArray(r.visible_when_trigger_tag_ids) && r.visible_when_trigger_tag_ids.length > 0) {
            visMap[groupName] = Array.from(new Set([...(visMap[groupName] || []), ...r.visible_when_trigger_tag_ids.map(String)]))
            continue
          }
          if (Array.isArray(r.trigger_tag_ids) && r.trigger_tag_ids.length > 0) {
            visMap[groupName] = Array.from(new Set([...(visMap[groupName] || []), ...r.trigger_tag_ids.map(String)]))
            continue
          }

          // Fallback: single trigger column per row
          const t = r.trigger_tag_id || r.trigger_tag || r.visible_when || r.visibleWhen || null
          if (t) {
            visMap[groupName] = Array.from(new Set([...(visMap[groupName] || []), String(t)]))
            continue
          }
        } catch (e) { continue }
      }
    }

    const out = (data || []).map((g: any) => {
      const groupName = g.name || g.group || null
      const visible = groupName && visMap[groupName] ? visMap[groupName] : undefined
      const outObj: any = { name: g.name, label: g.label, sortOrder: g.sort_order ?? 0, createdAt: g.created_at }
      if (typeof g.is_immutable !== 'undefined') outObj.isImmutable = !!g.is_immutable
      if (visible && Array.isArray(visible) && visible.length > 0) outObj.visibleWhenTriggerTagIds = visible
      return outObj
    })
    return { data: out }
  } catch (e) {
    return { data: [] }
  }
}
