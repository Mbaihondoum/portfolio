import Link from 'next/link'
import { AdminNav } from '@/components/admin/admin-nav'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/server/auth'
import { signOutAction } from '@/server/actions/admin'
import { messagesRepository } from '@/server/repositories'

export default async function PanelLayout({ children }: LayoutProps<'/admin'>) {
  const admin = await requireAdmin()
  const unread = await messagesRepository.countUnread()
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-4 p-3 lg:p-4">
          <div className="flex items-center justify-between gap-3 px-2 pt-1">
            <Link href="/admin" className="font-mono text-xs tracking-widest text-accent uppercase">
              Admin
            </Link>
            <Link href="/" className="text-xs text-muted hover:text-accent" target="_blank">
              Voir le site ↗
            </Link>
          </div>
          <AdminNav unread={unread} />
          <div className="mt-auto hidden border-t border-border pt-4 lg:block">
            <p className="truncate px-2 text-xs text-muted" title={admin.email}>
              {admin.email}
            </p>
            <form action={signOutAction} className="mt-2">
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
                Se déconnecter
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main id="content" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
        <form action={signOutAction} className="mt-10 lg:hidden">
          <Button type="submit" variant="ghost" size="sm">
            Se déconnecter ({admin.email})
          </Button>
        </form>
      </main>
    </div>
  )
}
