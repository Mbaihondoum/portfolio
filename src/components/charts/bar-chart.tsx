'use client'

import { useId, useMemo, useState } from 'react'
import { niceTicks } from '@/lib/format'
import { useInView } from '@/hooks/use-in-view'
import { ChartTable, Tooltip } from './chart-frame'
import { useElementWidth } from './use-size'

type Props = {
  title: string
  labels: string[]
  values: number[]
  height?: number
  format?: (v: number) => string
  columns?: [string, string]
}

const PAD = { top: 22, right: 8, bottom: 28, left: 40 }

/** Single-series column chart: ≤24px columns, 4px rounded tops, grow-in on view. */
export function BarChart({
  title,
  labels,
  values,
  height = 240,
  format = (v) => String(Math.round(v)),
  columns = ['', ''],
}: Props) {
  const id = useId()
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()
  const [viewRef, inView] = useInView<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const geo = useMemo(() => {
    const ticks = niceTicks(Math.max(...values, 1))
    const max = ticks.at(-1) ?? 1
    const w = width - PAD.left - PAD.right
    const h = height - PAD.top - PAD.bottom
    const band = w / values.length
    const barW = Math.min(24, band * 0.6)
    const cx = (i: number) => PAD.left + band * i + band / 2
    const y = (v: number) => PAD.top + h - (v / max) * h
    return { ticks, band, barW, cx, y, base: PAD.top + h }
  }, [values, width, height])

  const maxIndex = values.indexOf(Math.max(...values))
  return (
    <div ref={viewRef} className="w-full">
      <div ref={wrapRef} className="relative w-full" style={{ height }}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={`${id}-t`}
          className="block overflow-visible"
        >
          <title id={`${id}-t`}>{title}</title>
          {geo.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={geo.y(t)}
                y2={geo.y(t)}
                stroke="var(--border)"
              />
              <text
                x={PAD.left - 8}
                y={geo.y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-subtle font-mono text-[10px]"
              >
                {format(t)}
              </text>
            </g>
          ))}
          {values.map((v, i) => {
            const top = geo.y(v)
            const h = Math.max(0, geo.base - top)
            const r = Math.min(4, h / 2, geo.barW / 2)
            const x0 = geo.cx(i) - geo.barW / 2
            const x1 = x0 + geo.barW
            const d = `M${x0},${geo.base}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x1 - r}Q${x1},${top} ${x1},${top + r}V${geo.base}Z`
            return (
              <g key={labels[i] ?? i}>
                <path
                  d={d}
                  fill="var(--accent)"
                  fillOpacity={active === null || active === i ? 1 : 0.45}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'bottom',
                    transform: `scaleY(${inView ? 1 : 0})`,
                    transition: `transform 900ms var(--ease-expo) ${i * 70}ms, fill-opacity 150ms`,
                  }}
                />
                {i === maxIndex && (
                  <text
                    x={geo.cx(i)}
                    y={top - 6}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[10px]"
                    style={{ opacity: inView ? 1 : 0, transition: 'opacity 300ms 900ms' }}
                  >
                    {format(v)}
                  </text>
                )}
                <text
                  x={geo.cx(i)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-subtle font-mono text-[10px]"
                >
                  {labels[i]}
                </text>
                <rect
                  x={geo.cx(i) - geo.band / 2}
                  y={PAD.top}
                  width={geo.band}
                  height={geo.base - PAD.top}
                  fill="transparent"
                  tabIndex={0}
                  role="presentation"
                  aria-label={`${labels[i]}: ${format(v)}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="outline-none"
                />
              </g>
            )
          })}
        </svg>
        {active !== null && (
          <Tooltip x={geo.cx(active)} y={geo.y(values[active] ?? 0)}>
            <strong className="block font-mono text-sm text-foreground">
              {format(values[active] ?? 0)}
            </strong>
            <span className="text-muted">{labels[active]}</span>
          </Tooltip>
        )}
      </div>
      <ChartTable
        caption={title}
        labels={labels}
        values={values}
        format={format}
        columns={columns}
      />
    </div>
  )
}
