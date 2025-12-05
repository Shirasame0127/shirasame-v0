"use client"

import React, { useRef, useState, useEffect } from "react"
import { PinOverlay } from "./pin-overlay"
import { PinDetailPanel } from "./pin-detail-panel"
import { db } from "@/lib/db/storage"

type Pin = any

export function PinEditor({
  recipeId,
  imageDataUrl,
  imageUrl,
  imageWidth,
  imageHeight,
  pins,
  onPinsChange,
}: {
  recipeId: string
  imageDataUrl?: string
  imageUrl?: string
  imageWidth: number
  imageHeight: number
  pins: Pin[]
  onPinsChange: (pins: Pin[]) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef<{ pinId: string; part: "dot" | "tag" } | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const drag = draggingRef.current
      if (!drag) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.width) * 100 // use width for percent scale
      onPinsChange(
        pins.map((p) => (p.id === drag.pinId ? { ...p, [drag.part === "dot" ? "dotXPercent" : "tagXPercent"]: Math.max(0, Math.min(100, x)), [drag.part === "dot" ? "dotYPercent" : "tagYPercent"]: Math.max(0, Math.min(100, y)) } : p))
      )
    }

    function onPointerUp() {
      draggingRef.current = null
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins])

  function handlePointerStart(pinId: string, part: "dot" | "tag", ev: PointerEvent) {
    draggingRef.current = { pinId, part }
    setSelectedPinId(pinId)
  }

  function handleSelectPin(pinId: string) {
    setSelectedPinId(pinId)
  }

  function updateSelectedPin(updates: any) {
    if (!selectedPinId) return
    const next = pins.map((p) => (p.id === selectedPinId ? { ...p, ...updates } : p))
    onPinsChange(next)
    // persist to cache via db helper (best-effort)
    try {
      db.recipePins.updateAll(recipeId, next)
    } catch (e) {
      console.warn("db.recipePins.updateAll failed", e)
    }
  }

  function deleteSelectedPin() {
    if (!selectedPinId) return
    const next = pins.filter((p) => p.id !== selectedPinId)
    onPinsChange(next)
    try {
      db.recipePins.updateAll(recipeId, next)
    } catch (e) {
      console.warn("db.recipePins.updateAll failed", e)
    }
    setSelectedPinId(null)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full">
        <PinOverlay pins={pins} imageDataUrl={imageDataUrl} imageUrl={imageUrl} onPointerStart={handlePointerStart} onClickPin={handleSelectPin} />
      </div>

      <div className="mt-3">
        <PinDetailPanel pin={pins.find((p) => p.id === selectedPinId) || null} onChange={updateSelectedPin} onDelete={deleteSelectedPin} />
      </div>
    </div>
  )
}
