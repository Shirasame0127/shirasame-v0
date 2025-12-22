import type { PublicRecipePin } from '../types/recipe'

export function normalizePin(raw: any): PublicRecipePin {
  const clamp = (v: number) => Math.min(100, Math.max(0, v))

  return {
    id: String(raw.id ?? ''),
    product_id: String(raw.product_id ?? ''),
    dot_x_percent: clamp(Number(raw.dot_x_percent ?? 0)),
    dot_y_percent: clamp(Number(raw.dot_y_percent ?? 0)),
    dot_size_percent: Number(raw.dot_size_percent ?? 1),
    tag_text: raw.tag_text ?? null,
  }
}

export default normalizePin
