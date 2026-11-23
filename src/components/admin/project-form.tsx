'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import type { Localized } from '@/lib/types'
import { saveProject } from '@/server/actions/admin'
import { errorMessage } from './errors'
import { uploadFile } from './upload'

type Metric = { value: number; prefix: string; suffix: string; label: Localized }
type Image = {
  url: string
  alt: Localized
  kind: 'screenshot' | 'dashboard' | 'chart'
  width: number
  height: number
}

export type ProjectFormValues = {
  slug: string
  title: Localized
  summary: Localized
  problem: Localized
  solution: Localized
  role: Localized
  description: Localized
  category: 'web' | 'mobile' | 'data' | 'fullstack'
  stack: string[]
  coverImage: string | null
  coverAlt: Localized
  demoUrl: string | null
  repoUrl: string | null
  powerBiEmbedUrl: string | null
  architecture: unknown
  charts: unknown[]
  status: 'draft' | 'published'
  featured: boolean
  isSample: boolean
  metrics: Metric[]
  images: Image[]
}

const empty: Localized = { fr: '', en: '' }

export const EMPTY_PROJECT: ProjectFormValues = {
  slug: '',
  title: empty,
  summary: empty,
  problem: empty,
  solution: empty,
  role: empty,
  description: empty,
  category: 'web',
  stack: [],
  coverImage: null,
  coverAlt: empty,
  demoUrl: null,
  repoUrl: null,
  powerBiEmbedUrl: null,
  architecture: null,
  charts: [],
  status: 'draft',
  featured: false,
  isSample: false,
  metrics: [],
  images: [],
}

const ARCH_EXAMPLE = `{
  "nodes": [
    { "id": "web", "label": "Next.js", "layer": "client" },
    { "id": "api", "label": "API REST", "layer": "api" },
    { "id": "db", "label": "PostgreSQL", "layer": "data" }
  ],
  "edges": [
    { "from": "web", "to": "api", "label": "HTTPS" },
    { "from": "api", "to": "db" }
  ]
}`

const CHART_EXAMPLE = `[
  {
    "id": "revenue",
    "type": "line",
    "title": { "fr": "Chiffre d'affaires (k€)", "en": "Revenue (k€)" },
    "unit": "k€",
    "labels": ["Jan", "Fév", "Mar"],
    "values": [42, 51, 63]
  }
]`

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function Section({ title, children, hint }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-surface p-5">
      <legend className="px-1 text-sm font-medium text-foreground">{title}</legend>
      {hint && <p className="mb-4 text-xs text-subtle">{hint}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  )
}

export function ProjectForm({ id, initial }: { id?: string; initial: ProjectFormValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [archText, setArchText] = useState(
    initial.architecture ? JSON.stringify(initial.architecture, null, 2) : '',
  )
  const [chartsText, setChartsText] = useState(
    initial.charts.length ? JSON.stringify(initial.charts, null, 2) : '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [uploading, setUploading] = useState<string | null>(null)

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }))
  const err = (key: string) => errorMessage(errors[key])

  const bilingual = (
    key: 'title' | 'summary' | 'problem' | 'solution' | 'role' | 'description' | 'coverAlt',
    label: string,
    multiline = false,
    rows = 3,
  ) => (
    <div className="grid gap-3 md:grid-cols-2">
      {(['fr', 'en'] as const).map((lang) => {
        const fid = `${key}-${lang}`
        const common = {
          id: fid,
          value: v[key][lang],
          'aria-invalid': !!errors[`${key}.${lang}`],
          onChange: (e: { target: { value: string } }) =>
            set(key, { ...v[key], [lang]: e.target.value }),
        }
        return (
          <Field
            key={lang}
            label={`${label} · ${lang.toUpperCase()}`}
            htmlFor={fid}
            error={err(`${key}.${lang}`)}
          >
            {multiline ? <Textarea rows={rows} {...common} /> : <Input {...common} />}
          </Field>
        )
      })}
    </div>
  )

  async function handleUpload(file: File | undefined, onUrl: (url: string) => void, tag: string) {
    if (!file) return
    setUploading(tag)
    const res = await uploadFile(file, 'image')
    setUploading(null)
    if (res.ok) onUrl(res.url)
    else setStatus(errorMessage(res.error) ?? 'Erreur')
  }

  function submit() {
    const nextErrors: Record<string, string> = {}
    let architecture: unknown = null
    let charts: unknown = []
    try {
      architecture = archText.trim() ? JSON.parse(archText) : null
    } catch {
      nextErrors.architecture = 'JSON invalide'
    }
    try {
      charts = chartsText.trim() ? JSON.parse(chartsText) : []
    } catch {
      nextErrors.charts = 'JSON invalide'
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setStatus('Corrigez les champs en rouge.')
      return
    }
    start(async () => {
      setStatus(null)
      const result = await saveProject({ ...v, architecture, charts }, id)
      if (result.ok) {
        setErrors({})
        setStatus('Enregistré ✓')
        if (!id) router.replace(`/admin/projects/${result.data.id}`)
        else router.refresh()
      } else {
        setErrors(result.fieldErrors ?? {})
        setStatus(errorMessage(result.error) ?? 'Erreur')
      }
    })
  }

  const jsonError = (prefix: string) =>
    Object.entries(errors)
      .filter(([k]) => k === prefix || k.startsWith(`${prefix}.`))
      .map(([k, code]) => `${k} : ${errorMessage(code)}`)
      .join(' · ') || undefined

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex flex-col gap-6"
    >
      <Section title="Général">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Slug (URL)" htmlFor="slug" error={err('slug')} hint="ex. dashboard-ventes">
            <div className="flex gap-2">
              <Input
                id="slug"
                value={v.slug}
                aria-invalid={!!errors.slug}
                onChange={(e) => set('slug', e.target.value)}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => set('slug', slugify(v.title.fr || v.title.en))}
              >
                Générer
              </Button>
            </div>
          </Field>
          <Field label="Catégorie" htmlFor="category">
            <Select
              id="category"
              value={v.category}
              onChange={(e) => set('category', e.target.value as ProjectFormValues['category'])}
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="data">Data / BI</option>
              <option value="fullstack">Full stack</option>
            </Select>
          </Field>
          <Field label="Statut" htmlFor="status">
            <Select
              id="status"
              value={v.status}
              onChange={(e) => set('status', e.target.value as ProjectFormValues['status'])}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={v.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Mettre en avant
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={v.isSample}
              onChange={(e) => set('isSample', e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Projet d’exemple (affiche le badge « Exemple »)
          </label>
        </div>
      </Section>

      <Section
        title="Textes"
        hint="Remplissez les deux langues. La description accepte le Markdown simple (**gras**, listes, liens)."
      >
        {bilingual('title', 'Titre')}
        {bilingual('summary', 'Résumé (carte)', true, 2)}
        {bilingual('problem', 'Problème', true)}
        {bilingual('solution', 'Solution', true)}
        {bilingual('role', 'Mon rôle', true, 2)}
        {bilingual('description', 'Description détaillée', true, 6)}
      </Section>

      <Section title="Technologies & liens">
        <Field
          label="Stack (séparée par des virgules)"
          htmlFor="stack"
          hint="ex. Next.js, PostgreSQL, Power BI"
        >
          <Input
            id="stack"
            defaultValue={v.stack.join(', ')}
            onBlur={(e) =>
              set(
                'stack',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Lien démo" htmlFor="demoUrl" error={err('demoUrl')}>
            <Input
              id="demoUrl"
              type="url"
              value={v.demoUrl ?? ''}
              onChange={(e) => set('demoUrl', e.target.value || null)}
            />
          </Field>
          <Field label="Lien code (GitHub…)" htmlFor="repoUrl" error={err('repoUrl')}>
            <Input
              id="repoUrl"
              type="url"
              value={v.repoUrl ?? ''}
              onChange={(e) => set('repoUrl', e.target.value || null)}
            />
          </Field>
          <Field
            label="Power BI « Publier sur le web »"
            htmlFor="pbi"
            error={err('powerBiEmbedUrl')}
          >
            <Input
              id="pbi"
              type="url"
              value={v.powerBiEmbedUrl ?? ''}
              onChange={(e) => set('powerBiEmbedUrl', e.target.value || null)}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Visuels"
        hint="PNG, JPG, WebP ou AVIF, 5 Mo max. Format conseillé : 1600 × 1000."
      >
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-border bg-background">
            {v.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.coverImage} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Field label="Image de couverture" htmlFor="cover" error={err('coverImage')}>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="cover"
                  value={v.coverImage ?? ''}
                  onChange={(e) => set('coverImage', e.target.value || null)}
                  className="flex-1"
                />
                <label className="inline-flex cursor-pointer items-center rounded-full border border-border-strong px-4 text-sm hover:border-accent">
                  {uploading === 'cover' ? 'Envoi…' : 'Téléverser'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="sr-only"
                    onChange={(e) =>
                      handleUpload(e.target.files?.[0], (url) => set('coverImage', url), 'cover')
                    }
                  />
                </label>
              </div>
            </Field>
          </div>
        </div>
        {bilingual('coverAlt', 'Texte alternatif de la couverture')}

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted">
            Galerie (captures, dashboards, graphiques R…)
          </p>
          {v.images.map((img, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[6rem_1fr_1fr_8rem_auto]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="aspect-[16/10] w-24 rounded-md border border-border object-cover"
              />
              {(['fr', 'en'] as const).map((lang) => (
                <Input
                  key={lang}
                  aria-label={`Texte alternatif ${lang}`}
                  placeholder={`Alt ${lang.toUpperCase()}`}
                  value={img.alt[lang]}
                  onChange={(e) =>
                    set(
                      'images',
                      v.images.map((x, j) =>
                        j === i ? { ...x, alt: { ...x.alt, [lang]: e.target.value } } : x,
                      ),
                    )
                  }
                />
              ))}
              <Select
                aria-label="Type"
                value={img.kind}
                onChange={(e) =>
                  set(
                    'images',
                    v.images.map((x, j) =>
                      j === i ? { ...x, kind: e.target.value as Image['kind'] } : x,
                    ),
                  )
                }
              >
                <option value="screenshot">Capture</option>
                <option value="dashboard">Dashboard</option>
                <option value="chart">Graphique</option>
              </Select>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  set(
                    'images',
                    v.images.filter((_, j) => j !== i),
                  )
                }
              >
                Retirer
              </Button>
            </div>
          ))}
          <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-dashed border-border-strong px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent">
            {uploading === 'gallery' ? 'Envoi…' : '+ Ajouter une image'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              onChange={(e) =>
                handleUpload(
                  e.target.files?.[0],
                  (url) =>
                    set('images', [
                      ...v.images,
                      {
                        url,
                        alt: empty,
                        kind: v.category === 'data' ? 'dashboard' : 'screenshot',
                        width: 1600,
                        height: 1000,
                      },
                    ]),
                  'gallery',
                )
              }
            />
          </label>
        </div>
      </Section>

      <Section
        title="Résultats chiffrés"
        hint="Uniquement des chiffres réels et vérifiables. 6 maximum."
      >
        {v.metrics.map((m, i) => {
          const update = (patch: Partial<Metric>) =>
            set(
              'metrics',
              v.metrics.map((x, j) => (j === i ? { ...x, ...patch } : x)),
            )
          return (
            <div key={i} className="grid gap-2 md:grid-cols-[4rem_6rem_4rem_1fr_1fr_auto]">
              <Input
                aria-label="Préfixe"
                placeholder="+/-"
                value={m.prefix}
                onChange={(e) => update({ prefix: e.target.value })}
              />
              <Input
                aria-label="Valeur"
                type="number"
                value={m.value}
                onChange={(e) => update({ value: Number(e.target.value) })}
              />
              <Input
                aria-label="Suffixe"
                placeholder="%"
                value={m.suffix}
                onChange={(e) => update({ suffix: e.target.value })}
              />
              <Input
                aria-label="Libellé FR"
                placeholder="Libellé FR"
                value={m.label.fr}
                aria-invalid={!!errors[`metrics.${i}.label.fr`]}
                onChange={(e) => update({ label: { ...m.label, fr: e.target.value } })}
              />
              <Input
                aria-label="Libellé EN"
                placeholder="Label EN"
                value={m.label.en}
                aria-invalid={!!errors[`metrics.${i}.label.en`]}
                onChange={(e) => update({ label: { ...m.label, en: e.target.value } })}
              />
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  set(
                    'metrics',
                    v.metrics.filter((_, j) => j !== i),
                  )
                }
              >
                Retirer
              </Button>
            </div>
          )
        })}
        {v.metrics.length < 6 && (
          <Button
            size="sm"
            variant="secondary"
            className="w-fit"
            onClick={() =>
              set('metrics', [...v.metrics, { value: 0, prefix: '', suffix: '', label: empty }])
            }
          >
            + Ajouter un résultat
          </Button>
        )}
      </Section>

      <Section
        title="Architecture & graphiques (avancé)"
        hint="Optionnel. Couches possibles : client, api, data, infra, external."
      >
        <Field
          label="Schéma d’architecture (JSON)"
          htmlFor="arch"
          error={errors.architecture ?? jsonError('architecture')}
        >
          <Textarea
            id="arch"
            rows={8}
            className="font-mono text-xs"
            placeholder={ARCH_EXAMPLE}
            value={archText}
            onChange={(e) => setArchText(e.target.value)}
          />
        </Field>
        <Field
          label="Graphiques animés (JSON)"
          htmlFor="charts"
          error={errors.charts ?? jsonError('charts')}
        >
          <Textarea
            id="charts"
            rows={8}
            className="font-mono text-xs"
            placeholder={CHART_EXAMPLE}
            value={chartsText}
            onChange={(e) => setChartsText(e.target.value)}
          />
        </Field>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        {id && v.status === 'published' && (
          <a
            href={`/fr/projects/${v.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted hover:text-accent"
          >
            Voir sur le site ↗
          </a>
        )}
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${Object.keys(errors).length ? 'text-danger' : 'text-muted'}`}
        >
          {status}
        </p>
      </div>
    </form>
  )
}
