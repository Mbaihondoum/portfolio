import type { CSSProperties, ElementType } from 'react'
import { Reveal } from './reveal'

/**
 * Word-by-word masked reveal. Words are split at render time (server
 * friendly), each word slides up from under a clip mask with a CSS stagger.
 * Screen readers get the plain sentence through aria-label.
 */
export function SplitText({
  text,
  as = 'h2',
  className,
  delay = 0,
  step = 70,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  step?: number
}) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Reveal as={as} className={className} split aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="split-word">
          <span
            style={
              {
                '--i': i,
                '--split-base': `${delay}ms`,
                '--split-step': `${step}ms`,
              } as CSSProperties
            }
          >
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Reveal>
  )
}
