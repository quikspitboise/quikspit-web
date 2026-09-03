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
  subtle: 'bg-gradient-to-br from-white/[0.03] to-transparent',
  red: 'bg-gradient-to-br from-red-600/10 to-transparent',
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  gradient = 'none',
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={`
        glass-card
        ${hover ? 'glass-card-hover' : ''}
        ${paddingClasses[padding]}
        ${gradientClasses[gradient]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <GlassCard className={`h-full ${className}`} hover gradient="subtle">
      <div className="flex flex-col h-full">
        <div
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-5 shadow-lg shadow-red-600/20 ring-1 ring-red-500/20"
          aria-hidden="true"
        >
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="font-display text-2xl text-white mb-3 tracking-wide">
          {title}
        </h3>
        <p className="text-neutral-400 leading-relaxed flex-grow">
          {description}
        </p>
      </div>
    </GlassCard>
  )
}
