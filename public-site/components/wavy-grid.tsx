"use client"

import React, { useRef, useEffect } from 'react'

export default function WavyGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 640) return // only enable on mobile

    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true })
    if (!gl) return

    // helpers
    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s))
      }
      return s
    }

    const vs = `attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

    const fs = `precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_res;
    uniform float u_scale;
    uniform float u_amp;

    // simple diagonal-wavy displacement + checkerboard
    void main(){
      vec2 uv = v_uv;
      float aspect = u_res.x / u_res.y;
      uv.x *= aspect;
      float s = u_scale;
      float t = u_time * 0.5;
      vec2 p = uv * s;
      float dx = sin(p.y * 2.0 + t) * 0.02 + sin(p.y * 4.0 + t * 1.3) * 0.01;
      float dy = sin(p.x * 2.0 + t * 1.2) * 0.02;
      vec2 d = vec2(dx, dy) * u_amp;
      vec2 q = uv + d;
      vec2 c = floor(q * s + 0.0);
      float checker = mod(c.x + c.y, 2.0);
      vec3 bg = vec3(0.980, 0.984, 0.992);
      vec3 line = vec3(0.92, 0.92, 0.93);
      vec3 color = mix(bg, line, checker);
      gl_FragColor = vec4(color, 1.0);
    }`;

    const vshader = compile(vs, gl.VERTEX_SHADER)
    const fshader = compile(fs, gl.FRAGMENT_SHADER)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vshader)
    gl.attachShader(prog, fshader)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const pos = gl.getAttribLocation(prog, 'a_pos')
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    // two triangles covering clipspace
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const u_time = gl.getUniformLocation(prog, 'u_time')
    const u_res = gl.getUniformLocation(prog, 'u_res')
    const u_scale = gl.getUniformLocation(prog, 'u_scale')
    const u_amp = gl.getUniformLocation(prog, 'u_amp')

    function resize() {
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const w = Math.max(1, Math.floor(canvasEl.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvasEl.clientHeight * dpr))
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w
        canvasEl.height = h
        gl.viewport(0, 0, w, h)
      }
      if (u_res) gl.uniform2f(u_res, w / dpr, h / dpr)
    }

    let start = performance.now()
    function draw() {
      // ensure canvas still exists before drawing
      if (!canvasRef.current) return
      resize()
      const t = (performance.now() - start) / 1000
      if (u_time) gl.uniform1f(u_time, t)
      if (u_scale) gl.uniform1f(u_scale, 6.0)
      if (u_amp) gl.uniform1f(u_amp, 1.0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      try { window.removeEventListener('resize', resize) } catch {}
      try { gl.deleteProgram(prog); gl.deleteShader(vshader); gl.deleteShader(fshader); } catch {}
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
