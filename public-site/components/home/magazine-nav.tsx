"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Menu, X } from "lucide-react"
import { HOME_VIEWS, type HomeView } from "@/components/home/views"
import { FONT_CHOICES, applyFont, readStoredFont, type FontChoice } from "@/lib/font-choice"

/**
 * Variant B's navigation: a fixed header button that opens a full-screen index.
 *
 * Shaped by what the research says about hidden navigation — NN/g measured a
 * ~21% drop in task completion when primary destinations live behind a
 * hamburger, so B keeps its four surfaces on the page in the index strip and
 * uses this panel only for the deeper lists (individual collections, recipes)
 * plus settings. A full-screen sheet is the recommended pattern once the menu
 * holds a hierarchy rather than a handful of links.
 *
 * Once the page's index strip sticks to the top it absorbs this trigger (see
 * `floatingTriggerHidden`), so only one menu button is ever on screen.
 *
 * Accessibility: `aria-expanded` / `aria-controls` on the trigger, focus moved
 * into the panel on open and returned to the trigger on close, Tab trapped
 * inside while open, and Escape to dismiss.
 */

type Entry = { id: string; label: string }

/**
 * Stable id so other components (the sticky index strip) can point their own
 * trigger at this panel with `aria-controls`. There is only ever one nav per
 * page, so a constant is safe and simpler than threading a generated id around.
 */
export const MAGAZINE_PANEL_ID = "magazine-index-panel"

export default function MagazineNav({
  isOpen,
  onOpenChange,
  view,
  onSelectView,
  collections,
  recipes,
  onSelectAnchor,
  floatingTriggerHidden = false,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  view: HomeView
  onSelectView: (view: HomeView) => void
  collections: Entry[]
  recipes: Entry[]
  onSelectAnchor: (view: HomeView, elementId: string) => void
  /** Fade out the floating trigger while the index strip shows its own. */
  floatingTriggerHidden?: boolean
}) {
  const panelId = MAGAZINE_PANEL_ID
  // Seeded on mount rather than in useState, so the server render and the first
  // client render agree before localStorage is read.
  const [font, setFont] = useState<FontChoice | null>(null)
  useEffect(() => setFont(readStoredFont()), [])

  const chooseFont = useCallback((next: FontChoice) => {
    setFont(next)
    applyFont(next)
  }, [])
  const panelRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      if (e.key !== "Tab") return

      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      root.style.overflow = previousOverflow
      ;(previouslyFocused ?? triggerRef.current)?.focus?.()
    }
  }, [isOpen, close])

  const IndexRow = ({
    label,
    index,
    onClick,
    active,
  }: {
    label: string
    index: number
    onClick: () => void
    active?: boolean
  }) => (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className="group flex w-full items-baseline gap-2 py-2.5 text-left"
      >
        <span
          className={`m-display text-base transition-colors ${
            active ? "text-[var(--m-pink)]" : "text-[var(--m-ink)] group-hover:text-[var(--m-teal)]"
          }`}
        >
          {label}
        </span>
        <span className="mb-1 flex-1 border-b border-dotted border-[var(--m-rule)]" />
        <span className="m-display text-xs tabular-nums text-[var(--m-ink-soft)]">
          {String(index).padStart(2, "0")}
        </span>
      </button>
    </li>
  )

  let counter = 0

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        {/* Only the index trigger lives up here — the wordmark is the masthead's
            job, and repeating it in the corner just competed with it. */}
        <div className="flex h-16 items-center justify-end px-3 sm:px-5">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => onOpenChange(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? "目次を閉じる" : "目次を開く"}
            tabIndex={floatingTriggerHidden ? -1 : undefined}
            aria-hidden={floatingTriggerHidden || undefined}
            className={`pointer-events-auto flex h-12 items-center gap-2 rounded-full border-2 border-[var(--m-rule)] bg-[var(--m-paper)]/90 px-4 backdrop-blur-sm transition-all duration-300 hover:bg-[#eaf7f7] motion-reduce:transition-none ${
              floatingTriggerHidden
                ? "pointer-events-none -translate-y-2 scale-90 opacity-0"
                : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            <Menu className="h-5 w-5 text-[var(--m-ink)]" />
            <span className="m-display text-sm text-[var(--m-ink)]">目次</span>
          </button>
        </div>
      </header>

      {/* Full-screen index. Rendered always so the transition can play out. */}
      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="目次"
        className={`m-paper fixed inset-0 z-[60] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto max-w-2xl px-5 pb-20 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-display text-xs tracking-[0.3em] text-[var(--m-ink-soft)]">CONTENTS</p>
              <p className="m-wordmark text-4xl">目次</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="閉じる"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--m-rule)] bg-white transition-colors hover:bg-[#eaf7f7]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8" aria-label="サイト内の移動">
            <section>
              <h2 className="m-display mb-1 rounded-lg bg-[var(--m-teal)] px-3 py-1.5 text-xs text-white">表示</h2>
              <ul>
                {HOME_VIEWS.map((v) => {
                  counter += 1
                  return (
                    <IndexRow
                      key={v.id}
                      label={v.label}
                      index={counter}
                      active={v.id === view}
                      onClick={() => {
                        onSelectView(v.id)
                        close()
                      }}
                    />
                  )
                })}
              </ul>
            </section>

            {collections.length > 0 && (
              <section className="mt-8">
                <h2 className="m-display mb-1 rounded-lg bg-[var(--m-teal)] px-3 py-1.5 text-xs text-white">
                  コレクション
                </h2>
                <ul>
                  {collections.map((c) => {
                    counter += 1
                    return (
                      <IndexRow
                        key={c.id}
                        label={c.label}
                        index={counter}
                        onClick={() => {
                          onSelectAnchor("collections", `collection-${c.id}`)
                          close()
                        }}
                      />
                    )
                  })}
                </ul>
              </section>
            )}

            {recipes.length > 0 && (
              <section className="mt-8">
                <h2 className="m-display mb-1 rounded-lg bg-[var(--m-teal)] px-3 py-1.5 text-xs text-white">
                  レシピ
                </h2>
                <ul>
                  {recipes.map((r) => {
                    counter += 1
                    return (
                      <IndexRow
                        key={r.id}
                        label={r.label}
                        index={counter}
                        onClick={() => {
                          onSelectAnchor("recipes", `recipe-${r.id}`)
                          close()
                        }}
                      />
                    )
                  })}
                </ul>
              </section>
            )}
          </nav>

          <section className="mt-10 rounded-xl border-2 border-[var(--m-rule)] bg-white p-4">
            <h2 className="m-subheading mb-1 text-sm text-[var(--m-teal)]">見出しの書体</h2>
            <p className="m-label mb-3 text-[11px] text-[var(--m-ink-soft)]">
              このサイトの見出しに使う書体を選べます
            </p>
            <div className="space-y-1">
              {FONT_CHOICES.map((f) => {
                const active = font === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => chooseFont(f.id)}
                    aria-pressed={active}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                      active ? "bg-[#eaf7f7]" : "hover:bg-[#f4fbfb]"
                    }`}
                  >
                    <span className="mt-0.5 w-4 shrink-0 text-[var(--m-teal)]">
                      {active && <Check className="h-4 w-4" aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className="m-subheading block text-sm text-[var(--m-ink)]">{f.label}</span>
                      <span className="m-label block text-[11px] text-[var(--m-ink-soft)]">{f.note}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
