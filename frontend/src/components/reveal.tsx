'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { PropsWithChildren, useRef, useContext, useMemo, useEffect, useState } from 'react'
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
  const suppressed = isTransitioning && skipOnRouteTransition
  const [hasAnimated, setHasAnimated] = useState(false)
  const effectiveDelay = useMemo(() => (suppressed ? 0 : delay), [delay, suppressed])
  const duration = 0.35

  useEffect(() => {
    if (!prefersReducedMotion && isInView && !isTransitioning && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, isTransitioning, prefersReducedMotion, hasAnimated])

  const hidden = useMemo(() => ({ opacity: 0, y }), [y])
  const visible = { opacity: 1, y: 0 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? visible : hidden}
      animate={prefersReducedMotion ? visible : (hasAnimated ? visible : undefined)}
      transition={{ duration, delay: effectiveDelay, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: prefersReducedMotion ? undefined : 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal


