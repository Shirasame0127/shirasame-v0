"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db/storage"
import { Plus, Trash2, Calendar } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
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
    const allSchedules = db.amazonSaleSchedules?.getAll() || []
    setSchedules(allSchedules)
  }

  const handleAddSchedule = () => {
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

    const collection = db.collections.create({
      title: newSaleName,
      description: `${newSaleName}期間中のセール商品`,
      productIds: [],
      visibility: "public"
    })

    // スケジュールを作成
    db.amazonSaleSchedules?.create({
      saleName: newSaleName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      collectionId: collection.id
    })

    console.log("[v0] Created Amazon sale schedule:", {
      saleName: newSaleName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      collectionId: collection.id
    })

    // モック：Amazonリンクのある商品をチェックしてセール価格かどうか判定
    checkAmazonProducts(collection.id, newSaleName, startDate, endDate)

    loadSchedules()
    setNewSaleName("")
    setNewStartDate("")
    setNewEndDate("")

    toast({
      title: "スケジュール追加",
      description: `${newSaleName}のスケジュールを追加しました`
    })
  }

  // モック：Amazon商品のセール判定
  const checkAmazonProducts = (collectionId: string, saleName: string, startDate: Date, endDate: Date) => {
    const now = new Date()
    const isActiveSale = now >= startDate && now <= endDate

    // if (!isActiveSale) { ... } のチェックを削除または緩和

    const allProducts = db.products.getAll()
    const collection = db.collections.getById(collectionId)

    if (!collection) return

    const taggedProducts = allProducts.filter(product => 
      product.tags && product.tags.includes(saleName)
    )

    // Amazonリンクを持つ商品をフィルター
    const amazonProducts = allProducts.filter(product => 
      product.affiliateLinks?.some(link => 
        link.url.includes('amazon.co.jp') || link.url.includes('amazon.com')
      )
    )

    console.log("[v0] Found Amazon products:", amazonProducts.length)
    console.log("[v0] Found Tagged products:", taggedProducts.length)

    // モック：ランダムに50%の商品をセール中と判定（タグ付き商品は確定で追加）
    const randomSaleProducts = amazonProducts.filter(() => Math.random() > 0.5)
    
    const saleProducts = [...taggedProducts, ...randomSaleProducts]

    // セールコレクションに追加
    const updatedProductIds = [...new Set([...collection.productIds, ...saleProducts.map(p => p.id)])]
    db.collections.update(collectionId, {
      productIds: updatedProductIds
    })

    console.log("[v0] Added products to sale collection:", {
      collectionId,
      saleName,
      productCount: updatedProductIds.length
    })

    toast({
      title: "セール商品を更新",
      description: `${updatedProductIds.length}個の商品を${saleName}コレクションに追加しました`
    })
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) return

    if (schedule.collectionId) {
      db.collections.delete(schedule.collectionId)
      console.log("[v0] Deleted sale collection:", schedule.collectionId)
    }

    db.amazonSaleSchedules?.delete(scheduleId)
    loadSchedules()

    toast({
      title: "スケジュール削除",
      description: `${schedule.saleName}のスケジュールを削除しました`
    })
  }

  // 期限切れのスケジュールを自動削除
  useEffect(() => {
    const checkExpiredSchedules = () => {
      const now = new Date()
      schedules.forEach(schedule => {
        const endDate = new Date(schedule.endDate)
        if (endDate < now) {
          console.log("[v0] Auto-deleting expired schedule:", schedule.saleName)
          handleDeleteSchedule(schedule.id)
        }
      })
    }

    // 1時間ごとにチェック
    const interval = setInterval(checkExpiredSchedules, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [schedules])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Amazonセールスケジュール</h1>
          <p className="text-muted-foreground">大型セールの期間を設定して商品を自動管理</p>
        </div>
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
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{schedule.saleName}</h3>
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              開催中
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              終了
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(schedule.startDate).toLocaleString('ja-JP')} 〜{' '}
                          {new Date(schedule.endDate).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
