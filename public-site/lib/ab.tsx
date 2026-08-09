"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

/**
 * Which home page design is served.
 *
 * Variant B is now the released design: every visitor gets it. The A/B/C split
 * test is over, so there is no random assignment and no in-app switcher — the
 * older designs remain reachable only by typing `?ab=a` or `?ab=c`, kept as an
 * internal comparison aid rather than something visitors can stumble into.
 *
 * In a production build the override is compiled out entirely: visitors always
 * get `DEFAULT_VARIANT`, and neither `?ab=` nor a bucket left in localStorage by
 * an earlier visit can change that. The older designs stay in the tree and stay
 * reachable in development, so they can still be compared side by side without
 * ever being reachable by a visitor.
 *
 * Resolution order (development only):
 *   1. `?ab=a|b|c` in the URL — sticks for that browser.
 *   2. A bucket stored by an earlier `?ab=` visit.
 *   3. `DEFAULT_VARIANT`.
 */

export const VARIANTS = ["a", "b", "c"] as const
export type Variant = (typeof VARIANTS)[number]

export const VARIANT_LABELS: Record<Variant, string> = {
  a: "現在の表示",
  b: "新しい表示",
  c: "リニューアル版",
}

export const VARIANT_DESCRIPTIONS: Record<Variant, string> = {
  a: "これまでどおりの見た目です",
  b: "読み込みと一覧を改善した版",
  c: "デザインを一新した版",
}

const STORAGE_KEY = "shirasame.ab.variant"
const OVERRIDE_KEY = "shirasame.ab.override"

function isVariant(v: unknown): v is Variant {
  return typeof v === "string" && (VARIANTS as readonly string[]).includes(v)
}

/** The released design. This is what every visitor gets. */
export const DEFAULT_VARIANT: Variant = "b"

/**
 * Whether `?ab=` and stored buckets are honoured. False in production builds,
 * so the released site can only ever render `DEFAULT_VARIANT`.
 */
const ALLOW_VARIANT_OVERRIDE = process.env.NODE_ENV !== "production"

/**
 * GA4 is only injected in production (see app/layout.tsx), so this is a no-op
 * during local development. Never throws.
 */
export function trackAb(event: string, params?: Record<string, unknown>) {
  try {
    const gtag = (window as any).gtag
    if (typeof gtag === "function") gtag("event", event, params || {})
  } catch {}
}

function setGaUserProperty(variant: Variant) {
  try {
    const gtag = (window as any).gtag
    if (typeof gtag === "function") gtag("set", "user_properties", { ab_variant: variant })
  } catch {}
}

type AbContextValue = {
  /** `null` until the client has read storage — render a neutral shell meanwhile. */
  variant: Variant | null
  /** True once the bucket is known. */
  ready: boolean
  /** True when the visitor (or a `?ab=` link) picked the bucket explicitly. */
  isOverridden: boolean
  setVariant: (next: Variant) => void
}

const AbContext = createContext<AbContextValue>({
  variant: null,
  ready: false,
  isOverridden: false,
  setVariant: () => {},
})

/**
 * Runs before first paint so CSS can branch on `[data-ab]` without a flash.
 * React still resolves the bucket in `AbProvider` — this only paints.
 */
export const AB_BOOTSTRAP_SCRIPT = `(function(){try{
var v='${DEFAULT_VARIANT}';
if(${ALLOW_VARIANT_OVERRIDE}){
var p=new URLSearchParams(location.search).get('ab');
var s=localStorage.getItem('${STORAGE_KEY}');
var c=(p==='a'||p==='b'||p==='c')?p:s;
if(c==='a'||c==='b'||c==='c')v=c;
}
document.documentElement.setAttribute('data-ab',v);
}catch(e){document.documentElement.setAttribute('data-ab','${DEFAULT_VARIANT}')}})();`

export function AbProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<Variant | null>(null)
  const [isOverridden, setIsOverridden] = useState(false)
  const variantRef = useRef<Variant | null>(null)

  const apply = useCallback((next: Variant) => {
    variantRef.current = next
    setVariantState(next)
    try {
      document.documentElement.setAttribute("data-ab", next)
    } catch {}
    setGaUserProperty(next)
  }, [])

  useEffect(() => {
    if (!ALLOW_VARIANT_OVERRIDE) {
      setIsOverridden(false)
      apply(DEFAULT_VARIANT)
      return
    }

    let stored: string | null = null
    let overridden = false
    try {
      stored = localStorage.getItem(STORAGE_KEY)
      overridden = localStorage.getItem(OVERRIDE_KEY) === "1"
    } catch {}

    let forced: string | null = null
    try {
      forced = new URLSearchParams(window.location.search).get("ab")
    } catch {}

    if (isVariant(forced)) {
      try {
        localStorage.setItem(STORAGE_KEY, forced)
        localStorage.setItem(OVERRIDE_KEY, "1")
      } catch {}
      setIsOverridden(true)
      apply(forced)
      return
    }

    if (isVariant(stored)) {
      setIsOverridden(overridden)
      apply(stored)
      return
    }

    setIsOverridden(false)
    apply(DEFAULT_VARIANT)
  }, [apply])

  const setVariant = useCallback(
    (next: Variant) => {
      const from = variantRef.current
      if (from === next) return
      try {
        localStorage.setItem(STORAGE_KEY, next)
        localStorage.setItem(OVERRIDE_KEY, "1")
      } catch {}
      setIsOverridden(true)
      apply(next)
      trackAb("ab_switched", { ab_variant: next, ab_variant_from: from || "unknown" })
    },
    [apply],
  )

  const value = useMemo<AbContextValue>(
    () => ({ variant, ready: variant !== null, isOverridden, setVariant }),
    [variant, isOverridden, setVariant],
  )

  return <AbContext.Provider value={value}>{children}</AbContext.Provider>
}

export function useAb() {
  return useContext(AbContext)
}
