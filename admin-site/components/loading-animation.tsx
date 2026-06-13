"use client"

import React from 'react'

/**
 * Shirasame sparkle loader — a slowly rotating cluster of four-point stars
 * that twinkle in sequence. Replaces the previous off-brand teal cube.
 */
export default function LoadingAnimation({ size = 200 }: { size?: number }) {
  const star = "M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z"
  return (
    <div aria-hidden="true" style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 120 120" role="img">
        <style>{`
          @keyframes sm-spin { to { transform: rotate(360deg); } }
          @keyframes sm-twinkle { 0%,100% { opacity: .25; transform: scale(.82); } 50% { opacity: 1; transform: scale(1); } }
          .sm-orbit { transform-origin: 60px 60px; animation: sm-spin 9s linear infinite; }
          .sm-star { transform-box: fill-box; transform-origin: center; }
          .sm-s1 { animation: sm-twinkle 1.6s ease-in-out infinite; }
          .sm-s2 { animation: sm-twinkle 1.6s ease-in-out infinite .4s; }
          .sm-s3 { animation: sm-twinkle 1.6s ease-in-out infinite .8s; }
          .sm-s4 { animation: sm-twinkle 1.6s ease-in-out infinite 1.2s; }
        `}</style>
        {/* faint orbit ring */}
        <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" className="text-foreground" />
        <g className="sm-orbit">
          <g transform="translate(48 6) scale(1)" className="text-primary">
            <path className="sm-star sm-s1" d={star} fill="currentColor" />
          </g>
          <g transform="translate(96 48) scale(0.6)" className="text-foreground">
            <path className="sm-star sm-s2" d={star} fill="currentColor" />
          </g>
          <g transform="translate(54 90) scale(0.45)" className="text-primary">
            <path className="sm-star sm-s3" d={star} fill="currentColor" />
          </g>
          <g transform="translate(10 54) scale(0.5)" className="text-foreground">
            <path className="sm-star sm-s4" d={star} fill="currentColor" />
          </g>
        </g>
        {/* center star */}
        <g transform="translate(42 42) scale(1.5)" className="text-primary">
          <path className="sm-star sm-s1" d={star} fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}
