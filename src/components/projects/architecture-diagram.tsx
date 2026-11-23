import type { ArchitectureDiagram as Diagram, ArchitectureLayer } from '@/lib/types'

const COL_W = 240
const NODE_W = 184
const NODE_H = 60
const ROW_H = 92
const PAD = 24

/**
 * Columns follow the data flow: each node sits one column after its deepest
 * upstream node (longest path in the graph), so pipelines read left → right
 * whatever their layers. Nodes show their layer as a small tag.
 */
export function layoutDiagram(diagram: Diagram) {
  const depth = new Map(diagram.nodes.map((n) => [n.id, 0]))
  for (let pass = 0; pass < diagram.nodes.length; pass++) {
    let changed = false
    for (const e of diagram.edges) {
      const d = (depth.get(e.from) ?? 0) + 1
      if (depth.has(e.to) && d > (depth.get(e.to) ?? 0) && d < diagram.nodes.length) {
        depth.set(e.to, d)
        changed = true
      }
    }
    if (!changed) break
  }
  const columns: string[][] = []
  for (const n of diagram.nodes) (columns[depth.get(n.id) ?? 0] ??= []).push(n.id)
  const cols = columns.filter(Boolean)
  const maxRows = Math.max(1, ...cols.map((c) => c.length))
  const pos = new Map<string, { x: number; y: number }>()
  cols.forEach((ids, c) => {
    const offset = ((maxRows - ids.length) * ROW_H) / 2
    ids.forEach((id, r) => pos.set(id, { x: PAD + c * COL_W, y: PAD + offset + r * ROW_H }))
  })
  return {
    pos,
    width: PAD * 2 + (cols.length - 1) * COL_W + NODE_W,
    height: PAD * 2 + (maxRows - 1) * ROW_H + NODE_H,
  }
}

export function ArchitectureDiagram({
  diagram,
  layerLabels,
  title,
}: {
  diagram: Diagram
  layerLabels: Record<ArchitectureLayer, string>
  title: string
}) {
  const { pos, width, height } = layoutDiagram(diagram)
  const edges = diagram.edges
    .map((e, i) => {
      const a = pos.get(e.from)
      const b = pos.get(e.to)
      if (!a || !b) return null
      const forward = b.x > a.x
      const x1 = forward ? a.x + NODE_W : a.x + NODE_W / 2
      const y1 = forward ? a.y + NODE_H / 2 : a.y + NODE_H
      const x2 = forward ? b.x : b.x + NODE_W / 2
      const y2 = forward ? b.y + NODE_H / 2 : b.y
      const dx = (x2 - x1) / 2
      const d = forward
        ? `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
        : `M${x1},${y1} C${x1},${y1 + 30} ${x2},${y2 - 30} ${x2},${y2}`
      return { d, label: e.label, i, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)

  return (
    <div className="arch overflow-x-auto" data-lenis-prevent>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto h-auto w-full min-w-[34rem]"
        style={{ maxWidth: width * 1.15 }}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <desc>
          {diagram.edges
            .map((e) => {
              const from = diagram.nodes.find((n) => n.id === e.from)?.label
              const to = diagram.nodes.find((n) => n.id === e.to)?.label
              return `${from} → ${to}${e.label ? ` (${e.label})` : ''}`
            })
            .join('; ')}
        </desc>
        {edges.map((e) => (
          <g key={e.i}>
            <path d={e.d} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />
            <path
              d={e.d}
              className="arch-edge"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
              pathLength={1}
              style={{ ['--edge-i' as string]: e.i }}
            />
            <circle
              r={3.5}
              className="arch-packet"
              fill="var(--accent)"
              style={{ offsetPath: `path('${e.d}')`, ['--edge-i' as string]: e.i }}
            />
            {e.label && (
              <text
                x={e.mx}
                y={e.my - 9}
                textAnchor="middle"
                className="fill-muted font-mono text-[10px]"
                paintOrder="stroke"
                stroke="var(--surface)"
                strokeWidth={4}
              >
                {e.label}
              </text>
            )}
          </g>
        ))}
        {diagram.nodes.map((n) => {
          const p = pos.get(n.id)
          if (!p) return null
          return (
            <g key={n.id} transform={`translate(${p.x} ${p.y})`}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={12}
                fill="var(--surface-2)"
                stroke="var(--border-strong)"
              />
              <text
                x={16}
                y={22}
                className="fill-accent font-mono text-[9px] tracking-widest uppercase"
              >
                {layerLabels[n.layer]}
              </text>
              <text x={16} y={43} className="fill-foreground text-[13px]">
                {n.label.length > 24 ? `${n.label.slice(0, 23)}…` : n.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
