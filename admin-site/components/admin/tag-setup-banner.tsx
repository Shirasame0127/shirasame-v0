"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import apiFetch from "@/lib/api-client"
import { X } from "lucide-react"

/**
 * Temporary one-tap helpers for reorganising the tag taxonomy, run from the
 * product screen. Each task creates any missing tags in a target group and adds
 * a tag to a set of products, keeping every existing tag. All idempotent —
 * running twice does nothing the second time. Remove this component once the
 * cleanup is done.
 *
 * Everything goes through the same admin endpoints the UI already uses, so it
 * inherits the logged-in session: no console, no pasting.
 */

type Op = { id: string; title: string; currentTags: string[]; add: string[] }
type Task = {
  key: string
  label: string
  summary: string
  group: string
  newTags: string[]
  ops: Op[]
}

const TASKS: Task[] = [
  {
    "key": "pc-parts",
    "label": "PCパーツを分類",
    "summary": "カテゴリーに13個追加し、16商品へ付与（自作PC関連はジャンルへ移動済み）",
    "group": "カテゴリー",
    "newTags": [
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
    "ops": [
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
  },
  {
    "key": "kb-size",
    "label": "キーボードのサイズを付与",
    "summary": "サイズ4種を作成し、キーボード8台へ付与（キーボード選択時のみ表示）",
    "group": "キーボードのサイズ",
    "newTags": [
      "フルサイズ",
      "98キー",
      "TKL",
      "75%"
    ],
    "ops": [
      {
        "id": "prod-1773755554716",
        "title": "TH108 JIS",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "水色系",
          "Amazon"
        ],
        "add": [
          "フルサイズ"
        ]
      },
      {
        "id": "prod-1767686559374",
        "title": "YUNZII X98",
        "currentTags": [
          "キーボード",
          "透明系",
          "Amazon"
        ],
        "add": [
          "98キー"
        ]
      },
      {
        "id": "prod-1771304501417",
        "title": "B87 BlueHeart",
        "currentTags": [
          "キーボード",
          "水色系",
          "Amazon"
        ],
        "add": [
          "TKL"
        ]
      },
      {
        "id": "prod-1771296894475",
        "title": "TH87 JIS",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "水色系",
          "公式",
          "Amazon"
        ],
        "add": [
          "TKL"
        ]
      },
      {
        "id": "prod-1771297600723",
        "title": "LUMA 84",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "Amazon"
        ],
        "add": [
          "75%"
        ]
      },
      {
        "id": "prod-1770100112158",
        "title": "B75 PRO MAX",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "ベージュ系",
          "Amazon"
        ],
        "add": [
          "75%"
        ]
      },
      {
        "id": "prod-1768111510299",
        "title": "YUNZII C75",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "水色系",
          "Amazon"
        ],
        "add": [
          "75%"
        ]
      },
      {
        "id": "prod-1768040243173",
        "title": "GravaStar Mercury K1 ＆ XVX White ice crystal jelly",
        "currentTags": [
          "キーボード",
          "ホワイト系",
          "アリエク",
          "Amazon"
        ],
        "add": [
          "75%"
        ]
      }
    ]
  }
]

export function TagSetupBanner() {
  const { toast } = useToast()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("shirasame.tagSetup.v2") || "{}")
    } catch {
      return {}
    }
  })
  const [hidden, setHidden] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const remaining = TASKS.filter((t) => !done[t.key])
  if (hidden || remaining.length === 0) return null

  const markDone = (key: string) =>
    setDone((prev) => {
      const next = { ...prev, [key]: true }
      try { localStorage.setItem("shirasame.tagSetup.v2", JSON.stringify(next)) } catch {}
      return next
    })

  const run = async (task: Task) => {
    setBusyKey(task.key)
    setLog([])
    const push = (l: string) => setLog((prev) => [...prev, l])
    try {
      const tagsJson = await (await apiFetch("/api/tags")).json().catch(() => ({ data: [] }))
      const allTags: any[] = Array.isArray(tagsJson) ? tagsJson : tagsJson.data || []
      const have = new Set(allTags.map((t) => String(t.name)))

      let created = 0
      for (const name of task.newTags) {
        if (have.has(name)) continue
        const res = await apiFetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, group: task.group }),
        })
        if (res.ok) { created++; push(`タグ作成: ${name}`) }
        else push(`× タグ作成失敗: ${name} (${res.status})`)
        await new Promise((r) => setTimeout(r, 120))
      }

      let updated = 0
      const failed: string[] = []
      for (const op of task.ops) {
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
        title: `${task.label} 完了`,
        description: `タグ作成 ${created} / 商品更新 ${updated}${failed.length ? ` / 失敗 ${failed.length}` : ""}`,
        variant: failed.length ? "destructive" : undefined,
      })
      if (failed.length === 0) markDone(task.key)
    } catch (e: any) {
      toast({ variant: "destructive", title: "エラー", description: e?.message || "実行に失敗しました" })
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary/40 bg-accent/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">タグの一括整理</p>
        <button
          type="button"
          aria-label="閉じる"
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent"
          onClick={() => setHidden(true)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {remaining.map((task) => (
          <div key={task.key} className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{task.label}</p>
              <p className="text-xs text-muted-foreground">{task.summary}</p>
            </div>
            <Button size="sm" onClick={() => run(task)} disabled={busyKey !== null}>
              {busyKey === task.key ? "実行中…" : "実行"}
            </Button>
          </div>
        ))}
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
