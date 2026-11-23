'use client'

import { useEffect, useRef } from 'react'
import { useMotion } from '@/components/motion/motion-provider'

/**
 * Living background: a slow network of nodes and links (data / architecture
 * metaphor) with mouse parallax. Canvas 2D, ~60 nodes, paused off-screen and
 * when the tab is hidden. Full tier only; others get the static gradient.
 */
export function HeroBackground() {
  const { tier } = useMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || tier === 'none') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#38bdf8'
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const count = tier === 'full' ? 64 : 28
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
      z: 0.3 + Math.random() * 0.7,
    }))
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let raf = 0
    let running = true

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      const ox = (mouse.x - 0.5) * 40
      const oy = (mouse.y - 0.5) * 40
      const pts = nodes.map((n) => {
        n.x = (n.x + n.vx + 1) % 1
        n.y = (n.y + n.vy + 1) % 1
        return { px: n.x * w + ox * n.z, py: n.y * h + oy * n.z, z: n.z }
      })
      const maxDist = Math.min(180, w / 6)
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]!
          const d = Math.hypot(a.px - b.px, a.py - b.py)
          if (d < maxDist) {
            ctx.globalAlpha = (1 - d / maxDist) * 0.22 * a.z
            ctx.strokeStyle = accent
            ctx.beginPath()
            ctx.moveTo(a.px, a.py)
            ctx.lineTo(b.px, b.py)
            ctx.stroke()
          }
        }
      }
      for (const p of pts) {
        ctx.globalAlpha = 0.35 + p.z * 0.5
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(p.px, p.py, 1 + p.z * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (running && tier === 'full') raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = e.clientY / window.innerHeight
    }
    const io = new IntersectionObserver(([entry]) => {
      const visible = !!entry?.isIntersecting && !document.hidden
      if (visible && !running && tier === 'full') {
        running = true
        raf = requestAnimationFrame(draw)
      } else if (!visible) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(canvas)
    window.addEventListener('resize', resize)
    if (tier === 'full') window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [tier])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-blueprint [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_75%)]" />
      <div className="absolute -top-1/3 left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] blur-2xl" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
