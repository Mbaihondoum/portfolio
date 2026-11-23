import Link from 'next/link'
import { getDictionary, getLocale } from '@/i18n'
import { buttonClass } from '@/components/ui/button'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  return (
    <section className="relative grid min-h-[80svh] place-items-center bg-blueprint px-4 pt-24">
      <div className="text-center">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-4 text-5xl font-semibold sm:text-7xl">{t.notFound.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.notFound.text}</p>
        <Link href={`/${locale}`} className={buttonClass('primary', 'lg', 'mt-10')}>
          {t.notFound.home}
        </Link>
      </div>
    </section>
  )
}
