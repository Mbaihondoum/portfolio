'use client'

export function ThemeToggle({
  label,
  className = 'text-muted hover:bg-surface-2 hover:text-foreground',
}: {
  label: string
  /** Colour classes (default suits the page background). */
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const d = document.documentElement
        const next = d.dataset.theme === 'dark' ? 'light' : 'dark'
        d.dataset.theme = next
        try {
          localStorage.setItem('theme', next)
        } catch {}
      }}
      className={`grid size-9 place-items-center rounded-full transition-colors ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4 fill-none stroke-current"
        strokeWidth={1.7}
      >
        <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
