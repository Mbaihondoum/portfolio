import type { Metadata } from 'next'
import { getDictionary, getLocale } from '@/i18n'
import { buildOpenApiDocument } from '@/lib/openapi'
import { siteUrl } from '@/lib/site'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'API' }

type Op = {
  summary?: string
  description?: string
  parameters?: {
    name: string
    in: string
    required?: boolean
    schema?: { type?: string; enum?: string[] }
  }[]
  requestBody?: unknown
  responses?: Record<string, { description?: string }>
}

export default async function ApiDocsPage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const doc = buildOpenApiDocument(siteUrl())
  const paths = Object.entries(doc.paths ?? {}) as [string, Record<string, Op>][]
  return (
    <section className="container-page pt-32 pb-24">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">
        OpenAPI {doc.openapi}
      </p>
      <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{t.apiDocs.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{t.apiDocs.lead}</p>
      <a href="/api/openapi.json" className="mt-6 inline-block text-sm text-accent hover:underline">
        {t.apiDocs.raw} →
      </a>
      <div className="mt-12 flex flex-col gap-4">
        {paths.flatMap(([path, ops]) =>
          Object.entries(ops).map(([method, op]) => (
            <article
              key={method + path}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <header className="flex flex-wrap items-center gap-3">
                <Badge tone={method === 'get' ? 'accent' : 'success'}>{method.toUpperCase()}</Badge>
                <code className="font-mono text-sm">{path}</code>
                <span className="text-sm text-muted">{op.summary}</span>
              </header>
              {op.description && <p className="mt-3 text-sm text-muted">{op.description}</p>}
              {!!op.parameters?.length && (
                <div className="mt-4">
                  <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">
                    {t.apiDocs.params}
                  </h2>
                  <ul className="mt-2 flex flex-col gap-1 font-mono text-xs">
                    {op.parameters.map((p) => (
                      <li key={p.in + p.name}>
                        <span className="text-foreground">{p.name}</span>{' '}
                        <span className="text-subtle">
                          ({p.in}
                          {p.required ? ', required' : ''})
                        </span>{' '}
                        <span className="text-muted">
                          {p.schema?.enum ? p.schema.enum.join(' | ') : p.schema?.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!!op.requestBody && (
                <p className="mt-4 font-mono text-xs text-muted">
                  {t.apiDocs.body}: application/json
                </p>
              )}
              <div className="mt-4">
                <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">
                  {t.apiDocs.responses}
                </h2>
                <ul className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
                  {Object.entries(op.responses ?? {}).map(([code, r]) => (
                    <li key={code} className="rounded-md border border-border px-2 py-1">
                      <span className={code.startsWith('2') ? 'text-success' : 'text-danger'}>
                        {code}
                      </span>{' '}
                      <span className="text-muted">{r.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )),
        )}
      </div>
    </section>
  )
}
