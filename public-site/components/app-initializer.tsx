"use client"

import { useEffect } from "react"

/**
 * Publishes the classic-scrollbar width as `--sbw` on <html>.
 *
 * The full-bleed gallery breakout needs the real viewport width. `100vw`
 * includes the scrollbar, so on platforms with classic (space-taking)
 * scrollbars the breakout overflowed horizontally, which is why the page used
 * to force `overflow-x: hidden` on <body> — and that in turn broke every
 * `position: sticky` descendant. Measuring the gutter lets the breakout be
 * exact, so no clipping hack is needed.
 *
 * macOS overlay scrollbars report 0, which is correct there.
 */
export function AppInitializer() {
  useEffect(() => {
    const root = document.documentElement
    const measure = () => {
      const sbw = Math.max(0, window.innerWidth - root.clientWidth)
      root.style.setProperty("--sbw", `${sbw}px`)
    }

    measure()

    let raf = 0
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener("resize", onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return null
}
