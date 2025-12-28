"use client"

import React, { useRef, useEffect } from 'react'

export default function WavyGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  // --- Adjustable parameters (edit here or via canvas dataset / CSS vars) ---
  // Overview:
  // - You can edit these defaults directly in this file.
  // - Or set data attributes on the canvas element: `data-wavy-scale="10"` / `data-wavy-thickness="0.02"`
  // - Or define CSS custom properties on :root: `--wavy-scale` and `--wavy-thickness`.
  const DEFAULT_U_SCALE = 4.0 // one-fifth of previous 20.0
  const DEFAULT_THICKNESS = 0.003 // one-fifth of previous 0.015
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 640) return // only enable on mobile

    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true })
    if (!gl) return
    const glCtx = gl as WebGLRenderingContext

    // helpers
    const compile = (src: string, type: number) => {
      const s = glCtx.createShader(type)!
      glCtx.shaderSource(s, src)
      glCtx.compileShader(s)
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        console.error(glCtx.getShaderInfoLog(s))
      }
      return s
    }

    const vs = `attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

    const fs = `precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_res;
    uniform float u_scale;
    uniform float u_thickness;

    // animated grid lines (diagonal motion)
    void main(){
      vec2 uv = v_uv;
      float aspect = u_res.x / u_res.y;
      uv.x *= aspect;
      float s = max(1.0, u_scale);
      float t = u_time * 0.3;
      vec2 q = uv * s + vec2(t, t * 0.6);

      vec2 fq = fract(q);
      float dx = min(fq.x, 1.0 - fq.x);
      float dy = min(fq.y, 1.0 - fq.y);
      float edgeDist = min(dx, dy);
      float thickness = clamp(u_thickness, 0.001, 0.2);
      float line = 1.0 - smoothstep(thickness, thickness + 0.01, edgeDist);

      vec3 bg = vec3(0.980, 0.984, 0.992);
      vec3 lineCol = vec3(0.92, 0.92, 0.93);
      vec3 color = mix(bg, lineCol, line);
      gl_FragColor = vec4(color, 1.0);
    }`;

    const vshader = compile(vs, glCtx.VERTEX_SHADER)
    const fshader = compile(fs, glCtx.FRAGMENT_SHADER)
    const prog = glCtx.createProgram()!
    glCtx.attachShader(prog, vshader)
    glCtx.attachShader(prog, fshader)
    glCtx.linkProgram(prog)
    glCtx.useProgram(prog)

    const pos = glCtx.getAttribLocation(prog, 'a_pos')
    const buf = glCtx.createBuffer()!
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf)
    // two triangles covering clipspace
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), glCtx.STATIC_DRAW)
    glCtx.enableVertexAttribArray(pos)
    glCtx.vertexAttribPointer(pos, 2, glCtx.FLOAT, false, 0, 0)

    const u_time = glCtx.getUniformLocation(prog, 'u_time')
    const u_res = glCtx.getUniformLocation(prog, 'u_res')
    const u_scale = glCtx.getUniformLocation(prog, 'u_scale')
    const u_amp = glCtx.getUniformLocation(prog, 'u_amp')
    const u_thickness = glCtx.getUniformLocation(prog, 'u_thickness')

    function resize() {
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const w = Math.max(1, Math.floor(canvasEl.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvasEl.clientHeight * dpr))
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w
        canvasEl.height = h
        glCtx.viewport(0, 0, w, h)
      }
      if (u_res) glCtx.uniform2f(u_res, w / dpr, h / dpr)
    }

    let start = performance.now()
    function draw() {
      // ensure canvas still exists before drawing
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      resize()
      const t = (performance.now() - start) / 1000
      if (u_time) glCtx.uniform1f(u_time, t)

      // Resolve user-overridable values (dataset -> CSS var -> default)
      let scaleVal = DEFAULT_U_SCALE
      try {
        const ds = canvasEl.dataset
        if (ds && ds.wavyScale) scaleVal = parseFloat(ds.wavyScale) || scaleVal
        else {
          const cssScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wavy-scale') || '')
          if (!isNaN(cssScale) && cssScale > 0) scaleVal = cssScale
        }
      } catch {}

      let thicknessVal = DEFAULT_THICKNESS
      try {
        const ds = canvasEl.dataset
        if (ds && ds.wavyThickness) thicknessVal = parseFloat(ds.wavyThickness) || thicknessVal
        else {
          const cssTh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wavy-thickness') || '')
          if (!isNaN(cssTh) && cssTh > 0) thicknessVal = cssTh
        }
      } catch {}

      if (u_scale) glCtx.uniform1f(u_scale, scaleVal)
      if (u_amp) glCtx.uniform1f(u_amp, thicknessVal)
      if (u_thickness) glCtx.uniform1f(u_thickness, thicknessVal)

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      try { window.removeEventListener('resize', resize) } catch {}
      try { glCtx.deleteProgram(prog); glCtx.deleteShader(vshader); glCtx.deleteShader(fshader); } catch {}
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
    />
  )
}
