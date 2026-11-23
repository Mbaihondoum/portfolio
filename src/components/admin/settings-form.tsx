'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import type { KeyFigure, Localized } from '@/lib/types'
import { saveSettings } from '@/server/actions/admin'
import { errorMessage } from './errors'
import { uploadFile } from './upload'

export type SettingsValues = {
  fullName: string
  initials: string
  headline: Localized
  tagline: Localized
  bio: Localized
  approach: Localized
  location: string
  availability: Localized
  email: string
  githubUrl: string | null
  linkedinUrl: string | null
  whatsapp: string | null
  cvUrlFr: string | null
  cvUrlEn: string | null
  keyFigures: KeyFigure[]
}

type LocalizedKey = 'headline' | 'tagline' | 'bio' | 'approach' | 'availability'

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const set = <K extends keyof SettingsValues>(k: K, value: SettingsValues[K]) =>
    setV((p) => ({ ...p, [k]: value }))

  const text = (
    k: 'fullName' | 'initials' | 'location' | 'email',
    label: string,
    type = 'text',
  ) => (
    <Field label={label} htmlFor={k} error={errorMessage(errors[k])}>
      <Input
        id={k}
        type={type}
        value={v[k]}
        aria-invalid={!!errors[k]}
        onChange={(e) => set(k, e.target.value)}
      />
    </Field>
  )
  const optional = (k: 'githubUrl' | 'linkedinUrl' | 'whatsapp', label: string) => (
    <Field label={label} htmlFor={k} error={errorMessage(errors[k])}>
      <Input
        id={k}
        value={v[k] ?? ''}
        aria-invalid={!!errors[k]}
        onChange={(e) => set(k, e.target.value || null)}
      />
    </Field>
  )
  const bilingual = (k: LocalizedKey, label: string, rows = 0) => (
    <div className="grid gap-3 md:grid-cols-2">
      {(['fr', 'en'] as const).map((l) => {
        const id = `${k}-${l}`
        const props = {
          id,
          value: v[k][l],
          'aria-invalid': !!errors[`${k}.${l}`],
          onChange: (e: { target: { value: string } }) => set(k, { ...v[k], [l]: e.target.value }),
        }
        return (
          <Field
            key={l}
            label={`${label} · ${l.toUpperCase()}`}
            htmlFor={id}
            error={errorMessage(errors[`${k}.${l}`])}
          >
            {rows ? <Textarea rows={rows} {...props} /> : <Input {...props} />}
          </Field>
        )
      })}
    </div>
  )

  async function uploadCv(file: File | undefined, key: 'cvUrlFr' | 'cvUrlEn') {
    if (!file) return
    setStatus('Envoi du CV…')
    const r = await uploadFile(file, 'document')
    if (r.ok) {
      set(key, r.url)
      setStatus('CV téléversé — pensez à enregistrer.')
    } else setStatus(errorMessage(r.error) ?? 'Erreur')
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await saveSettings(v)
          if (r.ok) {
            setErrors({})
            setStatus('Enregistré ✓ — le site est mis à jour.')
            router.refresh()
          } else {
            setErrors(r.fieldErrors ?? {})
            setStatus(errorMessage(r.error) ?? 'Erreur')
          }
        })
      }}
    >
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-medium">Identité</legend>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">{text('fullName', 'Nom complet')}</div>
          {text('initials', 'Initiales (intro animée)')}
          {text('location', 'Ville, pays')}
        </div>
        {bilingual('headline', 'Titre')}
        {bilingual('tagline', 'Accroche (une phrase)', 2)}
        {bilingual('availability', 'Disponibilité')}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-medium">À propos</legend>
        {bilingual('bio', 'Parcours', 5)}
        {bilingual('approach', 'Ma façon de travailler', 4)}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-medium">Chiffres clés (4 max)</legend>
        {v.keyFigures.map((k, i) => {
          const update = (patch: Partial<KeyFigure>) =>
            set(
              'keyFigures',
              v.keyFigures.map((x, j) => (j === i ? { ...x, ...patch } : x)),
            )
          return (
            <div key={i} className="grid gap-2 md:grid-cols-[6rem_4rem_1fr_1fr_auto]">
              <Input
                aria-label="Valeur"
                type="number"
                value={k.value}
                onChange={(e) => update({ value: Number(e.target.value) })}
              />
              <Input
                aria-label="Suffixe"
                placeholder="+"
                value={k.suffix ?? ''}
                onChange={(e) => update({ suffix: e.target.value })}
              />
              <Input
                aria-label="Libellé FR"
                value={k.label.fr}
                onChange={(e) => update({ label: { ...k.label, fr: e.target.value } })}
              />
              <Input
                aria-label="Libellé EN"
                value={k.label.en}
                onChange={(e) => update({ label: { ...k.label, en: e.target.value } })}
              />
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  set(
                    'keyFigures',
                    v.keyFigures.filter((_, j) => j !== i),
                  )
                }
              >
                Retirer
              </Button>
            </div>
          )
        })}
        {v.keyFigures.length < 4 && (
          <Button
            size="sm"
            variant="secondary"
            className="w-fit"
            onClick={() =>
              set('keyFigures', [
                ...v.keyFigures,
                { value: 0, suffix: '', label: { fr: '', en: '' } },
              ])
            }
          >
            + Ajouter un chiffre
          </Button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-medium">Contact & liens</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {text('email', 'Email public', 'email')}
          {optional('whatsapp', 'WhatsApp (optionnel, ex. +33612345678)')}
          {optional('githubUrl', 'GitHub')}
          {optional('linkedinUrl', 'LinkedIn')}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <legend className="px-1 text-sm font-medium">CV (PDF, 10 Mo max)</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {(['cvUrlFr', 'cvUrlEn'] as const).map((key) => (
            <Field
              key={key}
              label={key === 'cvUrlFr' ? 'CV français' : 'CV anglais'}
              htmlFor={key}
              error={errorMessage(errors[key])}
            >
              <div className="flex gap-2">
                <Input
                  id={key}
                  value={v[key] ?? ''}
                  onChange={(e) => set(key, e.target.value || null)}
                />
                <label className="inline-flex cursor-pointer items-center rounded-full border border-border-strong px-4 text-sm hover:border-accent">
                  PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => uploadCv(e.target.files?.[0], key)}
                  />
                </label>
              </div>
            </Field>
          ))}
        </div>
      </fieldset>

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {status}
        </p>
      </div>
    </form>
  )
}
