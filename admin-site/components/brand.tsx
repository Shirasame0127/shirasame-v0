"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Shirasame brand mark — a four-point sparkle ("star") with gently concave
 * sides, echoing the hand-drawn star motif of the brand. Uses currentColor so
 * it inherits text color; pass `variant="outline"` for the fine line-art look.
 */
export function StarMark({
  className,
  size,
  variant = "solid",
  strokeWidth = 1.25,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number
  variant?: "solid" | "outline"
  strokeWidth?: number
}) {
  const d = "M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z"
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("inline-block", className)}
      {...props}
    >
      <path
        d={d}
        fill={variant === "solid" ? "currentColor" : "none"}
        stroke={variant === "outline" ? "currentColor" : "none"}
        strokeWidth={variant === "outline" ? strokeWidth : undefined}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Shirasame wordmark: the brand name set in the editorial display serif with a
 * small sparkle. `subtitle` renders a tracked monospace caption beneath it
 * (liner-note style).
 */
export function Wordmark({
  className,
  subtitle,
  compact = false,
}: {
  className?: string
  subtitle?: string
  compact?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <StarMark size={compact ? 18 : 22} className="text-primary shrink-0" />
      <div className="leading-none">
        <div
          className={cn(
            "font-display tracking-tight text-foreground",
            compact ? "text-lg" : "text-xl",
          )}
        >
          Shirasame
        </div>
        {subtitle ? (
          <div className="label-mono mt-1">{subtitle}</div>
        ) : null}
      </div>
    </div>
  )
}
