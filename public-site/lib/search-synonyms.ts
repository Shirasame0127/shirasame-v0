// Simple synonym expansion utility used by the client-side gallery search.
// Add pairs here to expand tokens during client-side matching.
export const SYNONYMS: Record<string, string[]> = {
  pc: ['computer', 'パソコン'],
  laptop: ['notebook'],
  amazon: ['アマゾン'],
  keyboard: ['kbd', 'キーボード'],
}

export function expandTokens(tokens: string[] | string): string[] {
  const arr = Array.isArray(tokens) ? tokens : [tokens]
  const out: string[] = []
  for (const t0 of arr) {
    const t = String(t0 || '').toLowerCase().trim()
    if (!t) continue
    out.push(t)
    const s = SYNONYMS[t]
    if (Array.isArray(s)) {
      for (const x of s) {
        if (!x) continue
        out.push(String(x).toLowerCase())
      }
    }
  }
  // unique
  return Array.from(new Set(out))
}

export default { SYNONYMS, expandTokens }
