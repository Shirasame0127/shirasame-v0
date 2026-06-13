"use client"

import { useState, useEffect, useCallback } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { db } from '@/lib/db/storage'
import { getCurrentUser } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSaleCalendar() {
  const { toast } = useToast()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [schedules, setSchedules] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: "", startDate: "", endDate: "" })

  const refresh = useCallback(() => {
    const uid = getCurrentUser()?.id || undefined
    setSchedules(db.amazonSaleSchedules.getAll(uid))
  }, [])

  useEffect(() => {
    ;(async () => {
      try { await db.amazonSaleSchedules.refresh(getCurrentUser()?.id || undefined) } catch {}
      refresh()
    })()
    // Event-driven refresh instead of a constant 2s polling interval.
    const onChanged = () => refresh()
    window.addEventListener('sale-schedules:changed', onChanged)
    window.addEventListener('focus', onChanged)
    return () => {
      window.removeEventListener('sale-schedules:changed', onChanged)
      window.removeEventListener('focus', onChanged)
    }
  }, [refresh])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const rows: Date[][] = []
  let day = startDate
  while (day <= endDate) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1) }
    rows.push(week)
  }

  const startOfDay = (d: Date) => { const t = new Date(d); t.setHours(0, 0, 0, 0); return t }
  const endOfDay = (d: Date) => { const t = new Date(d); t.setHours(23, 59, 59, 999); return t }

  function daySchedules(d: Date) {
    return schedules.filter((s) => {
      try {
        const sDate = typeof s.startDate === 'string' ? parseISO(s.startDate) : new Date(s.startDate)
        const eDate = typeof s.endDate === 'string' ? parseISO(s.endDate) : new Date(s.endDate)
        return d >= startOfDay(sDate) && d <= endOfDay(eDate)
      } catch { return false }
    })
  }

  const openAdd = (d: Date) => {
    const ds = format(d, 'yyyy-MM-dd')
    setForm({ title: "", startDate: ds, endDate: ds })
    setDialogOpen(true)
  }

  const handleCreate = () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast({ title: "入力が不足しています", description: "セール名・開始日・終了日を入力してください。", variant: "destructive" })
      return
    }
    try {
      const uid = getCurrentUser()?.id || undefined
      db.amazonSaleSchedules.create({ id: `sale-${form.startDate}-${form.title}`, title: form.title.trim(), startDate: form.startDate, endDate: form.endDate, userId: uid })
      setDialogOpen(false)
      refresh()
      try { window.dispatchEvent(new Event('sale-schedules:changed')) } catch {}
      toast({ title: "セールを追加しました" })
    } catch {
      toast({ title: "作成に失敗しました", variant: "destructive" })
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{format(monthStart, 'yyyy年 M月')}</div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="前の月"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="次の月"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="bg-muted py-2 text-center text-xs text-muted-foreground">{d}</div>
        ))}
        {rows.map((week, wi) => (
          <div key={wi} className="contents">
            {week.map((dayItem) => {
              const inMonth = isSameMonth(dayItem, monthStart)
              const todays = daySchedules(dayItem)
              const isToday = isSameDay(dayItem, new Date())
              return (
                <div key={dayItem.toISOString()} className={`group min-h-[72px] bg-background p-1.5 ${inMonth ? '' : 'text-muted-foreground/50'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`flex h-5 w-5 items-center justify-center text-xs ${isToday ? 'rounded-full bg-primary font-bold text-primary-foreground' : ''}`}>{format(dayItem, 'd')}</div>
                    <button className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" onClick={() => openAdd(dayItem)} aria-label="セールを追加"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {todays.slice(0, 2).map((s, i) => (
                      <div key={i} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[11px] text-primary">{s.title || 'セール'}</div>
                    ))}
                    {todays.length > 2 && <div className="text-[11px] text-muted-foreground">+{todays.length - 2} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>セールを追加</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>セール名</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="例: タイムセール祭り" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>開始日</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>終了日</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleCreate}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
