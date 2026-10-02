import Link from 'next/link'
import type { ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const sizeClasses = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-11 px-5 text-[0.9375rem]',
  lg: 'min-h-13 px-7 text-base',
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'rounded-lg text-white hover:bg-white/5 transition-colors',
}

/**
 * The site's button. The name is historical: it used to follow the cursor.
 * It now answers presses with a small scale instead, which works the same
 * for mouse, touch, and keyboard.
 */
export function MagneticButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
}: MagneticButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  if (href) {
    const external = /^https?:\/\//.test(href)
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
