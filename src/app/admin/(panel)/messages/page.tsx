import type { Metadata } from 'next'
import Link from 'next/link'
import { ActionButton } from '@/components/admin/action-button'
import { PageHeader } from '@/components/admin/page-header'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { deleteMessage, setMessageStatus } from '@/server/actions/admin'
import { messagesRepository } from '@/server/repositories'
import { requireAdmin } from '@/server/auth'

export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesPage({ searchParams }: PageProps<'/admin/messages'>) {
  await requireAdmin()
  const { view } = await searchParams
  const filter = view === 'archived' ? 'archived' : 'inbox'
  const messages = await messagesRepository.list(filter)
  return (
    <>
      <PageHeader
        title="Messages"
        description="Reçus via le formulaire de contact. Répondez directement par email."
      />
      <div className="mb-5 flex w-fit gap-1 rounded-full border border-border bg-surface p-1 text-sm">
        {(['inbox', 'archived'] as const).map((f) => (
          <Link
            key={f}
            href={f === 'inbox' ? '/admin/messages' : '/admin/messages?view=archived'}
            aria-current={f === filter ? 'true' : undefined}
            className={cn(
              'rounded-full px-3.5 py-1.5',
              f === filter
                ? 'bg-accent text-accent-foreground'
                : 'text-muted hover:text-foreground',
            )}
          >
            {f === 'inbox' ? 'Boîte de réception' : 'Archives'}
          </Link>
        ))}
      </div>
      {!messages.length && <p className="text-sm text-muted">Aucun message.</p>}
      <ul className="flex flex-col gap-3">
        {messages.map((m) => (
          <li key={m.id}>
            <details
              className={cn(
                'group rounded-2xl border bg-surface',
                m.status === 'new' ? 'border-accent/50' : 'border-border',
              )}
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                {m.status === 'new' && <Badge tone="accent">Nouveau</Badge>}
                <span className="font-medium">{m.subject}</span>
                <span className="text-sm text-muted">
                  {m.name} · {m.email}
                </span>
                <span className="ml-auto font-mono text-xs text-subtle">
                  {formatDate(m.createdAt)}
                </span>
              </summary>
              <div className="border-t border-border p-4">
                <p className="text-sm whitespace-pre-wrap text-foreground">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                    className="rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground"
                  >
                    Répondre
                  </a>
                  {m.status === 'new' ? (
                    <ActionButton
                      variant="secondary"
                      action={setMessageStatus.bind(null, m.id, 'read')}
                    >
                      Marquer comme lu
                    </ActionButton>
                  ) : (
                    <ActionButton variant="ghost" action={setMessageStatus.bind(null, m.id, 'new')}>
                      Marquer non lu
                    </ActionButton>
                  )}
                  {m.status !== 'archived' ? (
                    <ActionButton
                      variant="ghost"
                      action={setMessageStatus.bind(null, m.id, 'archived')}
                    >
                      Archiver
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="ghost"
                      action={setMessageStatus.bind(null, m.id, 'read')}
                    >
                      Désarchiver
                    </ActionButton>
                  )}
                  <ActionButton
                    variant="danger"
                    confirm="Supprimer définitivement ce message ?"
                    action={deleteMessage.bind(null, m.id)}
                  >
                    Supprimer
                  </ActionButton>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  )
}
