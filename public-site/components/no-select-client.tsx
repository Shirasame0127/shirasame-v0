"use client"

import { useEffect } from 'react'

export default function NoSelectClient() {
  useEffect(() => {
    const onContext = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      // allow context on inputs / editable areas
      if (target.closest && (target.closest('input,textarea,select,button') || (target as HTMLElement).isContentEditable)) return
      e.preventDefault()
    }
    const onCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest && (target.closest('input,textarea,select,button') || (target as HTMLElement).isContentEditable)) return
      e.preventDefault()
    }
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest && (target.closest('input,textarea,select,button') || (target as HTMLElement).isContentEditable)) return
      e.preventDefault()
    }

    document.addEventListener('contextmenu', onContext)
    document.addEventListener('copy', onCopy)
    document.addEventListener('selectstart', onSelectStart)

    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('selectstart', onSelectStart)
    }
  }, [])

  return null
}
