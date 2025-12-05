"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function PinDetailPanel({
  pin,
  onChange,
  onDelete,
}: {
  pin: any | null
  onChange: (updates: any) => void
  onDelete: () => void
}) {
  if (!pin) return <div className="text-sm text-muted-foreground">ピンが選択されていません</div>

  return (
    <div className="space-y-3">
      <Label className="text-sm">タグテキスト</Label>
      <Input value={pin.tagDisplayText || pin.tagText || ""} onChange={(e) => onChange({ tagDisplayText: e.target.value })} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-sm">点サイズ (%)</Label>
          <Input type="number" value={pin.dotSizePercent} onChange={(e) => onChange({ dotSizePercent: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-sm">フォントサイズ (%)</Label>
          <Input type="number" value={pin.tagFontSizePercent} onChange={(e) => onChange({ tagFontSizePercent: Number(e.target.value) })} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onDelete()} variant="destructive">
          削除
        </Button>
      </div>
    </div>
  )
}
