'use client'

import { LineChart } from '@/components/charts/line-chart'
import { BarList } from '@/components/charts/bar-list'

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v)

export function ViewsChart({ daily }: { daily: { day: string; views: number }[] }) {
  return (
    <LineChart
      title="Pages vues par jour"
      labels={daily.map((d) => d.day.slice(5).split('-').reverse().join('/'))}
      values={daily.map((d) => d.views)}
      format={fmt}
      columns={['Jour', 'Pages vues']}
      height={260}
    />
  )
}

export function RankList({
  items,
  empty = 'Pas encore de données',
}: {
  items: { label: string; value: number }[]
  empty?: string
}) {
  return <BarList items={items} format={fmt} empty={empty} />
}
