import { describe, expect, it } from 'vitest'
import { layoutDiagram } from '@/components/projects/architecture-diagram'

describe('layoutDiagram', () => {
  it('places nodes by data-flow depth', () => {
    const { pos } = layoutDiagram({
      nodes: [
        { id: 'report', label: 'Report', layer: 'client' },
        { id: 'erp', label: 'ERP', layer: 'external' },
        { id: 'model', label: 'Model', layer: 'data' },
      ],
      edges: [
        { from: 'erp', to: 'model' },
        { from: 'model', to: 'report' },
      ],
    })
    expect(pos.get('erp')!.x).toBeLessThan(pos.get('model')!.x)
    expect(pos.get('model')!.x).toBeLessThan(pos.get('report')!.x)
  })

  it('terminates on cycles', () => {
    const { pos } = layoutDiagram({
      nodes: [
        { id: 'a', label: 'A', layer: 'api' },
        { id: 'b', label: 'B', layer: 'api' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },
      ],
    })
    expect(pos.size).toBe(2)
  })
})
