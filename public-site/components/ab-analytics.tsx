"use client"

import { useEffect, useRef } from "react"
import { useAb, trackAb } from "@/lib/ab"

/**
 * Variant-agnostic measurement.
 *
 * Every metric the A/B/C comparison depends on is captured here rather than
 * inside the variants, for two reasons: variant A is frozen (instrumenting it
 * would mean editing the control), and identical measurement code guarantees
 * the three buckets are counted the same way.
 *
 * Emitted events, all stamped with `ab_variant`:
 *   - `outbound_click` — any click that leaves the site. Affiliate links are
 *     the revenue event, and they are plain <a> tags in all three variants.
 *   - `scroll_depth`   — 25/50/75/100% milestones, once each per page view.
 *
 * Variants B and C additionally emit `product_open`; that one is not
 * comparable against A and should be read as a B-vs-C signal only.
 */
const DEPTHS = [25, 50, 75, 100] as const

export function AbAnalytics() {
  const { variant, ready } = useAb()
  const variantRef = useRef<string | null>(null)
  variantRef.current = variant

  useEffect(() => {
    if (!ready) return

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!anchor) return

      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin === window.location.origin) return

      trackAb("outbound_click", {
        ab_variant: variantRef.current || "unknown",
        link_url: url.href,
        link_host: url.hostname,
        link_text: (anchor.textContent || "").trim().slice(0, 80),
      })
    }

    // Capture phase: variants call preventDefault/stopPropagation on some
    // handlers, and the click must be counted regardless.
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    const fired = new Set<number>()

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      for (const depth of DEPTHS) {
        if (pct >= depth && !fired.has(depth)) {
          fired.add(depth)
          trackAb("scroll_depth", { ab_variant: variantRef.current || "unknown", percent_scrolled: depth })
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [ready])

  return null
}
