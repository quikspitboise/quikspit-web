'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type KeyboardEventHandler, type ReactNode, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type AccessibleDialogProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  labelledBy?: string
  className?: string
  initialFocusRef?: RefObject<HTMLElement | null>
  openerRef?: RefObject<HTMLElement | null>
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0,
  )
}

export function AccessibleDialog({
  open,
  onClose,
  children,
  ariaLabel,
  labelledBy,
  className = '',
  initialFocusRef,
  openerRef,
  onKeyDown,
}: AccessibleDialogProps) {
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted || !open) return

    const opener = openerRef?.current ?? (document.activeElement as HTMLElement | null)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusInitialElement = () => {
      if (dialogRef.current?.contains(document.activeElement)) return

      const initial = initialFocusRef?.current
      if (initial) {
        initial.focus()
        return
      }

      const firstFocusable = dialogRef.current && getFocusableElements(dialogRef.current)[0]
      ;(firstFocusable ?? dialogRef.current)?.focus()
    }

    const frame = window.requestAnimationFrame(focusInitialElement)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = getFocusableElements(dialogRef.current)
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || activeElement === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [initialFocusRef, mounted, onClose, openerRef, open])

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onMouseDown={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative z-1 ${className}`.trim()}
        onKeyDown={onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
