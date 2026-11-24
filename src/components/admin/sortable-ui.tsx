import type { HTMLAttributes } from 'react'
import { Button } from '@/components/ui/button'

/** Grip shown on each sortable row (mouse/touchpad drag handle). */
export function DragHandle(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className="grid size-7 shrink-0 cursor-grab place-items-center rounded-md text-subtle hover:bg-surface-2 hover:text-foreground active:cursor-grabbing"
    >
      <svg viewBox="0 0 24 24" className="size-4 fill-current">
        {[6, 12, 18].flatMap((y) =>
          [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />),
        )}
      </svg>
    </span>
  )
}

/** ↑ / ↓ buttons: the keyboard-accessible alternative to dragging. */
export function MoveButtons({
  onMove,
  first,
  last,
  disabled,
}: {
  onMove: (dir: -1 | 1) => void
  first: boolean
  last: boolean
  disabled?: boolean
}) {
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Monter"
        title="Monter"
        disabled={disabled || first}
        onClick={() => onMove(-1)}
      >
        ↑
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label="Descendre"
        title="Descendre"
        disabled={disabled || last}
        onClick={() => onMove(1)}
      >
        ↓
      </Button>
    </>
  )
}

/** Shared styles for rows being dragged / hovered as a drop target. */
export const sortableRowClass =
  'transition-[opacity,box-shadow] data-[dragging]:opacity-40 data-[drop-target]:shadow-[0_-2px_0_0_var(--accent)]'

export function LiveRegion({ message }: { message: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  )
}
