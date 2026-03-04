"use client"

import React from 'react'

export default function LoadingAnimation({ size = 200 }: { size?: number }) {
  const s = String(size)
  return (
    <div aria-hidden="true" style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={s} height={s} viewBox="0 0 200 200" role="img">
        <style>{`
          .container { background-color: #414141; }
          @keyframes bounce { 0%,100% { transform: translate(0px,36px);} 50%{ transform: translate(0px,46px);} }
          @keyframes bounce2 { 0%,100% { transform: translate(0px,46px);} 50%{ transform: translate(0px,56px);} }
          @keyframes umbral { 0% { stop-color: #2fe7dd2e; } 50% { stop-color: rgba(47,231,221,0.52); } 100% { stop-color: #2fe7dd2e; } }
          @keyframes partciles { 0%,100% { transform: translate(0px,16px);} 50%{ transform: translate(0px,6px);} }
          #particles { animation: partciles 4s ease-in-out infinite; }
          #animatedStop { animation: umbral 4s infinite; }
          #bounce { animation: bounce 4s ease-in-out infinite; transform: translate(0px,36px); }
          #bounce2 { animation: bounce2 4s ease-in-out infinite; transform: translate(0px,46px); animation-delay: 0.5s; }
        `}</style>

        <g>
          <polygon transform="rotate(45 100 100)" strokeWidth="1" stroke="#1a9690" fill="none" points="70,70 148,50 130,130 50,150" id="bounce"></polygon>
          <polygon transform="rotate(45 100 100)" strokeWidth="1" stroke="#1a9690" fill="none" points="70,70 148,50 130,130 50,150" id="bounce2"></polygon>
          <polygon transform="rotate(45 100 100)" strokeWidth="2" stroke="" fill="#414750" points="70,70 150,50 130,130 50,150"></polygon>
          <polygon strokeWidth="2" stroke="" fill="url(#gradiente)" points="100,70 150,100 100,130 50,100"></polygon>
          <defs>
            <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gradiente">
              <stop style={{ stopColor: '#1e2026', stopOpacity: 1 } as any} offset="20%"></stop>
              <stop style={{ stopColor: '#414750', stopOpacity: 1 } as any} offset="60%"></stop>
            </linearGradient>
          </defs>
          <polygon transform="translate(20, 31)" strokeWidth="2" stroke="" fill="#1fb9b0" points="80,50 80,75 80,99 40,75"></polygon>
          <polygon transform="translate(20, 31)" strokeWidth="2" stroke="" fill="url(#gradiente2)" points="40,-40 80,-40 80,99 40,75"></polygon>
          <defs>
            <linearGradient y2="100%" x2="0%" y1="-17%" x1="10%" id="gradiente2">
              <stop style={{ stopColor: '#2fe7dd00', stopOpacity: 1 } as any} offset="20%"></stop>
              <stop style={{ stopColor: '#2fe7dd54', stopOpacity: 1 } as any} offset="100%" id="animatedStop"></stop>
            </linearGradient>
          </defs>
          <polygon transform="rotate(180 100 100) translate(20, 20)" strokeWidth="2" stroke="" fill="#146c68" points="80,50 80,75 80,99 40,75"></polygon>
          <polygon transform="rotate(0 100 100) translate(60, 20)" strokeWidth="2" stroke="" fill="url(#gradiente3)" points="40,-40 80,-40 80,85 40,110.2"></polygon>
          <defs>
            <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gradiente3">
              <stop style={{ stopColor: '#2fe7dd00', stopOpacity: 1 } as any} offset="20%"></stop>
              <stop style={{ stopColor: '#2fe7dd54', stopOpacity: 1 } as any} offset="100%" id="animatedStop"></stop>
            </linearGradient>
          </defs>
          <polygon transform="rotate(45 100 100) translate(80, 95)" strokeWidth="2" stroke="" fill="#a5f6f1" points="5,0 5,5 0,5 0,0" id="particles"></polygon>
          <polygon transform="rotate(45 100 100) translate(80, 55)" strokeWidth="2" stroke="" fill="#5fd0c8" points="6,0 6,6 0,6 0,0" id="particles-2"></polygon>
          <polygon transform="rotate(45 100 100) translate(70, 80)" strokeWidth="2" stroke="" fill="#fff" points="2,0 2,2 0,2 0,0" id="particles-3"></polygon>
          <polygon strokeWidth="2" stroke="" fill="#292d34" points="29.5,99.8 100,142 100,172 29.5,130"></polygon>
          <polygon transform="translate(50, 92)" strokeWidth="2" stroke="" fill="#1f2127" points="50,50 120.5,8 120.5,35 50,80"></polygon>
        </g>
      </svg>
    </div>
  )
}
