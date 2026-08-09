"use client"

import { Check } from "lucide-react"
import { useAb, VARIANTS, VARIANT_DESCRIPTIONS, VARIANT_LABELS, type Variant } from "@/lib/ab"

/**
 * Lets a visitor move between the A/B/C home page designs.
 *
 * Rendered inside the hamburger menu for variants A and B, and inside variant
 * C's own menu panel — every bucket must offer a way back out, or a visitor
 * assigned to a design they dislike has no escape.
 *
 * Picking a design here marks the bucket as overridden, so the visitor stays on
 * their choice on later visits and their events are still attributed to the
 * variant they actually saw.
 */
export function AbSwitcher({ className }: { className?: string }) {
  const { variant, ready, isOverridden, setVariant } = useAb()
  if (!ready || variant === null) return null

  return (
    <section className={className} aria-label="表示デザインの切り替え">
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">表示デザイン</h4>
      <div className="space-y-1">
        {VARIANTS.map((v: Variant) => {
          const active = v === variant
          return (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              aria-pressed={active}
              className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                active ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <span className="mt-0.5 w-4 shrink-0">
                {active && <Check className="h-4 w-4" aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{VARIANT_LABELS[v]}</span>
                <span className="block text-xs text-muted-foreground">{VARIANT_DESCRIPTIONS[v]}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 px-2 text-[11px] leading-relaxed text-muted-foreground">
        {isOverridden ? "あなたが選んだ表示です。" : "自動で選ばれた表示です。"}いつでも切り替えられます。
      </p>
    </section>
  )
}
