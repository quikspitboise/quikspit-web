'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { MouseEvent, ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  magneticStrength?: number
}

/**
 * The magnetic hover effect only makes sense with a fine pointer (mouse)
 * and when the user has not asked for reduced motion. Everywhere else the
 * button renders as a plain link/button with no motion wrappers or
 * mousemove listeners.
 */
function useMagneticEnabled() {
  const prefersReducedMotion = useReducedMotion()
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    const update = () => setFinePointer(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return finePointer && !prefersReducedMotion
}

export function MagneticButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  magneticStrength = 0.3,
}: MagneticButtonProps) {
  const magnetic = useMagneticEnabled()
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent) => {
    if (disabled) return
    const el = href ? anchorRef.current : buttonRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * magneticStrength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * magneticStrength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const sizeClasses = {
    sm: 'px-5 py-3 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'bg-transparent hover:bg-white/5 text-white border border-transparent hover:border-white/10 rounded-xl transition-all duration-300',
  }

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold tracking-wide
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  if (href) {
    const link = (
      <Link href={href} ref={anchorRef} className={baseClasses}>
        {children}
      </Link>
    )
    if (!magnetic) return link
    return (
      <motion.div
        style={{ x: xSpring, y: ySpring }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {link}
      </motion.div>
    )
  }

  const button = (
    <button ref={buttonRef} className={baseClasses} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
  if (!magnetic) return button
  return (
    <motion.div
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {button}
    </motion.div>
  )
}
