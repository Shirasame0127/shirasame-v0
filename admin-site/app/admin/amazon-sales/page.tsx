"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db/storage"
import { getCurrentUser } from "@/lib/auth"
import apiFetch from '@/lib/api-client'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { confirm } from "@/components/ui/confirm"
import { StarMark } from "@/components/brand"
import type { AmazonSaleSchedule } from "@/lib/db/schema"

// Amazonの主要大型セール一覧
const AMAZON_MAJOR_SALES = [
  "プライムデー",
  "ブラックフライデー",
  "サイバーマンデー",
  "初売りセール",
  "新生活セール",
  "ゴールデンウィークセール",
  "夏のビッグセール",
  "年末の贈り物セール",
  "その他のセール"
]

export default function AdminAmazonSalesPage() {
  const [schedules, setSchedules] = useState<AmazonSaleSchedule[]>([])
  const [newSaleName, setNewSaleName] = useState("")
  const [newStartDate, setNewStartDate] = useState("")
  const [newEndDate, setNewEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = () => {
    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/amazon-sale-schedules')
        if (!res.ok) throw new Error('failed')
        const json = await res.json().catch(() => ({ data: [] }))
        const list = Array.isArray(json.data) ? json.data : json.data || []
        setSchedules(list)
      } catch (e) {
        // fallback to local cache if API fails
        const currentUser = getCurrentUser && getCurrentUser()
        const uid = currentUser?.id || undefined
        const allSchedules = db.amazonSaleSchedules?.getAll(uid) || []
        setSchedules(allSchedules)
      }
    })()
  }

  const handleAddSchedule = async () => {
    if (!newSaleName || !newStartDate || !newEndDate) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "すべての項目を入力してください"
      })
      return
    }

    const startDate = new Date(newStartDate)
    const endDate = new Date(newEndDate)

    if (endDate <= startDate) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "終了日は開始日より後にしてください"
      })
      return
    }

    const payload = {
      saleName: newSaleName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }

    let created: any = null
    const res = await apiFetch('/api/admin/amazon-sale-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    let json: any = {}
    try { json = await res.json() } catch { json = {} }

    if (!res.ok) {
      console.error('failed to create sale schedule', json)
      const msg = json?.error || 'スケジュールの作成に失敗しました'
      toast({ variant: 'destructive', title: '作成失敗', description: msg })
      return
    }

    created = json.data || json

    // セール名タグが付いた商品をセールコレクションに追加（タグベース・決定論的）。
    if (created?.collectionId) {
      addTaggedProductsToCollection(created.collectionId, newSaleName)
    }

    loadSchedules()
    setNewSaleName("")
    setNewStartDate("")
    setNewEndDate("")

    toast({
      title: "スケジュール追加",
      description: `${newSaleName}のスケジュールを追加しました`
    })
  }

  // セール名タグが付いた商品だけをセールコレクションに追加する（決定論的）。
  // 以前は Math.random() で50%の実商品をランダムに追加しており、実データを
  // 破壊していたため廃止した。
  const addTaggedProductsToCollection = (collectionId: string, saleName: string) => {
    const uid = (getCurrentUser && getCurrentUser())?.id || undefined
    const allProducts = db.products.getAll(uid)
    const collection = db.collections.getById(collectionId)
    if (!collection) return

    const taggedProducts = allProducts.filter((product) => product.tags && product.tags.includes(saleName))
    if (taggedProducts.length === 0) {
      toast({ title: "セールコレクションを作成しました", description: `「${saleName}」タグの商品を追加すると自動で反映されます。` })
      return
    }

    const updatedProductIds = [...new Set([...(collection.productIds || []), ...taggedProducts.map((p) => p.id)])]
    db.collections.update(collectionId, { productIds: updatedProductIds })
    toast({ title: "セール商品を追加しました", description: `${taggedProducts.length}件の商品を「${saleName}」コレクションに追加しました` })
  }

  const handleDeleteSchedule = async (scheduleId: string, opts?: { silent?: boolean }) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return

    try {
      const res = await apiFetch(`/api/admin/amazon-sale-schedules/${encodeURIComponent(scheduleId)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      loadSchedules()
      if (!opts?.silent) {
        toast({ title: "スケジュール削除", description: `${schedule.saleName}のスケジュールを削除しました` })
      }
    } catch (e) {
      if (!opts?.silent) {
        toast({ variant: 'destructive', title: '削除失敗', description: 'スケジュールの削除に失敗しました' })
      }
    }
  }

  // 期限切れのスケジュールを自動削除（自動処理なのでトーストは出さない）
  useEffect(() => {
    const checkExpiredSchedules = () => {
      const now = new Date()
      schedules.forEach(schedule => {
        if (new Date(schedule.endDate) < now) handleDeleteSchedule(schedule.id, { silent: true })
      })
    }
    const interval = setInterval(checkExpiredSchedules, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [schedules])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-8">
        <p className="label-mono mb-2 flex items-center gap-2"><StarMark size={12} className="text-primary" /> Sale schedule</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Amazonセールスケジュール</h1>
        <p className="mt-1 text-sm text-muted-foreground">大型セールの期間を設定して商品を自動管理</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>新規スケジュール追加</CardTitle>
            <CardDescription>セール期間を設定すると、自動的にコレクションが作成されます</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>セール名</Label>
              <Select value={newSaleName} onValueChange={setNewSaleName}>
                <SelectTrigger>
                  <SelectValue placeholder="セールを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {AMAZON_MAJOR_SALES.map(sale => (
                    <SelectItem key={sale} value={sale}>{sale}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始日</Label>
                <Input
                  type="datetime-local"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>終了日</Label>
                <Input
                  type="datetime-local"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleAddSchedule} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              スケジュールを追加
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>登録済みスケジュール</CardTitle>
            <CardDescription>現在設定されているセールスケジュール一覧</CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                スケジュールが登録されていません
              </p>
            ) : (
              <div className="space-y-3">
                {schedules.map(schedule => {
                  const now = new Date()
                  const startDate = new Date(schedule.startDate)
                  const endDate = new Date(schedule.endDate)
                  const isActive = now >= startDate && now <= endDate
                  const isExpired = now > endDate

                  return (
                    <div key={schedule.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{schedule.saleName}</h3>
                          {isActive && <Badge variant="default">開催中</Badge>}
                          {isExpired && <Badge variant="secondary" className="text-muted-foreground">終了</Badge>}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(schedule.startDate).toLocaleString('ja-JP')} 〜{' '}
                          {new Date(schedule.endDate).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="削除"
                        onClick={async () => {
                          if (await confirm({ title: 'スケジュールを削除しますか？', description: `「${schedule.saleName}」を削除します。`, confirmText: '削除する' })) {
                            handleDeleteSchedule(schedule.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
