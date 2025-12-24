// Lightweight morphological-like tokenizer for Japanese/Latin text.
// This is a heuristic splitter (script-run based) to extract candidate tokens
// for client-side search enhancement. Not a full morphological analyzer,
// but effective for splitting mixed text like "白いデスク環境" -> ["デスク","環境"].

export function tokenizeJapanese(text?: string): string[] {
  if (!text) return []
  const s = String(text).trim()
  if (!s) return []
  // split into script runs: Kanji (Han), Hiragana, Katakana, Latin/Numbers
  const re = /\p{Script=Han}+|\p{Script=Hiragana}+|\p{Script=Katakana}+|[A-Za-z0-9]+/gu
  const runs = Array.from(s.matchAll(re)).map((m) => m[0])

  // Post-process: drop very short runs (length 1) unless Katakana or Latin and length>=2
  const filtered = runs.filter((r) => {
    if (!r) return false
    // count characters (works for multibyte)
    const len = [...r].length
    // keep runs with length >= 2
    if (len >= 2) return true
    // allow single-letter Latin tokens? skip
    return false
  })

  // Normalize tokens to lower-case for Latin; keep Japanese as-is
  const norm = filtered.map((t) => {
    if (/^[A-Za-z0-9]+$/.test(t)) return t.toLowerCase()
    return t
  })
  // dedupe preserving order
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of norm) {
    if (!seen.has(t)) { seen.add(t); out.push(t) }
  }
  return out
}

export default { tokenizeJapanese }
