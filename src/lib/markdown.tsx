import { Fragment, type ReactNode } from 'react'

/**
 * Minimal, safe Markdown → React renderer for admin-authored descriptions.
 * Supports paragraphs, "-"/"*" lists, **bold**, *italic*, `code` and
 * [links](https://…). Never injects raw HTML (React escapes all text), and
 * only http(s)/mailto links are rendered.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g

function inline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={k}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return (
        <code key={k} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      )
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={k}>{part.slice(1, -1)}</em>
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link
      if (/^(https?:|mailto:)/.test(href!)) {
        return (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            {label}
          </a>
        )
      }
      return <Fragment key={k}>{label}</Fragment>
    }
    return <Fragment key={k}>{part}</Fragment>
  })
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.trim().split(/\n{2,}/)
  return (
    <div className={className}>
      {blocks.map((block, b) => {
        const lines = block.split('\n')
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={b} className="my-4 list-disc space-y-1 pl-5 marker:text-accent">
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*[-*]\s+/, ''), `${b}-${i}`)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={b} className="my-4">
            {lines.map((l, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {inline(l, `${b}-${i}`)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
