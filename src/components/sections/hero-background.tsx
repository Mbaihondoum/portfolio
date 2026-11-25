'use client'

import { useEffect, useRef } from 'react'
import { useMotion } from '@/components/motion/motion-provider'
import { delaunayEdges } from '@/lib/delaunay'

type Node = { bx: number; by: number; amp: number; phase: number; speed: number; z: number }

/** Jittered grid (even spread, no clumps), overflowing the edges so the mesh has no visible hull. */
function makeNodes(w: number, h: number): Node[] {
  const cell = Math.min(150, Math.max(90, w / 9))
  const nodes: Node[] = []
  for (let y = -cell; y < h + cell; y += cell) {
    for (let x = -cell; x < w + cell; x += cell) {
      nodes.push({
        bx: x + (Math.random() - 0.5) * cell * 0.7,
        by: y + (Math.random() - 0.5) * cell * 0.7,
        amp: 4 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00025 + Math.random() * 0.00035,
        z: 0.3 + Math.random() * 0.7,
      })
    }
  }
  return nodes
}

/**
 * Living background: a crisp blueprint grid under a blue triangulated mesh
 * (data / architecture metaphor). Nodes drift around fixed anchors, so the
 * triangulation is computed once per resize and edges never pop. Full tier:
 * animated + mouse parallax, paused off-screen. Lite / reduced motion: the
 * same mesh, drawn once and static.
 */
export function HeroBackground() {
  const { tier } = useMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const animated = tier === 'full'
    const readAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0369a1'
    let accent = readAccent()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let nodes: Node[] = []
    let edges: Array<[number, number]> = []
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let raf = 0
    let running = animated

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      nodes = makeNodes(w, h)
      edges = delaunayEdges(nodes.map((n) => ({ x: n.bx, y: n.by })))
    }

    const draw = (time = 0) => {
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      const ox = (mouse.x - 0.5) * 30
      const oy = (mouse.y - 0.5) * 30
      const pts = nodes.map((n) => ({
        x: n.bx + Math.sin(time * n.speed + n.phase) * n.amp + ox * n.z,
        y: n.by + Math.cos(time * n.speed * 0.8 + n.phase) * n.amp + oy * n.z,
        z: n.z,
      }))
      ctx.strokeStyle = accent
      ctx.lineWidth = 1
      for (const [i, j] of edges) {
        const a = pts[i]!
        const b = pts[j]!
        ctx.globalAlpha = 0.16 + 0.2 * ((a.z + b.z) / 2)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.fillStyle = accent
      for (const p of pts) {
        ctx.globalAlpha = 0.6 + p.z * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.4 + p.z * 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (running) raf = requestAnimationFrame(draw)
    }

    // Follow the light/dark toggle (it only changes <html data-theme>).
    const themeObserver = new MutationObserver(() => {
      accent = readAccent()
      if (!animated) draw()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    resize()
    if (animated) raf = requestAnimationFrame(draw)
    else draw()

    const onResize = () => {
      resize()
      if (!animated) draw()
    }
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = e.clientY / window.innerHeight
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!animated) return
      const visible = !!entry?.isIntersecting && !document.hidden
      if (visible && !running) {
        running = true
        raf = requestAnimationFrame(draw)
      } else if (!visible) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(canvas)
    window.addEventListener('resize', onResize)
    if (animated) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [tier])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-blueprint" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
