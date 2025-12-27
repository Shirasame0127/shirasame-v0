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

export default function InitialLoadingFull() {
  const [mountedVisible, setMountedVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [showCustomAnim, setShowCustomAnim] = useState(true)
  const [slideUp, setSlideUp] = useState(false)

  const [slots, setSlots] = useState<string[]>(Array.from({ length: LATIN.length }).map(() => ''))
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(Array.from({ length: LATIN.length }).map(() => false))
  const intervalsRef = useRef<Array<number | null>>(Array(LATIN.length).fill(null))
  const timeoutsRef = useRef<number[]>([])
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [word, setWord] = useState(LATIN)
  const [phase, setPhase] = useState<'random' | 'locked' | 'toHira' | 'hira' | 'toKanji' | 'kanji' | 'toWelcome' | 'welcome' | 'done'>('random')

  useEffect(() => {
    let mounted = true
    try {
      ;(window as any).__v0_initial_loading = true
      window.dispatchEvent(new CustomEvent('v0-initial-loading', { detail: true }))
    } catch {}

    return () => {
      mounted = false
      intervalsRef.current.forEach((id) => { try { if (id) window.clearInterval(id as any) } catch {} })
      timeoutsRef.current.forEach((id) => { try { window.clearTimeout(id as any) } catch {} })
    }
  }, [])

  return null
}
