import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: 'none' | 'subtle' | 'red'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6 lg:p-8',
  lg: 'p-8 lg:p-10',
}

const gradientClasses = {
  none: '',
  subtle: '',
  red: 'bg-linear-to-b from-red-600/[0.07] to-transparent',
}

/** Solid panel surface. Kept under its old name for existing callers. */
export function GlassCard({
  children,
  className = '',
  hover = false,
  gradient = 'none',
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${paddingClasses[padding]} ${gradientClasses[gradient]} ${className}`}
    >
      {children}
    </div>
  )
}
