'use client'

import { useCallback, useId, useState, useRef, useEffect } from 'react'

const INFO_COPY = `A ceramic coating is a liquid protection layer that's applied to your vehicle's paint and then chemically bonds to the surface. Think of it as a long-lasting shield that sits on top of your clear coat, helping guard against everyday damage like dirt, road grime, water spots, and even light scratches, all while enhancing the depth and shine. Unlike waxes or sealants that wear off after a few weeks or months, a ceramic coating is designed to last for years with proper care, giving it that freshly detailed look all the time.

Dirt, mud, and contaminants have a harder time sticking, so your car stays cleaner longer and washes up quicker. For anyone who wants their vehicle to look better, stay protected, and require less effort to maintain, a ceramic coating is one of the best upgrades you can invest in.`

export function CeramicInfoPopover({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const mobileDialogRef = useRef<HTMLDivElement>(null)
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null)
  const desktopCloseButtonRef = useRef<HTMLButtonElement>(null)
  const popoverId = useId()
  const mobileTitleId = `${popoverId}-mobile-title`
  const desktopTitleId = `${popoverId}-desktop-title`

  const closePopover = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return

    const isMobile = window.matchMedia?.('(max-width: 639px)').matches ?? false
    const originalOverflow = document.body.style.overflow
    if (isMobile) document.body.style.overflow = 'hidden'

    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePopover()
        return
      }

      if (!isMobile || e.key !== 'Tab') return

      const focusable = mobileDialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const closeButton = isMobile ? mobileCloseButtonRef.current : desktopCloseButtonRef.current
      closeButton?.focus()
    })

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      if (isMobile) document.body.style.overflow = originalOverflow
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [closePopover, open])

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      <button
        type="button"
        ref={triggerRef}
        aria-label="What is ceramic coating?"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? closePopover() : setOpen(true))}
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/15 border border-red-600/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-medium">What&apos;s this?</span>
      </button>

      {open && (
        <>
          {/* Mobile: full-screen overlay with centered card */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            aria-hidden="true"
            onClick={closePopover}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:hidden"
            onClick={(event) => {
              if (event.target === event.currentTarget) closePopover()
            }}
          >
            <div
              ref={mobileDialogRef}
              className="bg-neutral-900 border border-neutral-600 rounded-xl shadow-2xl p-5 text-left w-full max-w-sm max-h-[85vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileTitleId}
              tabIndex={-1}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 id={mobileTitleId} className="text-white font-semibold text-base">What is Ceramic Coating?</h4>
                <button
                  type="button"
                  ref={mobileCloseButtonRef}
                  onClick={closePopover}
                  className="ml-3 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 motion-safe:transition-colors shrink-0"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
              <div className="text-neutral-300 text-sm leading-relaxed space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {INFO_COPY.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: tooltip-style popover */}
          <div className="hidden sm:block absolute z-50 mt-2 w-96 left-1/2 -translate-x-1/2">
            <div
              className="bg-neutral-900 border border-neutral-600 rounded-xl shadow-2xl p-5 text-left"
              role="dialog"
              aria-labelledby={desktopTitleId}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 id={desktopTitleId} className="text-white font-semibold text-sm">What is Ceramic Coating?</h4>
                <button
                  type="button"
                  ref={desktopCloseButtonRef}
                  onClick={closePopover}
                  className="ml-2 p-0.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 motion-safe:transition-colors shrink-0"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
              <div className="text-neutral-300 text-sm leading-relaxed space-y-3">
                {INFO_COPY.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 border-t border-l border-neutral-600 rotate-45" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
