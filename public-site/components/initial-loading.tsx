"use client"

import React, { useEffect, useState, useRef } from 'react'

import apiFetch, { apiPath } from '@/lib/api-client'
const api = (p: string) => apiPath(p)

// Configuration for the slot animation
const LATIN = 'SHIRASAME'
const HIRAGANA = 'しらさめ'
const KANJI = '白雨'
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
  const [phase, setPhase] = useState<'random' | 'locked' | 'toHira' | 'hira' | 'toKanji' | 'kanji' | 'toWelcome' | 'welcome' | 'done'>('random')

  // total animation duration used to keep loading visible
  const totalAnimationDuration = LATIN.length * LOCK_INTERVAL + SPIN_DURATION + SHAKE_DURATION + SPIN_DURATION

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
          const t1 = window.setTimeout(() => {
            setPhase('locked')
            // begin rotate to hiragana
            setPhase('toHira')
            // perform spin: at half spin, swap to hiragana
            const t2 = window.setTimeout(() => {
              setWord(HIRAGANA)
              setPhase('hira')
              // short shake then to kanji
              const t3 = window.setTimeout(() => {
                setPhase('toKanji')
                const t4 = window.setTimeout(() => {
                  setWord(KANJI)
                  setPhase('kanji')
                  const t5 = window.setTimeout(() => setPhase('done'), SPIN_DURATION)
                  timeoutsRef.current.push(t5)
                }, SPIN_DURATION / 2)
                timeoutsRef.current.push(t4)
              }, SHAKE_DURATION)
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

  // When the animation sequence reaches 'done', transition to 'welcome!' then slide up
  useEffect(() => {
    if (phase !== 'done') return
    // ensure KANJI is shown at 'done'
    setWord(KANJI)
    // after short delay, perform a spin-to-'welcome!' using same animation
    const welcomeDelay = 200 // ms before starting the spin-to-welcome
    const welcomeDuration = 500 // show welcome for 500ms as requested

    const tStart = window.setTimeout(() => {
      // start the spin/drop animation to welcome
      setPhase('toWelcome')
      // at half spin, swap the word to 'welcome!'
      const tSwap = window.setTimeout(() => {
        setWord('welcome!')
        setPhase('welcome')
        // after showing welcome for welcomeDuration, slide up
        const tSlide = window.setTimeout(() => {
          setSlideUp(true)
          setFadeOut(true)
          const tUnmount = window.setTimeout(() => {
            setMountedVisible(false)
            try {
              ;(window as any).__v0_initial_loading = false
              window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: false }))
            } catch {}
          }, SLIDE_DURATION)
          timeoutsRef.current.push(tUnmount)
        }, welcomeDuration)
        timeoutsRef.current.push(tSlide)
      }, SPIN_DURATION / 2)
      timeoutsRef.current.push(tSwap)
    }, welcomeDelay)
    timeoutsRef.current.push(tStart)

    return () => {
      try { window.clearTimeout(tStart) } catch {}
    }
  }, [phase])

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
      .shika-word.toHira .word-inner { animation: spinForward ${SPIN_DURATION}ms forwards; }
      .shika-word.toKanji .word-inner { animation: spinForward ${SPIN_DURATION}ms forwards; }
      .shika-word.toWelcome .word-inner { animation: spinForward ${SPIN_DURATION}ms forwards; }
      /* dropDown moves the translated wrapper down while spin runs */
      .shika-word.toHira .word-translate, .shika-word.toKanji .word-translate, .shika-word.toWelcome .word-translate { animation: dropDown ${SPIN_DURATION}ms forwards; }
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
      .shika-line { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.9); opacity: 0.9; }
      /* left positions */
      .shika-line.left-0 { left: 6%; }
      .shika-line.left-1 { left: 10%; }
      .shika-line.left-2 { left: 14%; }
      /* right positions */
      .shika-line.right-0 { right: 6%; }
      .shika-line.right-1 { right: 10%; }
      .shika-line.right-2 { right: 14%; }
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
          phase === 'random' || phase === 'locked' ? (
                <div style={{ fontSize: 40, letterSpacing: 2 }}>
                  {slots.map((ch, i) => (<span key={i} className={`slot-char ${lockedSlots[i] ? 'slot-locked' : ''}`}>{ch || '\u00A0'}</span>))}
                </div>
          ) : (
            <div className={`shika-word ${phase === 'toHira' ? 'toHira' : ''} ${phase === 'toKanji' ? 'toKanji' : ''} ${phase === 'toWelcome' ? 'toWelcome' : ''} ${(phase === 'hira' || phase === 'kanji' || phase === 'welcome') ? 'shake' : ''}`} ref={wrapperRef} style={{ fontSize: 48 }}>
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

