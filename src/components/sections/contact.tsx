import type { Dictionary } from '@/i18n'
import type { Locale } from '@/lib/types'
import type { PublicSettings } from '@/server/services/dto'
import { Reveal } from '@/components/motion/reveal'
import { LinkedInIcon, MailIcon, WhatsAppIcon, GitHubIcon } from '@/components/ui/icons'
import { ContactForm } from './contact-form'
import { SectionHeading } from './section-heading'

export function Contact({
  t,
  settings,
  locale,
}: {
  t: Dictionary
  settings: PublicSettings
  locale: Locale
}) {
  const links = [
    { href: `mailto:${settings.email}`, label: settings.email, icon: MailIcon, external: false },
    settings.linkedinUrl && {
      href: settings.linkedinUrl,
      label: 'LinkedIn',
      icon: LinkedInIcon,
      external: true,
    },
    settings.githubUrl && {
      href: settings.githubUrl,
      label: 'GitHub',
      icon: GitHubIcon,
      external: true,
    },
    settings.whatsapp && {
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`,
      label: 'WhatsApp',
      icon: WhatsAppIcon,
      external: true,
    },
  ].filter(Boolean) as { href: string; label: string; icon: typeof MailIcon; external: boolean }[]

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 py-24 sm:py-32"
      aria-label={t.contact.title}
    >
      <div className="container-page">
        <SectionHeading index={7} eyebrow={t.contact.title} title={t.contact.lead} />
        <div className="grid gap-16 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-7">
            <ContactForm locale={locale} labels={t.contact} />
          </Reveal>
          <Reveal delay={150} className="lg:col-span-4 lg:col-start-9">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">{t.contact.or}</p>
            <ul className="mt-5 flex flex-col gap-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    {...(l.external ? { target: '_blank', rel: 'noreferrer me' } : {})}
                    className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-accent/60"
                  >
                    <l.icon className="size-4 text-muted transition-colors group-hover:text-accent" />
                    <span className="truncate text-sm">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            {settings.location && <p className="mt-6 text-sm text-muted">{settings.location}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
