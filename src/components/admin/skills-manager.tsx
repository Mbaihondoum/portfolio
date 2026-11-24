'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type HTMLAttributes, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { SKILL_CATEGORIES, type SkillCategory } from '@/lib/types'
import { deleteSkill, reorderSkills, saveSkill } from '@/server/actions/admin'
import { ActionButton } from './action-button'
import { DragHandle, LiveRegion, MoveButtons, sortableRowClass } from './sortable-ui'
import { useSortable } from './use-sortable'
import { errorMessage } from './errors'

type Skill = { id: string; name: string; category: SkillCategory; inMarquee: boolean }

const LABELS: Record<SkillCategory, string> = {
  frontend: 'Front-end',
  backend_db: 'Back-end & bases de données',
  mobile: 'Mobile',
  data_bi: 'Data & BI',
  tools_devops: 'Outils & DevOps',
}

function SkillRow({
  skill,
  rowProps,
  handle,
  moveButtons,
}: {
  skill: Skill
  rowProps: HTMLAttributes<HTMLLIElement> & { draggable: boolean }
  handle: ReactNode
  moveButtons: ReactNode
}) {
  const router = useRouter()
  const [name, setName] = useState(skill.name)
  const [inMarquee, setInMarquee] = useState(skill.inMarquee)
  const [pending, start] = useTransition()
  const dirty = name !== skill.name || inMarquee !== skill.inMarquee
  return (
    <li
      {...rowProps}
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 ${sortableRowClass}`}
    >
      {handle}
      <Input
        aria-label="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="max-w-xs flex-1 py-1.5"
      />
      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={inMarquee}
          onChange={(e) => setInMarquee(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Bandeau défilant
      </label>
      <div className="ml-auto flex items-center gap-1">
        {dirty && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await saveSkill({ name, category: skill.category, inMarquee }, skill.id)
                if (!r.ok) window.alert(errorMessage(r.fieldErrors?.name ?? r.error))
                router.refresh()
              })
            }
          >
            Enregistrer
          </Button>
        )}
        {moveButtons}
        <ActionButton
          variant="danger"
          label="Supprimer"
          confirm={`Supprimer « ${skill.name} » ?`}
          action={() => deleteSkill(skill.id)}
        >
          ✕
        </ActionButton>
      </div>
    </li>
  )
}

function AddSkill({ category }: { category: SkillCategory }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [pending, start] = useTransition()
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        start(async () => {
          const r = await saveSkill({ name, category, inMarquee: false })
          if (r.ok) setName('')
          else window.alert(errorMessage(r.fieldErrors?.name ?? r.error))
          router.refresh()
        })
      }}
    >
      <Input
        aria-label={`Nouvelle compétence (${LABELS[category]})`}
        placeholder="Nouvelle compétence"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="max-w-xs py-1.5"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Ajouter
      </Button>
    </form>
  )
}

function CategoryList({ category, items }: { category: SkillCategory; items: Skill[] }) {
  const sortable = useSortable(items, reorderSkills, (s) => s.name)
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-medium">
        {LABELS[category]} <span className="font-mono text-xs text-subtle">({items.length})</span>
      </h2>
      <LiveRegion message={sortable.announcement} />
      <ul className="flex flex-col gap-2" aria-label={LABELS[category]}>
        {sortable.ordered.map((s, i) => (
          <SkillRow
            key={s.id + s.name + s.inMarquee}
            skill={s}
            rowProps={sortable.rowProps(s)}
            handle={<DragHandle {...sortable.handleProps(s)} />}
            moveButtons={
              <MoveButtons
                onMove={(dir) => sortable.move(i, dir)}
                first={i === 0}
                last={i === sortable.ordered.length - 1}
                disabled={sortable.pending}
              />
            }
          />
        ))}
      </ul>
      <AddSkill category={category} />
    </section>
  )
}

export function SkillsManager({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {SKILL_CATEGORIES.map((category) => (
        <CategoryList
          key={category}
          category={category}
          items={skills.filter((s) => s.category === category)}
        />
      ))}
    </div>
  )
}
