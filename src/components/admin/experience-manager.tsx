'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import type { Localized } from '@/lib/types'
import { deleteExperience, reorderExperiences, saveExperience } from '@/server/actions/admin'
import { ActionButton } from './action-button'
import { DragHandle, LiveRegion, MoveButtons, sortableRowClass } from './sortable-ui'
import { useSortable } from './use-sortable'
import { errorMessage } from './errors'

export type ExperienceValues = {
  type: 'work' | 'education'
  title: Localized
  organization: string
  location: string
  startDate: string
  endDate: string
  description: Localized
}

type Item = ExperienceValues & { id: string }

const EMPTY: ExperienceValues = {
  type: 'work',
  title: { fr: '', en: '' },
  organization: '',
  location: '',
  startDate: '',
  endDate: '',
  description: { fr: '', en: '' },
}

function ExperienceForm({
  id,
  initial,
  onDone,
}: {
  id?: string
  initial: ExperienceValues
  onDone: () => void
}) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, start] = useTransition()
  const fid = id ?? 'new'
  return (
    <form
      noValidate
      className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-background p-4"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await saveExperience(v, id)
          if (r.ok) {
            onDone()
            router.refresh()
          } else setErrors(r.fieldErrors ?? { _: r.error })
        })
      }}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Type" htmlFor={`${fid}-type`}>
          <Select
            id={`${fid}-type`}
            value={v.type}
            onChange={(e) => setV({ ...v, type: e.target.value as ExperienceValues['type'] })}
          >
            <option value="work">Expérience</option>
            <option value="education">Formation</option>
          </Select>
        </Field>
        <Field
          label="Organisation"
          htmlFor={`${fid}-org`}
          error={errorMessage(errors.organization)}
        >
          <Input
            id={`${fid}-org`}
            value={v.organization}
            onChange={(e) => setV({ ...v, organization: e.target.value })}
          />
        </Field>
        <Field label="Début" htmlFor={`${fid}-start`} error={errorMessage(errors.startDate)}>
          <Input
            id={`${fid}-start`}
            type="date"
            value={v.startDate}
            onChange={(e) => setV({ ...v, startDate: e.target.value })}
          />
        </Field>
        <Field
          label="Fin (vide = en cours)"
          htmlFor={`${fid}-end`}
          error={errorMessage(errors.endDate)}
        >
          <Input
            id={`${fid}-end`}
            type="date"
            value={v.endDate}
            onChange={(e) => setV({ ...v, endDate: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Lieu" htmlFor={`${fid}-loc`}>
        <Input
          id={`${fid}-loc`}
          value={v.location}
          onChange={(e) => setV({ ...v, location: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        {(['fr', 'en'] as const).map((l) => (
          <Field
            key={l}
            label={`Intitulé · ${l.toUpperCase()}`}
            htmlFor={`${fid}-t-${l}`}
            error={errorMessage(errors[`title.${l}`])}
          >
            <Input
              id={`${fid}-t-${l}`}
              value={v.title[l]}
              onChange={(e) => setV({ ...v, title: { ...v.title, [l]: e.target.value } })}
            />
          </Field>
        ))}
        {(['fr', 'en'] as const).map((l) => (
          <Field key={l} label={`Description · ${l.toUpperCase()}`} htmlFor={`${fid}-d-${l}`}>
            <Textarea
              id={`${fid}-d-${l}`}
              rows={3}
              value={v.description[l]}
              onChange={(e) =>
                setV({ ...v, description: { ...v.description, [l]: e.target.value } })
              }
            />
          </Field>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Annuler
        </Button>
        {errors._ && <p className="text-sm text-danger">{errorMessage(errors._)}</p>}
      </div>
    </form>
  )
}

export function ExperienceManager({ items }: { items: Item[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const sortable = useSortable(items, reorderExperiences, (e) => e.title.fr || e.organization)
  return (
    <div className="flex flex-col gap-3">
      <LiveRegion message={sortable.announcement} />
      {sortable.ordered.map((item, i) => (
        <article
          key={item.id}
          {...sortable.rowProps(item)}
          className={`rounded-2xl border border-border bg-surface p-4 ${sortableRowClass}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <DragHandle {...sortable.handleProps(item)} />
            <Badge tone={item.type === 'work' ? 'accent' : 'neutral'}>
              {item.type === 'work' ? 'Expérience' : 'Formation'}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title.fr}</p>
              <p className="text-xs text-muted">
                {item.organization} · {item.startDate} → {item.endDate || 'en cours'}
              </p>
            </div>
            <MoveButtons
              onMove={(dir) => sortable.move(i, dir)}
              first={i === 0}
              last={i === sortable.ordered.length - 1}
              disabled={sortable.pending}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(editing === item.id ? null : item.id)}
            >
              Modifier
            </Button>
            <ActionButton
              variant="danger"
              confirm="Supprimer cette entrée ?"
              action={() => deleteExperience(item.id)}
            >
              Supprimer
            </ActionButton>
          </div>
          {editing === item.id && (
            <ExperienceForm id={item.id} initial={item} onDone={() => setEditing(null)} />
          )}
        </article>
      ))}
      {editing === 'new' ? (
        <ExperienceForm initial={EMPTY} onDone={() => setEditing(null)} />
      ) : (
        <Button variant="secondary" className="w-fit" onClick={() => setEditing('new')}>
          + Ajouter une entrée
        </Button>
      )}
    </div>
  )
}
