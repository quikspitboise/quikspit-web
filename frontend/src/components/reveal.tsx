'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { PropsWithChildren, useRef, useContext, useMemo } from 'react'
import { TransitionContext } from './page-transition'

type RevealProps = PropsWithChildren<{
  delay?: number
  className?: string
  y?: number
  skipOnRouteTransition?: boolean
}>

export function Reveal({ children, delay = 0, className, y = 16, skipOnRouteTransition = false }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { margin: '0px 0px -10% 0px', once: true })
  const prefersReducedMotion = useReducedMotion()
  const { isTransitioning } = useContext(TransitionContext)
  const skipOnMount = isTransitioning && skipOnRouteTransition
  const effectiveDelay = useMemo(() => (skipOnMount ? 0 : delay), [delay, skipOnMount])
  const duration = useMemo(() => (skipOnMount ? 0 : 0.35), [skipOnMount])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? { opacity: 1 } : (skipOnMount ? { opacity: 1, y: 0 } : { opacity: 0, y })}
      animate={isInView ? (prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : undefined}
      transition={{ duration, delay: effectiveDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal


