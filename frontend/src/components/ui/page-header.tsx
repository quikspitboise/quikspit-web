import type { ReactNode } from 'react'
import { AnimatedHeadline, FadeHeadline } from './animated-headline'

interface PageHeaderProps {
  title: string
  /** Optional explicit line breaks for the title. */
  lines?: string[]
  lede?: ReactNode
  children?: ReactNode
}

/** Left-aligned header shared by the inner pages. */
export function PageHeader({ title, lines, lede, children }: PageHeaderProps) {
  return (
    <header className="container mx-auto px-5 sm:px-6 lg:px-8 pt-14 pb-12 lg:pt-24 lg:pb-16">
      <AnimatedHeadline
        text={title}
        lines={lines}
        as="h1"
        className="text-[clamp(2.5rem,7vw,5.5rem)] text-white uppercase max-w-5xl"
      />
      {lede && (
        <FadeHeadline delay={0.25} className="mt-6 max-w-2xl text-lg sm:text-xl text-neutral-400 text-pretty">
          {lede}
        </FadeHeadline>
      )}
      {children && (
        <FadeHeadline as="div" delay={0.35} className="mt-8">
          {children}
        </FadeHeadline>
      )}
    </header>
  )
}
