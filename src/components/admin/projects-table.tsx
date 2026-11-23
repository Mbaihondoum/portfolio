'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { deleteProject, reorderProjects, setProjectStatus } from '@/server/actions/admin'
import { ActionButton, moveId } from './action-button'

type Row = {
  id: string
  slug: string
  title: string
  category: string
  status: 'draft' | 'published'
  isSample: boolean
  featured: boolean
}

const CATEGORY: Record<string, string> = {
  web: 'Web',
  mobile: 'Mobile',
  data: 'Data / BI',
  fullstack: 'Full stack',
}

export function ProjectsTable({ rows }: { rows: Row[] }) {
  const ids = rows.map((r) => r.id)
  if (!rows.length) return <p className="text-sm text-muted">Aucun projet. Créez le premier.</p>
  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <li
          key={row.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <span className="w-6 font-mono text-xs text-subtle">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1">
            <Link href={`/admin/projects/${row.id}`} className="font-medium hover:text-accent">
              {row.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge>{CATEGORY[row.category] ?? row.category}</Badge>
              <Badge tone={row.status === 'published' ? 'success' : 'neutral'}>
                {row.status === 'published' ? 'Publié' : 'Brouillon'}
              </Badge>
              {row.isSample && <Badge tone="danger">Exemple à remplacer</Badge>}
              {row.featured && <Badge tone="accent">Mis en avant</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ActionButton label="Monter" action={() => reorderProjects(moveId(ids, i, -1))}>
              ↑
            </ActionButton>
            <ActionButton label="Descendre" action={() => reorderProjects(moveId(ids, i, 1))}>
              ↓
            </ActionButton>
            <ActionButton
              variant="secondary"
              action={() =>
                setProjectStatus(row.id, row.status === 'published' ? 'draft' : 'published')
              }
            >
              {row.status === 'published' ? 'Dépublier' : 'Publier'}
            </ActionButton>
            <Link
              href={`/admin/projects/${row.id}`}
              className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Modifier
            </Link>
            <ActionButton
              variant="danger"
              confirm={`Supprimer définitivement « ${row.title} » ?`}
              action={() => deleteProject(row.id)}
            >
              Supprimer
            </ActionButton>
          </div>
        </li>
      ))}
    </ol>
  )
}
