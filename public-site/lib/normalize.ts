// Lightweight normalization helpers for search
export function normalizeForSearch(raw?: any): string {
  if (raw === null || typeof raw === 'undefined') return ''
  let s = String(raw)
  try {
    // NFKC: compatibility composition — convert fullwidth to halfwidth etc.
    if (String.prototype.normalize) s = s.normalize('NFKC')
  } catch {}
  s = s.toLowerCase()
  // convert katakana to hiragana (basic range)
  s = katakanaToHiragana(s)
  // remove unwanted chars but keep CJK, hiragana, katakana, ascii letters/numbers and spaces
  try {
    s = s.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{L}\p{N}\s]/gu, ' ')
  } catch {
    s = s.replace(/[^\w\s\u3000-\u30FF\u4E00-\u9FFF]/g, ' ')
  }
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function katakanaToHiragana(str: string): string {
  // map Katakana U+30A1..U+30F6 to Hiragana by subtracting 0x60 where applicable
  const A = [] as string[]
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c >= 0x30A1 && c <= 0x30F6) {
      A.push(String.fromCharCode(c - 0x60))
    } else {
      A.push(String.fromCharCode(c))
    }
  }
  return A.join('')
}

export default { normalizeForSearch }
