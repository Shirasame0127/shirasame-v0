"use client"

/**
 * Reader-selectable heading typeface.
 *
 * The choice is stamped as `data-font` on <html>; globals.css redefines
 * `--m-title` per value, and every heading class reads that variable. The
 * wordmark is deliberately excluded — it is the site's mark, not body chrome,
 * and stays on its own face whatever is picked here.
 */

export const FONT_CHOICES = [
  { id: "oswald", label: "Oswald", note: "細く高さのある欧文" },
  { id: "shikaku", label: "しかくふと", note: "同梱の角ゴシック。ロゴと同じ書体" },
  { id: "round", label: "丸ゴシック", note: "やわらかい印象。既定の書体" },
  { id: "mincho", label: "明朝", note: "雑誌の本文見出しらしい佇まい" },
] as const

export type FontChoice = (typeof FONT_CHOICES)[number]["id"]

export const DEFAULT_FONT: FontChoice = "round"

const STORAGE_KEY = "shirasame.font"

export function isFontChoice(v: unknown): v is FontChoice {
  return typeof v === "string" && FONT_CHOICES.some((f) => f.id === v)
}

export function readStoredFont(): FontChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return isFontChoice(v) ? v : DEFAULT_FONT
  } catch {
    return DEFAULT_FONT
  }
}

export function applyFont(choice: FontChoice) {
  try {
    document.documentElement.setAttribute("data-font", choice)
    localStorage.setItem(STORAGE_KEY, choice)
  } catch {}
}

/** Runs before first paint so the chosen face is in place, with no flash. */
export const FONT_BOOTSTRAP_SCRIPT = `(function(){try{
var v=localStorage.getItem('${STORAGE_KEY}');
if(v!=='oswald'&&v!=='shikaku'&&v!=='round'&&v!=='mincho')v='${DEFAULT_FONT}';
document.documentElement.setAttribute('data-font',v);
}catch(e){document.documentElement.setAttribute('data-font','${DEFAULT_FONT}')}})();`
