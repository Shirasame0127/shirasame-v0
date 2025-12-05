"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WEB_FONTS, getFontsByCategory } from "@/lib/fonts/web-fonts"
import { db } from "@/lib/db/storage"
import { CustomFontUploader } from "./custom-font-uploader"

type FontValue = { family: string; weight?: string }

export function FontManager({
  value,
  onChange,
}: {
  value?: FontValue
  onChange?: (v: FontValue) => void
}) {
  const [customFonts, setCustomFonts] = useState<any[]>([])

  useEffect(() => {
    loadCustom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCustom() {
    try {
      const cf = await db.customFonts.getAll()
      setCustomFonts(cf || [])
    } catch (e) {
      console.warn(e)
    }
  }

  // Group fonts by category for UI display
  const categories = {
    japanese: WEB_FONTS.filter((f) => f.category === 'japanese'),
    english: WEB_FONTS.filter((f) => f.category === 'english'),
    all: WEB_FONTS,
  }

  return (
    <div>
      <Label className="text-sm font-medium">フォント</Label>
      <div className="mt-2">
        <ScrollArea className="max-h-40">
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(categories).map(([cat, fonts]) => (
              <div key={cat}>
                <div className="text-xs text-muted-foreground mb-1">{cat}</div>
                <div className="flex flex-wrap gap-2">
                  {fonts.map((f: any) => (
                    <button
                      key={f.family}
                      className={`px-2 py-1 border rounded text-sm ${
                        value?.family === f.family ? "border-primary" : ""
                      }`}
                      onClick={() => onChange?.({ family: f.family, weight: "normal" })}
                      type="button"
                    >
                      {f.family}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {customFonts.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">カスタムフォント</div>
                <div className="flex flex-wrap gap-2">
                  {customFonts.map((cf) => (
                    <button
                      key={cf.id}
                      className={`px-2 py-1 border rounded text-sm ${
                        value?.family === cf.family ? "border-primary" : ""
                      }`}
                      onClick={() => onChange?.({ family: cf.family, weight: cf.weight || "normal" })}
                      type="button"
                    >
                      {cf.family}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-3">
        <CustomFontUploader
          onUploaded={async () => {
            await loadCustom()
          }}
        />
      </div>

      <div className="mt-3">
        <Button size="sm" variant="ghost" onClick={() => onChange?.({ family: "system-ui", weight: "normal" })}>
          デフォルトに戻す
        </Button>
      </div>
    </div>
  )
}
