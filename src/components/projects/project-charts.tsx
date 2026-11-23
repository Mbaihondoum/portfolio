'use client'

import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import type { Locale } from '@/lib/types'

type Chart = {
  id: string
  type: 'line' | 'bar'
  title: string
  unit?: string
  labels: string[]
  values: number[]
}

export function ProjectCharts({ charts, locale }: { charts: Chart[]; locale: Locale }) {
  const nf = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB')
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {charts.map((c) => {
        const format = (v: number) => `${nf.format(v)}${c.unit ? ` ${c.unit}` : ''}`
        const columns: [string, string] = [
          locale === 'fr' ? 'Période' : 'Period',
          c.unit ?? (locale === 'fr' ? 'Valeur' : 'Value'),
        ]
        return (
          <figure
            key={c.id}
            className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <figcaption className="mb-4 text-sm font-medium text-muted">{c.title}</figcaption>
            {c.type === 'line' ? (
              <LineChart
                title={c.title}
                labels={c.labels}
                values={c.values}
                format={format}
                columns={columns}
              />
            ) : (
              <BarChart
                title={c.title}
                labels={c.labels}
                values={c.values}
                format={format}
                columns={columns}
              />
            )}
          </figure>
        )
      })}
    </div>
  )
}
