"use client"

import dynamic from "next/dynamic"
import { useAb } from "@/lib/ab"
import { useHomeData } from "@/lib/use-home-data"

/**
 * Home page A/B/C dispatcher.
 *
 * Variant A is self-contained (it keeps its own frozen loader), so it is only
 * imported when it is actually shown. B and C share one `useHomeData` call,
 * which lives in `HomeBC` — that way switching between B and C from the menu
 * swaps the presentation without refetching the catalogue.
 */

const HomeA = dynamic(() => import("@/components/home/home-a"), { ssr: false, loading: () => <Shell /> })
const HomeB = dynamic(() => import("@/components/home/home-b"), { ssr: false, loading: () => <Shell /> })
const HomeC = dynamic(() => import("@/components/home/home-c"), { ssr: false, loading: () => <Shell /> })

/** Neutral placeholder shown before the bucket is known. */
function Shell() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
        aria-label="読み込み中"
      />
    </div>
  )
}

function HomeBC({ variant }: { variant: "b" | "c" }) {
  const data = useHomeData()
  return variant === "b" ? <HomeB data={data} /> : <HomeC data={data} />
}

export default function Page() {
  const { variant, ready } = useAb()

  // `variant` is null on the server and on the very first client render, so the
  // prerendered HTML and the hydrated tree agree before storage is read.
  if (!ready || variant === null) return <Shell />
  if (variant === "a") return <HomeA />
  return <HomeBC variant={variant} />
}
