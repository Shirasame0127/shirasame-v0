"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import apiFetch from "@/lib/api-client"
import { X } from "lucide-react"

/**
 * One-shot helper to reorganise the tag taxonomy from the product screen.
 *
 * This is a temporary, self-contained banner: it creates the new category
 * tags, moves four tags into the ジャンル group, and adds a category tag to the
 * sixteen products that lacked one. It runs through the same admin endpoints
 * the UI already uses, so it inherits the logged-in session — no console, no
 * pasting. Idempotent: existing tags and already-applied tags are skipped, so
 * pressing it twice does nothing the second time. Remove the component once the
 * cleanup has been run.
 */
const PLAN = {
  "newCategoryTags": [
    "CPU",
    "マザーボード",
    "グラフィックボード",
    "メモリ",
    "SSD・ストレージ",
    "電源ユニット",
    "PCケース",
    "CPUクーラー",
    "ケースファン",
    "内部ケーブル",
    "ラグ・カーペット",
    "ベッド・寝具",
    "衣類"
  ],
  "moveToGenre": [
    "自作PC関連",
    "sw・sw2関連",
    "小物・ロマン",
    "しらさめグッズ"
  ],
  "productOps": [
    {
      "id": "prod-1769433292792",
      "title": "LIANLI UNI FAN SL INFINITY 120 3Pack",
      "currentTags": [
        "Amazon",
        "自作PC関連",
        "ホワイト系"
      ],
      "add": [
        "ケースファン"
      ]
    },
    {
      "id": "prod-1769432974239",
      "title": "LIANLI UNI FAN SL-INFINITY REVERSE BLADE 120",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "ケースファン"
      ]
    },
    {
      "id": "prod-1769432746941",
      "title": "LIANLI UNI FAN SL INFINITY 140",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "ケースファン"
      ]
    },
    {
      "id": "prod-1769433758730",
      "title": "Strimer Wireless 12V-2x6 12+4PIN",
      "currentTags": [
        "自作PC関連",
        "Amazon"
      ],
      "add": [
        "内部ケーブル"
      ]
    },
    {
      "id": "prod-1769433425920",
      "title": "Strimer Wireless ATX24PIN",
      "currentTags": [
        "自作PC関連",
        "Amazon"
      ],
      "add": [
        "内部ケーブル"
      ]
    },
    {
      "id": "prod-1769435334210",
      "title": "Ryzen 7 9700X",
      "currentTags": [
        "自作PC関連",
        "Amazon"
      ],
      "add": [
        "CPU"
      ]
    },
    {
      "id": "prod-1769436180969",
      "title": "B850 Steel Legend WiFi AMD",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "マザーボード"
      ]
    },
    {
      "id": "prod-1769435781651",
      "title": "GeForce RTX 5070 AMP White 12GB",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "グラフィックボード"
      ]
    },
    {
      "id": "prod-1769435542980",
      "title": "DDR5-6000MHz VENGEANCE RGB",
      "currentTags": [
        "自作PC関連",
        "Amazon"
      ],
      "add": [
        "メモリ"
      ]
    },
    {
      "id": "prod-1769435995245",
      "title": "NV7400 1TB SSD NVMe2.0 M.2 Type 2280 PCIe Gen4×4",
      "currentTags": [
        "自作PC関連",
        "Amazon"
      ],
      "add": [
        "SSD・ストレージ"
      ]
    },
    {
      "id": "prod-1770264691163",
      "title": "MAG A850GL PCIE5 WHITE",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "電源ユニット"
      ]
    },
    {
      "id": "prod-1769435254112",
      "title": "Y70",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "PCケース"
      ]
    },
    {
      "id": "prod-1769432651347",
      "title": "Kraken Elite 360 RGB v2 White",
      "currentTags": [
        "自作PC関連",
        "ホワイト系",
        "Amazon"
      ],
      "add": [
        "CPUクーラー"
      ]
    },
    {
      "id": "prod-1773031301548",
      "title": "ふわサラカーペット",
      "currentTags": [
        "楽天",
        "ホワイト系",
        "ベージュ系"
      ],
      "add": [
        "ラグ・カーペット"
      ]
    },
    {
      "id": "prod-1772977883906",
      "title": "ベッドフレーム",
      "currentTags": [
        "Amazon"
      ],
      "add": [
        "ベッド・寝具"
      ]
    },
    {
      "id": "prod-1767425775547",
      "title": "サメ 寝袋着ぐるみ パジャマ",
      "currentTags": [
        "水色系",
        "Amazon"
      ],
      "add": [
        "衣類"
      ]
    }
  ]
} as {
  newCategoryTags: string[]
  moveToGenre: string[]
  productOps: { id: string; title: string; currentTags: string[]; add: string[] }[]
}

const DONE_KEY = "shirasame.tagSetup.done"

export function TagSetupBanner() {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [hidden, setHidden] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem(DONE_KEY) === "1" } catch { return false }
  })
  const [log, setLog] = useState<string[]>([])

  if (hidden) return null

  const push = (line: string) => setLog((prev) => [...prev, line])

  const run = async () => {
    setBusy(true)
    setLog([])
    try {
      // Current tags, to skip anything already present.
      const tagsJson = await (await apiFetch("/api/tags")).json().catch(() => ({ data: [] }))
      const allTags: any[] = Array.isArray(tagsJson) ? tagsJson : tagsJson.data || []
      const have = new Set(allTags.map((t) => String(t.name)))

      // 1) new category tags
      let created = 0
      for (const name of PLAN.newCategoryTags) {
        if (have.has(name)) continue
        const res = await apiFetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, group: "カテゴリー" }),
        })
        if (res.ok) { created++; push(`タグ作成: ${name}`) }
        else push(`× タグ作成失敗: ${name} (${res.status})`)
        await new Promise((r) => setTimeout(r, 120))
      }

      // 2) move four tags into ジャンル (keep id, change group only)
      const freshJson = await (await apiFetch("/api/tags")).json().catch(() => ({ data: [] }))
      const freshTags: any[] = Array.isArray(freshJson) ? freshJson : freshJson.data || []
      const byName = new Map(freshTags.map((t) => [String(t.name), t]))
      let moved = 0
      for (const name of PLAN.moveToGenre) {
        const t = byName.get(name)
        if (!t) { push(`× 見つからない: ${name}`); continue }
        if (t.group === "ジャンル") { push(`既にジャンル: ${name}`); continue }
        const res = await apiFetch("/api/admin/tags/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: [{ ...t, group: "ジャンル" }] }),
        })
        if (res.ok) { moved++; push(`ジャンルへ移動: ${name}`) }
        else push(`× 移動失敗: ${name} (${res.status})`)
        await new Promise((r) => setTimeout(r, 120))
      }

      // 3) add category tags to products (keep existing tags)
      let updated = 0
      const failed: string[] = []
      for (const op of PLAN.productOps) {
        const cur = Array.isArray(op.currentTags) ? op.currentTags : []
        const next = [...cur]
        for (const tag of op.add) if (!next.includes(tag)) next.push(tag)
        if (next.length === cur.length) continue
        const res = await apiFetch(`/api/admin/products/${op.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: next }),
        })
        if (res.ok) { updated++; push(`付与: ${op.title} → ${op.add.join("、")}`) }
        else { failed.push(op.title); push(`× 付与失敗: ${op.title} (${res.status})`) }
        await new Promise((r) => setTimeout(r, 150))
      }

      toast({
        title: "タグ整理が完了しました",
        description: `作成 ${created} / 移動 ${moved} / 商品更新 ${updated}${failed.length ? ` / 失敗 ${failed.length}` : ""}`,
        variant: failed.length ? "destructive" : undefined,
      })
      if (failed.length === 0) {
        try { localStorage.setItem(DONE_KEY, "1") } catch {}
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "エラー", description: e?.message || "実行に失敗しました" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary/40 bg-accent/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">タグの一括整理</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            カテゴリーに {PLAN.newCategoryTags.length} タグを追加、{PLAN.moveToGenre.length} タグをジャンルへ移動、
            {PLAN.productOps.length} 商品にカテゴリーを付与します（既存タグは保持）。
          </p>
        </div>
        <button
          type="button"
          aria-label="閉じる"
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent"
          onClick={() => setHidden(true)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button onClick={run} disabled={busy}>
          {busy ? "実行中…" : "実行する"}
        </Button>
        <span className="text-xs text-muted-foreground">一度だけ実行すれば十分です</span>
      </div>

      {log.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded border bg-card p-2 text-xs text-muted-foreground">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  )
}
