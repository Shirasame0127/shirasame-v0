// Lightweight morphological tokenizer with optional kuromoji dynamic import.
// Falls back to a simple heuristic tokenizer (CJK / ASCII word extraction + n-grams).

export async function tokenize(text?: string): Promise<string[]> {
  if (!text && text !== 0) return []
  const s = String(text)
  // try kuromoji if available
  try {
    // Dynamic import may fail in typical browser setups if kuromoji isn't bundled.
    const kuromoji = await import('kuromoji')
    if (kuromoji && kuromoji.builder) {
      // Attempt to build tokenizer with default dicPath; in many setups this will fail
      // but we try and if it does, fallback to simple tokenizer.
      return new Promise((resolve) => {
        try {
          const builder = kuromoji.builder({ dicPath: '/node_modules/kuromoji/dict/' })
          builder.build((err: any, tokenizer: any) => {
            if (err || !tokenizer) return resolve(simpleTokenize(s))
            try {
              const toks = tokenizer.tokenize(s || '') || []
              const out = toks.map((t: any) => (t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form)).filter(Boolean).map((x: any) => String(x).toLowerCase())
              resolve(Array.from(new Set(out)))
            } catch (e) { resolve(simpleTokenize(s)) }
          })
        } catch (e) { resolve(simpleTokenize(s)) }
      })
    }
  } catch (e) {
    // ignore, fallback
  }

  return simpleTokenize(s)
}

function simpleTokenize(s: string): string[] {
  // normalize
  let t = s.normalize ? s.normalize('NFKD') : s
  t = t.toLowerCase()
  // extract CJK runs (kanji/kana) and ASCII words
  const cjkRe = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu
  const asciiRe = /[a-z0-9]+/gi
  const tokens: string[] = []
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = cjkRe.exec(t)) !== null) {
    const w = m[0].trim()
    if (w && !seen.has(w)) { tokens.push(w); seen.add(w) }
    // also slice into bigrams to help partial matches
    for (let i = 0; i < w.length - 1; i++) {
      const bg = w.slice(i, i + 2)
      if (!seen.has(bg)) { tokens.push(bg); seen.add(bg) }
    }
  }
  while ((m = asciiRe.exec(t)) !== null) {
    const w = m[0].trim()
    if (w && !seen.has(w)) { tokens.push(w); seen.add(w) }
    // add stem-like prefix
    if (w.length > 4) {
      const p = w.slice(0, 4)
      if (!seen.has(p)) { tokens.push(p); seen.add(p) }
    }
  }
  // fallback: split on spaces
  if (tokens.length === 0) {
    t.split(/\s+/).map((x) => x.trim()).filter(Boolean).forEach((x) => { if (!seen.has(x)) { tokens.push(x); seen.add(x) } })
  }
  return tokens
}

export default { tokenize }
