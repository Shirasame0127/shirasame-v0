"use client"

import React, { useRef, useEffect } from 'react'

export default function WavyGrid() {
  const elRef = useRef<HTMLDivElement | null>(null)

  // --- 調整用のデフォルト値 ---
  // 以前の CSS+JS 実装に合わせ、ここでデフォルトを定義します。
  // 必要なら canvas の data 属性や :root の CSS 変数で上書きできます。
  const DEFAULT_SCALE = 4.0       // グリッドの“密度” (大きいとセルが小さくなる)
  const DEFAULT_THICKNESS = 0.003 // 線の太さ (比率 -> 最終的に px に変換)
  const DEFAULT_SPEED = 0.3       // アニメーション速度の係数

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = elRef.current
    if (!el) return

    // モバイル限定で有効化（以前と同様の動作）
    if (window.innerWidth >= 640) return

    // データ属性 -> CSS var -> デフォルト の順で値を解決
    const resolve = (name: 'scale' | 'thickness' | 'speed') => {
      try {
        const ds = (el.dataset as any)
        if (ds && ds[`wavy${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
          const v = parseFloat(ds[`wavy${name.charAt(0).toUpperCase() + name.slice(1)}`])
          if (!isNaN(v) && v > 0) return v
        }
        const cssName = `--wavy-${name}`
        const cssVal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(cssName) || '')
        if (!isNaN(cssVal) && cssVal > 0) return cssVal
      } catch {}
      if (name === 'scale') return DEFAULT_SCALE
      if (name === 'thickness') return DEFAULT_THICKNESS
      return DEFAULT_SPEED
    }

    let scale = resolve('scale')
    let thickness = resolve('thickness')
    let speed = resolve('speed')

    // グリッド画像（SVG）を動的に生成して背景にセットする。
    // セルサイズは scale の逆数的に決める（調整しやすいように単純化）。
    const makeGridSvg = (cell: number, stroke: number, bg = '#FAFBFD', line = '#EDEFF2') => {
      const svg = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}' viewBox='0 0 ${cell} ${cell}'>\n  <rect width='100%' height='100%' fill='${bg}' />\n  <line x1='0' y1='0' x2='${cell}' y2='0' stroke='${line}' stroke-width='${stroke}' />\n  <line x1='0' y1='0' x2='0' y2='${cell}' stroke='${line}' stroke-width='${stroke}' />\n</svg>`
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
    }

    const apply = () => {
      // cell size は scale の逆数に基づいて計算（小回りが効く設定）
      const cell = Math.max(6, Math.round(48 / Math.max(0.1, scale)))
      const strokePx = Math.max(0.3, Math.round(cell * Math.max(0.0005, thickness)))

      el.style.backgroundImage = makeGridSvg(cell, strokePx)
      el.style.backgroundRepeat = 'repeat'
      el.style.backgroundSize = `${cell}px ${cell}px`

      // アニメーション速度は cell に依存させると自然
      const duration = Math.max(3, 12 / Math.max(0.1, speed))
      // ユニークなアニメ名を与えて重複を避ける
      const animName = `wavy-grid-scroll-${cell}-${strokePx}`

      // キーフレームを動的に挿入（既にあれば差し替え）
      const styleId = `wavy-grid-style-${cell}-${strokePx}`
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      // 斜め移動: 背景位置を x/y 同時に変化させる
      styleEl.textContent = `@keyframes ${animName} { from { background-position: 0px 0px; } to { background-position: ${cell}px ${cell}px; } }`
      el.style.animation = `${animName} ${duration}s linear infinite`
    }

    apply()

    // 画面回転やリサイズで再適用
    const onResize = () => { scale = resolve('scale'); thickness = resolve('thickness'); speed = resolve('speed'); apply() }
    window.addEventListener('resize', onResize)

    return () => {
      try { window.removeEventListener('resize', onResize) } catch {}
      if (el) { el.style.backgroundImage = ''; el.style.animation = '' }
    }
  }, [])

  // 背景用の div を配置（pointer-events: none で重ならないように）
  return (
    <div ref={elRef} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }} />
  )
}
