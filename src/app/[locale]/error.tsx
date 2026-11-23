'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import en from '@/i18n/dictionaries/en'
import fr from '@/i18n/dictionaries/fr'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useParams<{ locale: string }>()
  const t = locale === 'en' ? en : fr
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <section className="grid min-h-[80svh] place-items-center bg-blueprint px-4 pt-24">
      <div className="text-center">
        <p className="font-mono text-sm text-danger">
          500{error.digest ? ` · ${error.digest}` : ''}
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{t.error.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.error.text}</p>
        <Button size="lg" className="mt-10" onClick={reset}>
          {t.error.retry}
        </Button>
      </div>
    </section>
  )
}
