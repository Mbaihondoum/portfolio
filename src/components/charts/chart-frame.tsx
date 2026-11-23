import type { ReactNode } from 'react'

/** Accessible data table mirroring a chart (screen readers + no-hover access). */
export function ChartTable({
  caption,
  labels,
  values,
  format,
  columns,
}: {
  caption: string
  labels: string[]
  values: number[]
  format: (v: number) => string
  columns: [string, string]
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns[0]}</th>
          <th scope="col">{columns[1]}</th>
        </tr>
      </thead>
      <tbody>
        {labels.map((label, i) => (
          <tr key={label + i}>
            <th scope="row">{label}</th>
            <td>{format(values[i] ?? 0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Tooltip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border-strong bg-surface-2/95 px-3 py-2 text-xs whitespace-nowrap shadow-xl backdrop-blur"
      style={{ left: x, top: y - 10 }}
    >
      {children}
    </div>
  )
}
