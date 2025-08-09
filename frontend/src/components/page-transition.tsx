'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'

type PageTransitionProps = PropsWithChildren<{
  keyByPath?: boolean
}>

export const TransitionContext = createContext<{ isTransitioning: boolean }>({ isTransitioning: false })

export function PageTransition({ children, keyByPath = true }: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!keyByPath || prefersReducedMotion) return
    setIsTransitioning(true)
    const t = setTimeout(() => setIsTransitioning(false), 320)
    return () => clearTimeout(t)
  }, [pathname, keyByPath, prefersReducedMotion])

  const content = (
    <motion.div
      key={keyByPath ? pathname : undefined}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', inset: 0, width: '100%', willChange: 'opacity' }}
    >
      {children}
    </motion.div>
  )

  const contextValue = useMemo(() => ({ isTransitioning }), [isTransitioning])

  return (
    <TransitionContext.Provider value={contextValue}>
      <div style={{ position: 'relative', minHeight: '100dvh' }}>
        <AnimatePresence mode="sync" initial={false}>
          {content}
        </AnimatePresence>
      </div>
    </TransitionContext.Provider>
  )
}

export default PageTransition


