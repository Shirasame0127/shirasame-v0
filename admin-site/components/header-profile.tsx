"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import apiFetch from '@/lib/api-client'
import { getPublicImageUrl, responsiveImageForUsage } from '@/lib/image-url'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-react'
import { auth } from '@/lib/auth'

export default function HeaderProfile() {
  const router = useRouter()
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>('Sh')
  const touch = useRef<{ startX: number; startY: number; active: boolean } | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiFetch('/api/profile', { cache: 'no-store' })
        if (!res || !res.ok) return
        const json = await res.json().catch(() => null)
        const data = json?.data || json || null
        if (!data) return
        // derive image
        const raw = data?.profile_image_key || data?.profileImageKey || data?.avatarUrl || data?.profileImage || null
        let img: string | null = null
        if (raw) {
          try {
            const key = String(raw)
            const publicUrl = getPublicImageUrl(key) || (key.startsWith('http') ? key : null)
            if (publicUrl) {
              try {
                const resp = responsiveImageForUsage(publicUrl, 'avatar')
                img = resp?.src || publicUrl
              } catch {
                img = publicUrl
              }
            }
          } catch (e) {
            // ignore
          }
        }
        if (mounted) {
          setImageSrc(img)
          const name = data?.username || data?.displayName || data?.email || ''
          if (name) {
            const s = (name.includes('@') ? name.split('@')[0] : name).split(' ').map(p => p[0] || '').join('').slice(0,2).toUpperCase()
            if (s) setInitials(s)
          }
        }
      } catch (e) {
        // swallow
      }
    })()
    return () => { mounted = false }
  }, [])

  // Touch swipe handler: open sidebar when swiping from left edge
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch.current = { startX: t.clientX, startY: t.clientY, active: t.clientX < 32 }
    }
    const onTouchMove = (e: TouchEvent) => {
      // noop
    }
    const onTouchEnd = (e: TouchEvent) => {
      const t0 = touch.current
      if (!t0 || !t0.active) return
      const touchEnd = (e.changedTouches && e.changedTouches[0]) || null
      if (!touchEnd) return
      const dx = touchEnd.clientX - t0.startX
      const dy = touchEnd.clientY - t0.startY
      // horizontal right swipe sufficiently large and not vertical
      if (dx > 60 && Math.abs(dy) < 60) {
        window.dispatchEvent(new CustomEvent('admin:open-mobile-sidebar'))
      }
      touch.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await auth.logout()
      // on success, navigate to login
      router.push('/admin/login')
    } catch (e) {
      // ignore for now
    }
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="プロフィールメニュー"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt="プロフィール" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="text-xs">{initials}</span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push('/admin/settings')}> 
            <Settings className="size-4 mr-2" /> 設定
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleLogout} variant="destructive">
            <LogOut className="size-4 mr-2" /> ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
