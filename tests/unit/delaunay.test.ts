import { describe, expect, it } from 'vitest'
import { delaunayEdges } from '@/lib/delaunay'

const key = ([a, b]: [number, number]) => `${Math.min(a, b)},${Math.max(a, b)}`

describe('delaunayEdges', () => {
  it('returns no edges below three points', () => {
    expect(delaunayEdges([])).toEqual([])
    expect(
      delaunayEdges([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([])
  })

  it('connects a single triangle', () => {
    const edges = delaunayEdges([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 8 },
    ])
    expect(edges.map(key).sort()).toEqual(['0,1', '0,2', '1,2'])
  })

  it('picks the Delaunay diagonal of a quadrilateral', () => {
    // D lies outside the circumcircle of ABC, so the diagonal is B–C, not A–D.
    const edges = delaunayEdges([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 11 },
    ]).map(key)
    expect(edges).toHaveLength(5)
    expect(edges).toContain('1,2')
    expect(edges).not.toContain('0,3')
  })

  it('produces a valid planar triangulation for a scattered set', () => {
    let seed = 42
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const n = 60
    const points = Array.from({ length: n }, () => ({ x: rand() * 1000, y: rand() * 600 }))
    const edges = delaunayEdges(points)
    const keys = edges.map(key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const [a, b] of edges) {
      expect(a).not.toBe(b)
      expect(a >= 0 && a < n && b >= 0 && b < n).toBe(true)
    }
    // Any triangulation of n points has between 2n - 3 and 3n - 6 edges.
    expect(edges.length).toBeGreaterThanOrEqual(2 * n - 3)
    expect(edges.length).toBeLessThanOrEqual(3 * n - 6)
    // Every point belongs to the mesh.
    const used = new Set(edges.flat())
    expect(used.size).toBe(n)
  })
})
