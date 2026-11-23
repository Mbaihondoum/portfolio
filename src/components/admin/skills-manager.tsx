'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { SKILL_CATEGORIES, type SkillCategory } from '@/lib/types'
import { deleteSkill, reorderSkills, saveSkill } from '@/server/actions/admin'
import { ActionButton, moveId } from './action-button'
import { errorMessage } from './errors'

type Skill = { id: string; name: string; category: SkillCategory; inMarquee: boolean }

const LABELS: Record<SkillCategory, string> = {
  frontend: 'Front-end',
  backend_db: 'Back-end & bases de données',
  mobile: 'Mobile',
  data_bi: 'Data & BI',
  tools_devops: 'Outils & DevOps',
}

function SkillRow({ skill, index, ids }: { skill: Skill; index: number; ids: string[] }) {
  const router = useRouter()
  const [name, setName] = useState(skill.name)
  const [inMarquee, setInMarquee] = useState(skill.inMarquee)
  const [pending, start] = useTransition()
  const dirty = name !== skill.name || inMarquee !== skill.inMarquee
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
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
        <ActionButton label="Monter" action={() => reorderSkills(moveId(ids, index, -1))}>
          ↑
        </ActionButton>
        <ActionButton label="Descendre" action={() => reorderSkills(moveId(ids, index, 1))}>
          ↓
        </ActionButton>
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

export function SkillsManager({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {SKILL_CATEGORIES.map((category) => {
        const items = skills.filter((s) => s.category === category)
        const ids = items.map((s) => s.id)
        return (
          <section key={category} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-medium">
              {LABELS[category]}{' '}
              <span className="font-mono text-xs text-subtle">({items.length})</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((s, i) => (
                <SkillRow key={s.id + s.name + s.inMarquee} skill={s} index={i} ids={ids} />
              ))}
            </ul>
            <AddSkill category={category} />
          </section>
        )
      })}
    </div>
  )
}
