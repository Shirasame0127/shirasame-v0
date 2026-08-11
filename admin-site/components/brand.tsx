"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Shirasame brand mark — three tapering strokes reading as rain, after 白雨
 * ("a passing shower"). Matches the mark the public site uses as its icon, so
 * the console and the site carry the same identity.
 *
 * Exported as `StarMark` as well, since call sites across the admin still use
 * that name from when the mark was a four-point sparkle.
 */
export function BrandMark({
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
  const strokes = [
    "M7 2 C8 8 7 13 3.5 19 C6 13 6 8 7 2 Z",
    "M12.5 0.5 C13.5 7 12.5 13 8.5 21 C11 13 11.5 7 12.5 0.5 Z",
    "M18 3 C19 8 18 13 14.5 19 C17 13 17 8 18 3 Z",
  ]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("inline-block", className)}
      {...props}
    >
      {strokes.map((d) => (
        <path
          key={d}
          d={d}
          fill={variant === "solid" ? "currentColor" : "none"}
          stroke={variant === "outline" ? "currentColor" : "none"}
          strokeWidth={variant === "outline" ? strokeWidth : undefined}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

export const StarMark = BrandMark

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
      <BrandMark size={compact ? 18 : 22} className="text-primary shrink-0" />
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
