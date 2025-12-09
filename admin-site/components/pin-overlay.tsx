"use client"

import React, { useRef, useEffect } from "react"
import { getPublicImageUrl } from "@/lib/image-url"

type Pin = any

export function PinOverlay({
  pins,
  imageDataUrl,
  imageUrl,
  onPointerStart,
  onClickPin,
}: {
  pins: Pin[]
  imageDataUrl?: string
  imageUrl?: string
  onPointerStart?: (pinId: string, part: "dot" | "tag", ev: PointerEvent) => void
  onClickPin?: (pinId: string) => void
}) {
  const areaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {}
  }, [])

  const raw = imageUrl || imageDataUrl || null
  const normalized = getPublicImageUrl(raw) || raw || "/placeholder.svg"

  return (
    <div ref={areaRef} className="relative w-full">
      <img src={normalized} alt="recipe" className="w-full h-auto object-contain rounded-md" />

      {pins.map((pin: any) => {
        const dotStyle: React.CSSProperties = {
          left: `${pin.dotXPercent}%`,
          top: `${pin.dotYPercent}%`,
          transform: "translate(-50%, -50%)",
          position: "absolute",
          cursor: "grab",
          zIndex: 40,
        }

        const tagStyle: React.CSSProperties = {
          left: `${pin.tagXPercent}%`,
          top: `${pin.tagYPercent}%`,
          transform: "translate(-50%, -50%)",
          position: "absolute",
          cursor: "grab",
          zIndex: 50,
        }

        return (
          <React.Fragment key={pin.id}>
            <div
              className="absolute"
              style={dotStyle}
              onPointerDown={(e) => {
                ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
                onPointerStart?.(pin.id, "dot", e as unknown as PointerEvent)
              }}
              onClick={() => onClickPin?.(pin.id)}
            >
              <div
                style={{
                  width: `${(pin.dotSizePercent || 2) * 2}px`,
                  height: `${(pin.dotSizePercent || 2) * 2}px`,
                  backgroundColor: pin.dotColor || "#fff",
                  borderRadius: pin.dotShape === "circle" ? "50%" : "4px",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.15)",
                }}
              />
            </div>

            <div
              className="absolute"
              style={tagStyle}
              onPointerDown={(e) => {
                ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
                onPointerStart?.(pin.id, "tag", e as unknown as PointerEvent)
              }}
              onClick={() => onClickPin?.(pin.id)}
            >
              <div style={{ pointerEvents: "none", zIndex: 60 }}>{pin.tagDisplayText || pin.tagText || "タグ"}</div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
