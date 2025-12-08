"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { db } from '@/lib/db/storage'
import { getCurrentUser } from '@/lib/auth'

export default function AdminSaleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [schedules, setSchedules] = useState<any[]>([])

  useEffect(() => {
    // load schedules from cache (refresh best-effort)
    (async () => {
      try {
        const me = getCurrentUser && getCurrentUser()
        const uid = me?.id || undefined
        await db.amazonSaleSchedules.refresh(uid)
      } catch {}
      const me2 = getCurrentUser && getCurrentUser()
      const uid2 = me2?.id || undefined
      setSchedules(db.amazonSaleSchedules.getAll(uid2))
    })()
  }, [])

  useEffect(() => {
    // update when underlying cache changes periodically — simple interval
    const me = getCurrentUser && getCurrentUser()
    const uid = me?.id || undefined
    const id = setInterval(() => setSchedules(db.amazonSaleSchedules.getAll(uid)), 2000)
    return () => clearInterval(id)
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const rows: Date[][] = []
  let day = startDate
  while (day <= endDate) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    rows.push(week)
  }

  function daySchedules(d: Date) {
    return schedules.filter((s) => {
      try {
        const sDate = typeof s.startDate === 'string' ? parseISO(s.startDate) : new Date(s.startDate)
        const eDate = typeof s.endDate === 'string' ? parseISO(s.endDate) : new Date(s.endDate)
        return d >= startOfDay(sDate) && d <= endOfDay(eDate)
      } catch {
        return false
      }
    })
  }

  function startOfDay(d: Date) { const t = new Date(d); t.setHours(0,0,0,0); return t }
  function endOfDay(d: Date) { const t = new Date(d); t.setHours(23,59,59,999); return t }

  const onPrev = () => setCurrentMonth(subMonths(currentMonth, 1))
  const onNext = () => setCurrentMonth(addMonths(currentMonth, 1))

  const onAdd = (d: Date) => {
    const title = window.prompt('セール名を入力してください（キャンセルで中止）')
    if (!title) return
    const startStr = window.prompt('開始日 (YYYY-MM-DD)', format(d, 'yyyy-MM-dd'))
    if (!startStr) return
    const endStr = window.prompt('終了日 (YYYY-MM-DD)', startStr)
    if (!endStr) return
    try {
      const schedule = { id: `sale-${Date.now()}`, title, startDate: startStr, endDate: endStr }
      const me3 = getCurrentUser && getCurrentUser()
      const uid3 = me3?.id || undefined
      const created = db.amazonSaleSchedules.create({ ...schedule, userId: uid3 })
      setSchedules(db.amazonSaleSchedules.getAll(uid3))
      console.log('[v0] Created sale schedule', created)
    } catch (e) {
      console.error('[v0] Failed to create schedule', e)
      alert('作成に失敗しました')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-sm font-medium">{format(monthStart, 'yyyy年 M月')}</div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={onPrev} aria-label="前の月">‹</button>
          <button className="btn btn-sm" onClick={onNext} aria-label="次の月">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
        {['日','月','火','水','木','金','土'].map((d) => (
          <div key={d} className="bg-muted text-center text-xs py-2">{d}</div>
        ))}
        {rows.map((week, wi) => (
          <div key={wi} className="contents">
            {week.map((dayItem) => {
              const inMonth = isSameMonth(dayItem, monthStart)
              const todays = daySchedules(dayItem)
              return (
                <div key={dayItem.toISOString()} className={`min-h-[72px] p-2 bg-background ${inMonth ? 'text-base' : 'text-muted-foreground'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`text-xs ${isSameDay(dayItem, new Date()) ? 'font-bold' : ''}`}>{format(dayItem, 'd')}</div>
                    <button className="text-xs text-muted-foreground" onClick={() => onAdd(dayItem)}>＋</button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {todays.slice(0,2).map((s, i) => (
                      <div key={i} className="text-[11px] truncate px-1 py-0.5 bg-primary/10 text-primary rounded">{s.title || 'セール'}</div>
                    ))}
                    {todays.length > 2 && <div className="text-[11px] text-muted-foreground">+{todays.length - 2} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
