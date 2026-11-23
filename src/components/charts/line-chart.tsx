'use client'

import { useId, useMemo, useState, type KeyboardEvent } from 'react'
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
  /** Show every Nth x label (auto by default). */
  labelEvery?: number
  columns?: [string, string]
}

const PAD = { top: 16, right: 16, bottom: 28, left: 44 }

/**
 * Single-series line chart: 2px line, 10% area wash, recessive hairline grid,
 * crosshair + tooltip on pointer and keyboard, draws itself when in view.
 */
export function LineChart({
  title,
  labels,
  values,
  height = 240,
  format = (v) => String(Math.round(v)),
  labelEvery,
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
    const x = (i: number) =>
      PAD.left + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w)
    const y = (v: number) => PAD.top + h - (v / max) * h
    const line = values
      .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join('')
    const area = `${line}L${x(values.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`
    const every =
      labelEvery ?? Math.max(1, Math.ceil(values.length / Math.max(2, Math.floor(w / 70))))
    return { ticks, x, y, line, area, every, w }
  }, [values, width, height, labelEvery])

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left - PAD.left
    const i = Math.round((px / geo.w) * (values.length - 1))
    setActive(Math.min(values.length - 1, Math.max(0, i)))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => Math.min(values.length - 1, (a ?? -1) + 1))
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? values.length) - 1))
    else if (e.key === 'Escape') setActive(null)
    else return
    e.preventDefault()
  }

  const last = values.length - 1
  return (
    <div ref={viewRef} className="w-full">
      <div ref={wrapRef} className="relative w-full" style={{ height }}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={`${id}-t`}
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          className="block touch-pan-y overflow-visible rounded-md focus-visible:outline-2"
        >
          <title id={`${id}-t`}>{title}</title>
          <defs>
            <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
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
          {labels.map((l, i) =>
            i % geo.every === 0 || i === last ? (
              <text
                key={l + i}
                x={geo.x(i)}
                y={height - 8}
                textAnchor="middle"
                className="fill-subtle font-mono text-[10px]"
              >
                {l}
              </text>
            ) : null,
          )}
          <path
            d={geo.area}
            fill={`url(#${id}-a)`}
            style={{ opacity: inView ? 1 : 0, transition: 'opacity 900ms var(--ease-out) 300ms' }}
          />
          <path
            d={geo.line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{
              strokeDashoffset: inView ? 0 : 1,
              transition: 'stroke-dashoffset 1400ms var(--ease-in-out)',
            }}
          />
          <circle
            cx={geo.x(last)}
            cy={geo.y(values[last] ?? 0)}
            r={4}
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth={2}
            style={{ opacity: inView ? 1 : 0, transition: 'opacity 300ms 1300ms' }}
          />
          {active !== null && (
            <g>
              <line
                x1={geo.x(active)}
                x2={geo.x(active)}
                y1={PAD.top}
                y2={height - PAD.bottom}
                stroke="var(--border-strong)"
              />
              <circle
                cx={geo.x(active)}
                cy={geo.y(values[active] ?? 0)}
                r={5}
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
        {active !== null && (
          <Tooltip x={geo.x(active)} y={geo.y(values[active] ?? 0)}>
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
