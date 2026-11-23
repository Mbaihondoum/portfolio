import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader, Panel } from '@/components/admin/page-header'
import { RankList, ViewsChart } from '@/components/admin/dashboard-charts'
import { cn } from '@/lib/cn'
import { getAnalyticsDashboard } from '@/server/services/analytics'
import { messagesRepository, projectsRepository } from '@/server/repositories'

export const metadata: Metadata = { title: 'Tableau de bord' }

const RANGES = [7, 30, 90] as const
const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  tablet: 'Tablette',
  desktop: 'Ordinateur',
}
const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' })
const country = (code: string) => {
  if (code === '??') return 'Inconnu'
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

export default async function DashboardPage({ searchParams }: PageProps<'/admin'>) {
  const { days: raw } = await searchParams
  const days = RANGES.find((r) => String(r) === raw) ?? 30
  const [stats, unread, byStatus] = await Promise.all([
    getAnalyticsDashboard(days),
    messagesRepository.countUnread(),
    projectsRepository.countByStatus(),
  ])
  const published = byStatus.find((s) => s.status === 'published')?.count ?? 0
  const drafts = byStatus.find((s) => s.status === 'draft')?.count ?? 0
  const half = Math.floor(stats.daily.length / 2)
  const prev = stats.daily.slice(0, half).reduce((a, d) => a + d.views, 0)
  const curr = stats.daily.slice(half).reduce((a, d) => a + d.views, 0)
  const delta = prev ? Math.round(((curr - prev) / prev) * 100) : null

  const tiles = [
    { label: `Pages vues (${days} j)`, value: stats.totals.views, delta },
    { label: 'Vues de projets', value: stats.totals.projectViews },
    { label: 'Projets publiés', value: published, sub: `${drafts} brouillon(s)` },
    { label: 'Messages non lus', value: unread, href: '/admin/messages' },
  ]

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Statistiques anonymes : aucun cookie, aucune IP, aucun identifiant stocké."
      />
      <div
        role="group"
        aria-label="Période"
        className="mb-6 flex w-fit gap-1 rounded-full border border-border bg-surface p-1 text-sm"
      >
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin?days=${r}`}
            aria-current={r === days ? 'true' : undefined}
            className={cn(
              'rounded-full px-3.5 py-1.5 transition-colors',
              r === days ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {r} jours
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {new Intl.NumberFormat('fr-FR').format(t.value)}
            </p>
            {'delta' in t && t.delta !== null && t.delta !== undefined && (
              <p
                className={cn(
                  'mt-1 font-mono text-xs',
                  t.delta >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {t.delta >= 0 ? '▲' : '▼'} {Math.abs(t.delta)} % vs période précédente
              </p>
            )}
            {'sub' in t && <p className="mt-1 text-xs text-subtle">{t.sub}</p>}
            {'href' in t && t.href && (
              <Link href={t.href} className="mt-1 inline-block text-xs text-accent hover:underline">
                Ouvrir la boîte de réception →
              </Link>
            )}
          </div>
        ))}
      </div>

      <Panel title={`Pages vues par jour — ${days} derniers jours`} className="mt-4">
        <ViewsChart daily={stats.daily} />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Projets les plus consultés">
          <RankList
            items={stats.topProjects.map((p) => ({ label: p.key ?? '—', value: p.count }))}
          />
        </Panel>
        <Panel title="Pages les plus vues">
          <RankList items={stats.topPaths.map((p) => ({ label: p.key, value: p.count }))} />
        </Panel>
        <Panel title="Pays">
          <RankList
            items={stats.countries.map((c) => ({ label: country(c.key), value: c.count }))}
          />
        </Panel>
        <Panel title="Appareils">
          <RankList
            items={stats.devices.map((d) => ({
              label: DEVICE_LABELS[d.key] ?? d.key,
              value: d.count,
            }))}
          />
        </Panel>
        <Panel title="Langue">
          <RankList
            items={stats.locales.map((l) => ({
              label: l.key === 'fr' ? 'Français' : 'English',
              value: l.count,
            }))}
          />
        </Panel>
        <Panel title="Sites référents">
          <RankList
            items={stats.referrers.map((r) => ({ label: r.key ?? '—', value: r.count }))}
            empty="Aucun référent externe"
          />
        </Panel>
      </div>
    </>
  )
}
