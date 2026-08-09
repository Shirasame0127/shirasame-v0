"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'

import apiFetch, { apiPath } from '@/lib/api-client'
const api = (p: string) => apiPath(p)

// Configuration for the slot animation
const LATIN = 'SHIRASAME'
const LOCK_INTERVAL = 600 // ms between locking each letter
const RANDOM_INTERVAL = 50 // ms for cycling random chars
const SPIN_DURATION = 400 // ms for spin animation
const SHAKE_DURATION = 500 // ms for shake before next spin
const SLIDE_DURATION = 1200 // ms for slide-up transition

function randomChar() {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function InitialLoading() {
  const [mountedVisible, setMountedVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  // Always show our custom slot animation
  const [showCustomAnim, setShowCustomAnim] = useState(true)
  const [slideUp, setSlideUp] = useState(false)

  // animation states
  const [slots, setSlots] = useState<string[]>(Array.from({ length: LATIN.length }).map(() => ''))
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(Array.from({ length: LATIN.length }).map(() => false))
  const intervalsRef = useRef<Array<number | null>>(Array(LATIN.length).fill(null))
  const timeoutsRef = useRef<number[]>([])
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [word, setWord] = useState(LATIN)
  // 'random' cycles the slots, 'toWelcome' spins, 'welcome' holds the final word.
  const [phase, setPhase] = useState<'random' | 'toWelcome' | 'welcome'>('random')

  const WELCOME = 'welcome!'
  const WELCOME_DURATION = 500 // how long "welcome!" stays before sliding away

  // Slide the overlay away and let the rest of the app know. Guarded so the
  // safety net below cannot repeat it after the animation already finished —
  // that used to re-fire `v0-initial-loading` a second time.
  const dismissedRef = useRef(false)
  const finish = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setSlideUp(true)
    setFadeOut(true)
    const id = window.setTimeout(() => {
      setMountedVisible(false)
      try {
        ;(window as any).__v0_initial_loading = false
        window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
      } catch {}
    }, SLIDE_DURATION)
    timeoutsRef.current.push(id)
  }, [])

  useEffect(() => {
    let mounted = true
    try {
      ;(window as any).__v0_initial_loading = true
      window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: true }))
    } catch {}
    const start = Date.now()

    ;(async () => {
      try {
        const res = await apiFetch('/site-settings')
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        const raw = json?.data?.loading_animation
        let url: string | null = null
        if (!raw) url = null
        else if (typeof raw === 'string') url = raw
        else if (typeof raw === 'object') url = raw?.url || null

        // Accept absolute or data URLs from the API; otherwise fall back to env config.
        try {
          let normalized = url
          const looksAbsolute = typeof normalized === 'string' && (/^(https?:)?\/\//.test(normalized) || /^data:/.test(normalized))
          if (!looksAbsolute) {
            const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
            if (envUrl) normalized = envUrl
          }
          if (mounted) setGifUrl(normalized || null)
        } catch {
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (mounted) setGifUrl(envUrl || url)
        }
      } catch {
        try {
          const envUrl = (process.env.NEXT_PUBLIC_LOADING_GIF_URL || process.env.LOADING_GIF_URL || '').trim()
          if (envUrl && mounted) setGifUrl(envUrl)
        } catch {}
      } finally {
        // If we have a gifUrl, schedule a short automatic hide; otherwise
        // when using the custom slot animation, defer hide/unmount to the
        // animation 'done' sequence so timing is deterministic.
        if (gifUrl) {
          const elapsed = Date.now() - start
          const minVisible = 1000
          const remaining = Math.max(0, minVisible - elapsed)
          const id1 = window.setTimeout(() => {
            if (!mounted) return
            setFadeOut(true)
            const id2 = window.setTimeout(() => {
              if (!mounted) return
              setMountedVisible(false)
              try {
                ;(window as any).__v0_initial_loading = false
                window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
              } catch {}
            }, 500)
            timeoutsRef.current.push(id2)
          }, remaining)
          timeoutsRef.current.push(id1)
        } else {
          if (mounted) setShowCustomAnim(true)
        }
      }
    })()

    return () => {
      mounted = false
      // clear intervals/timeouts
      intervalsRef.current.forEach((id) => { try { if (id) window.clearInterval(id as any) } catch {} })
      timeoutsRef.current.forEach((id) => { try { window.clearTimeout(id as any) } catch {} })
    }
  }, [])

  // Safety net: never let the splash gate the site if the chain is interrupted.
  // The sequence now finishes at ~2.4s, so 4s is a comfortable backstop.
  useEffect(() => {
    const id = window.setTimeout(finish, 4000)
    return () => window.clearTimeout(id)
  }, [finish])

  // Start slot animation when needed
  useEffect(() => {
    if (!showCustomAnim) return

    // start random cycling for each slot
    for (let i = 0; i < LATIN.length; i++) {
      const iv = window.setInterval(() => {
        setSlots((prev) => { const copy = prev.slice(); copy[i] = randomChar(); return copy })
      }, RANDOM_INTERVAL)
      intervalsRef.current[i] = iv

      // schedule lock for this slot
      const to = window.setTimeout(() => {
        // lock character
        setSlots((prev) => { const copy = prev.slice(); copy[i] = LATIN[i]; return copy })
        // mark this slot as locked briefly to trigger vertical bounce
        try {
          setLockedSlots((prev) => { const cp = prev.slice(); cp[i] = true; return cp })
          const clearBounce = window.setTimeout(() => { setLockedSlots((prev) => { const cp = prev.slice(); cp[i] = false; return cp }) }, 220)
          timeoutsRef.current.push(clearBounce)
        } catch {}
        // clear its interval
        try { const id = intervalsRef.current[i]; if (id) window.clearInterval(id as any); intervalsRef.current[i] = null } catch {}

        // if last slot, trigger next phase after small delay
        if (i === LATIN.length - 1) {
          // Straight from the locked word to "welcome!" — one spin, no
          // intermediate しらさめ / 白雨 steps. The swap lands mid-spin at
          // ~1.9s instead of ~3.4s.
          const t1 = window.setTimeout(() => {
            setPhase('toWelcome')
            const t2 = window.setTimeout(() => {
              setWord(WELCOME)
              setPhase('welcome')
              const t3 = window.setTimeout(() => finish(), WELCOME_DURATION)
              timeoutsRef.current.push(t3)
            }, SPIN_DURATION / 2)
            timeoutsRef.current.push(t2)
          }, 300)
          timeoutsRef.current.push(t1)
        }
      }, (LOCK_INTERVAL + i * 100))
      timeoutsRef.current.push(to)
    }

    return () => {
      intervalsRef.current.forEach((id) => { try { if (id) window.clearInterval(id as any) } catch {} })
      timeoutsRef.current.forEach((id) => { try { window.clearTimeout(id as any) } catch {} })
    }
  }, [showCustomAnim])


  if (!mountedVisible) return null

  // determine public
  let isPublic = true
  try {
    const cookieHeader = typeof document !== 'undefined' ? document.cookie : ''
    const hasAccessCookie = cookieHeader.includes('sb-access-token')
    const PUBLIC_HOST = process.env.NEXT_PUBLIC_PUBLIC_HOST || ''
    const isHostPublic = PUBLIC_HOST ? (typeof window !== 'undefined' && window.location.hostname === PUBLIC_HOST) : false
    isPublic = (PUBLIC_HOST ? isHostPublic : !hasAccessCookie) || !hasAccessCookie
  } catch { isPublic = true }

  const bgStyle = isPublic ? { backgroundColor: '#add8e6' } : undefined
  const transitionStyle = { transition: 'opacity 500ms ease' }

  // Inline styles and small CSS for animation
  const styleTag = (
    <style>{`
      @font-face{font-family: 'Shikakufuto'; src: url('/Shikakufuto_ver20251224.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap;}
      .shika-loading { font-family: Shikakufuto, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; display:flex; align-items:center; justify-content:center; }
      .shika-loading, .shika-loading .slot-char, .shika-word .word-inner { color: #ffffff; }
      .shika-overlay { transition: transform ${SLIDE_DURATION}ms ease, opacity 500ms ease; transform: translateY(0); }
      .shika-overlay.slide-up { transform: translateY(-110%); }
      .shika-word { display:inline-block; perspective:800px; }
      .shika-word .word-translate { display:inline-block; }
      .shika-word .word-inner { display:inline-block; transform-origin:center; transition: transform ${SPIN_DURATION}ms ease; }
      .shika-word.spin .word-inner { transform: rotateX(80deg); }
      .shika-word.toWelcome .word-inner { animation: spinForward ${SPIN_DURATION}ms forwards; }
      /* dropDown moves the translated wrapper down while spin runs */
      .shika-word.toWelcome .word-translate { animation: dropDown ${SPIN_DURATION}ms forwards; }
      @keyframes dropDown { 0% { transform: translateY(0); } 80% { transform: translateY(12px); } 100% { transform: translateY(12px); } }
      @keyframes spinForward { 0% { transform: rotateX(0deg); } 50% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }
      .shika-word.shake .word-translate { animation: shake  ${SHAKE_DURATION}ms; }
      @keyframes shake { 0% { transform: translateY(0) } 25% { transform: translateY(-6px) } 50% { transform: translateY(3px) } 75% { transform: translateY(-3px) } 100% { transform: translateY(0) } }
      .slot-char.slot-locked { display:inline-block; animation: slotBounce 220ms ease; }
      @keyframes slotBounce { 0% { transform: translateY(0) } 30% { transform: translateY(-8px) } 60% { transform: translateY(3px) } 100% { transform: translateY(0) } }
      .slot-char { display:inline-block; width:1ch; text-align:center; }
    `}</style>
  )

  // Add lines CSS (sparkles removed)
  const linesStyle = (
    <style>{`
      /* vertical lines (sparkles removed) */
      .shika-lines { position: absolute; inset: 0; pointer-events: none; z-index: 20; }
      /* double thickness (increased from 2px -> 4px) */
      .shika-line { position: absolute; top: 0; bottom: 0; width: 3px; background: rgba(255,255,255,0.95); opacity: 0.95; }
      /* left positions: moved outward and evenly spaced */
      .shika-line.left-0 { left: 2%; }
      .shika-line.left-1 { left: 4%; }
      .shika-line.left-2 { left: 6%; }
      /* right positions: moved outward and evenly spaced */
      .shika-line.right-0 { right: 2%; }
      .shika-line.right-1 { right: 4%; }
      .shika-line.right-2 { right: 6%; }
    `}</style>
  )

  // Sparkle effect removed: no dynamic sparkles will be spawned

  return (
    <div className={`fixed inset-0 flex items-center justify-center shika-overlay ${slideUp ? 'slide-up' : ''} ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ zIndex: 99999, ...(bgStyle || { backgroundColor: 'rgba(0,0,0,0.4)' }) }}>
      {styleTag}
      {linesStyle}
      {/* Always render the custom slot-style animation */}
      {/* vertical lines for sparkle effect */}
      <div className="shika-lines" aria-hidden>
        <div className="shika-line left-0" data-line-index="0" />
        <div className="shika-line left-1" data-line-index="1" />
        <div className="shika-line left-2" data-line-index="2" />
        <div className="shika-line right-0" data-line-index="3" />
        <div className="shika-line right-1" data-line-index="4" />
        <div className="shika-line right-2" data-line-index="5" />
      </div>
      <div className="shika-loading">
        {showCustomAnim ? (
          phase === 'random' ? (
                <div style={{ fontSize: 40, letterSpacing: 2 }}>
                  {slots.map((ch, i) => (<span key={i} className={`slot-char ${lockedSlots[i] ? 'slot-locked' : ''}`}>{ch || '\u00A0'}</span>))}
                </div>
          ) : (
            <div className={`shika-word ${phase === 'toWelcome' ? 'toWelcome' : ''} ${phase === 'welcome' ? 'shake' : ''}`} ref={wrapperRef} style={{ fontSize: 48 }}>
              <span className="word-translate"><span className="word-inner">{word}</span></span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
            <div className="w-32 h-8">
              <img src="/images/shirasame-logo.png" alt="logo" className="w-full h-full object-contain" onError={(e) => { try { (e.target as HTMLImageElement).src = '/images/shirasame-logo.svg' } catch {} }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// (end of file)

