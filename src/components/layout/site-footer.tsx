import Link from 'next/link'
import type { Dictionary } from '@/i18n'
import type { Locale } from '@/lib/types'
import type { PublicSettings } from '@/server/services/dto'
import { GitHubIcon, LinkedInIcon } from '@/components/ui/icons'
import { currentYear } from '@/lib/year'

export async function SiteFooter({
  t,
  settings,
  locale,
}: {
  t: Dictionary
  settings: PublicSettings
  locale: Locale
}) {
  const year = await currentYear()
  return (
    <footer className="border-t border-border py-12">
      <div className="container-page flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-semibold">{settings.fullName}</p>
            <p className="mt-1 text-sm text-muted">{settings.headline}</p>
          </div>
          {settings.cvUrl ? (
            <a
              href={settings.cvUrl}
              download
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-current"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
              {t.footer.cv} (PDF)
            </a>
          ) : (
            <span className="text-sm text-subtle">{t.footer.cvMissing}</span>
          )}
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {(['about', 'skills', 'projects', 'experience', 'services', 'contact'] as const).map(
            (id) => (
              <Link key={id} href={`/${locale}#${id}`} className="hover:text-foreground">
                {t.nav[id]}
              </Link>
            ),
          )}
          <Link href={`/${locale}/docs/api`} className="hover:text-foreground">
            {t.footer.api}
          </Link>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-subtle">
          <p>
            © {year} {settings.fullName}. {t.footer.rights} {t.footer.built}
          </p>
          <div className="flex items-center gap-1">
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer me"
                aria-label="GitHub"
                className="grid size-9 place-items-center rounded-full hover:text-accent"
              >
                <GitHubIcon className="size-4" />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer me"
                aria-label="LinkedIn"
                className="grid size-9 place-items-center rounded-full hover:text-accent"
              >
                <LinkedInIcon className="size-4" />
              </a>
            )}
            <a href="#top" className="ml-2 hover:text-foreground">
              {t.footer.backToTop} ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
