import type { CSSProperties, ReactNode } from 'react'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

interface AnimatedHeadlineProps {
  /** Single-line text. Use `lines` to control where the headline breaks. */
  text?: string
  lines?: string[]
  className?: string
  as?: HeadingTag
  /** Seconds before the first line starts rising. */
  delay?: number
}

/**
 * Headline whose lines rise out of a mask on first paint. CSS-only, so it
 * renders on the server, needs no hydration, and respects reduced motion
 * through the global media query.
 */
export function AnimatedHeadline({
  text,
  lines,
  className = '',
  as: Component = 'h1',
  delay = 0,
}: AnimatedHeadlineProps) {
  const content = lines ?? (text ? [text] : [])

  return (
    <Component
      className={`font-display text-balance ${className}`}
      style={{ '--reveal-delay': `${delay}s` } as CSSProperties}
    >
      {content.map((line, i) => (
        <span key={line} className="mask-line" style={{ '--line-index': i } as CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </Component>
  )
}

interface FadeHeadlineProps {
  children: ReactNode
  className?: string
  as?: HeadingTag | 'p' | 'span' | 'div'
  /** Seconds before the element rises in. */
  delay?: number
}

/** Short rise-in for the copy that follows an AnimatedHeadline. */
export function FadeHeadline({
  children,
  className = '',
  as: Component = 'p',
  delay = 0,
}: FadeHeadlineProps) {
  return (
    <Component
      className={`rise-in ${className}`}
      style={{ '--reveal-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </Component>
  )
}
