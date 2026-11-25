export type Point = { x: number; y: number }

/**
 * Delaunay triangulation (Bowyer–Watson), returned as unique edges [i, j].
 * O(n²) — run once per resize on ~100 points, never per frame.
 */
export function delaunayEdges(points: Point[]): Array<[number, number]> {
  const n = points.length
  if (n < 3) return []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  const d = Math.max(maxX - minX, maxY - minY) * 20
  const mx = (minX + maxX) / 2
  const my = (minY + maxY) / 2
  // Super-triangle enclosing every point (indices n, n+1, n+2).
  const pts = [...points, { x: mx - d, y: my - d }, { x: mx, y: my + d }, { x: mx + d, y: my - d }]

  type Tri = { a: number; b: number; c: number; cx: number; cy: number; r2: number }
  const make = (a: number, b: number, c: number): Tri => {
    const A = pts[a]!
    const B = pts[b]!
    const C = pts[c]!
    const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y))
    const a2 = A.x * A.x + A.y * A.y
    const b2 = B.x * B.x + B.y * B.y
    const c2 = C.x * C.x + C.y * C.y
    const cx = (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / D
    const cy = (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / D
    return { a, b, c, cx, cy, r2: (A.x - cx) ** 2 + (A.y - cy) ** 2 }
  }

  let tris: Tri[] = [make(n, n + 1, n + 2)]
  for (let i = 0; i < n; i++) {
    const p = pts[i]!
    const bad: Tri[] = []
    const keep: Tri[] = []
    for (const t of tris) {
      if ((p.x - t.cx) ** 2 + (p.y - t.cy) ** 2 < t.r2) bad.push(t)
      else keep.push(t)
    }
    // Boundary of the cavity = edges that belong to exactly one bad triangle.
    const count = new Map<string, [number, number, number]>()
    for (const t of bad) {
      for (const [u, v] of [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ] as const) {
        const key = u < v ? `${u},${v}` : `${v},${u}`
        const prev = count.get(key)
        count.set(key, prev ? [u, v, prev[2] + 1] : [u, v, 1])
      }
    }
    tris = keep
    for (const [u, v, c] of count.values()) if (c === 1) tris.push(make(u, v, i))
  }

  const edges = new Map<string, [number, number]>()
  for (const t of tris) {
    for (const [u, v] of [
      [t.a, t.b],
      [t.b, t.c],
      [t.c, t.a],
    ] as const) {
      if (u >= n || v >= n) continue
      const key = u < v ? `${u},${v}` : `${v},${u}`
      if (!edges.has(key)) edges.set(key, u < v ? [u, v] : [v, u])
    }
  }
  return [...edges.values()]
}
