'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type DragEvent } from 'react'
import type { ActionResult } from '@/server/actions/result'
import { errorMessage } from './errors'

/** Moves the item at `from` to position `to` (pure, unit-tested). */
export function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved as T)
  return next
}

/**
 * Native HTML5 drag & drop reordering (no dependency) with an optimistic local
 * order, then persistence through a server action. Dragging starts only from
 * the grip handle, so text inputs inside rows keep working. Keyboard users
 * keep the ↑/↓ buttons; every move is announced through `announcement`.
 */
export function useSortable<T extends { id: string }>(
  items: T[],
  persist: (ids: string[]) => Promise<ActionResult<unknown>>,
  label: (item: T) => string,
) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const serverKey = items.map((i) => i.id).join(',')
  // Optimistic order, discarded automatically when fresh server data arrives.
  const [override, setOverride] = useState<{ key: string; ids: string[] } | null>(null)
  const [armed, setArmed] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const byId = new Map(items.map((i) => [i.id, i]))
  const ordered =
    override && override.key === serverKey
      ? override.ids.map((id) => byId.get(id)).filter((i): i is T => !!i)
      : items

  function commit(next: T[], moved: T) {
    const ids = next.map((i) => i.id)
    setOverride({ key: serverKey, ids })
    setAnnouncement(`${label(moved)} : position ${ids.indexOf(moved.id) + 1} sur ${ids.length}`)
    start(async () => {
      const result = await persist(ids)
      if (!result.ok) {
        setOverride(null)
        window.alert(errorMessage(result.error))
      }
      router.refresh()
    })
  }

  function move(index: number, dir: -1 | 1) {
    const item = ordered[index]
    if (!item) return
    const next = reorder(ordered, index, index + dir)
    if (next !== ordered) commit(next, item)
  }

  function rowProps(item: T) {
    return {
      draggable: armed === item.id,
      'data-dragging': dragging === item.id ? '' : undefined,
      'data-drop-target': over === item.id && dragging !== item.id ? '' : undefined,
      onDragStart: (e: DragEvent) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', item.id)
        setDragging(item.id)
      },
      onDragOver: (e: DragEvent) => {
        if (!dragging) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (over !== item.id) setOver(item.id)
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        const from = ordered.findIndex((i) => i.id === dragging)
        const to = ordered.findIndex((i) => i.id === item.id)
        const moved = ordered[from]
        setOver(null)
        if (moved && from !== to) commit(reorder(ordered, from, to), moved)
      },
      onDragEnd: () => {
        setDragging(null)
        setOver(null)
        setArmed(null)
      },
    }
  }

  function handleProps(item: T) {
    return {
      'aria-hidden': true,
      title: 'Glisser pour réordonner',
      onPointerDown: () => setArmed(item.id),
      onPointerUp: () => setArmed(null),
    }
  }

  return { ordered, rowProps, handleProps, move, pending, announcement }
}
