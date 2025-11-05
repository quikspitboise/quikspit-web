"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ComparisonSlider } from './comparison-slider'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type GalleryItem = {
  id: string
  title: string
  description?: string
  beforeUrl: string
  afterUrl: string
}

type GalleryGridProps = {
  items: GalleryItem[]
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeItem = useMemo(() => (activeIndex == null ? null : items[activeIndex]), [activeIndex, items])
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchDeltaXRef = useRef<number>(0)
  const prefersReducedMotion = useReducedMotion()

  const onOpen = useCallback((index: number) => setActiveIndex(index), [])
  const onClose = useCallback(() => setActiveIndex(null), [])

  // Close on ESC
  useEffect(() => {
    if (activeIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i == null ? i : Math.min(items.length - 1, i + 1)))
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1)))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, items.length, onClose])

  // Focus close button when modal opens
  useEffect(() => {
    if (activeIndex != null) closeBtnRef.current?.focus()
  }, [activeIndex])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (activeIndex != null) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [activeIndex])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-600 group">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">{item.title}</h3>
              {item.description ? (
                <span className="text-neutral-300 text-sm">{item.description}</span>
              ) : (
                <span className="text-neutral-300 text-sm">Before / After</span>
              )}
            </div>

            <div
              className="relative"
              onDoubleClick={() => onOpen(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen(idx)
                }
              }}
              title="Double-click to view larger"
            >
              <ComparisonSlider
                beforeUrl={item.beforeUrl}
                afterUrl={item.afterUrl}
                altBefore={`${item.title} - before detailing`}
                altAfter={`${item.title} - after detailing`}
              />

              {/* Hover affordance to open lightbox */}
              <motion.button
                type="button"
                onClick={() => onOpen(idx)}
                className="absolute top-3 right-3 inline-flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white text-sm font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light min-h-[44px] min-w-[44px]"
                aria-label={`Enlarge ${item.title}`}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="hidden sm:inline">View</span>
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeItem && (
            <motion.div
              key="lightbox-root"
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label={`${activeItem.title} enlarged comparison`}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.button
                key="backdrop"
                type="button"
                aria-label="Close"
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              />

              {/* Dialog content */}
              <motion.div
                key="dialog"
                className="relative z-[1] w-full max-w-5xl mx-4 sm:mx-6 bg-brand-charcoal-light border border-neutral-600 rounded-xl shadow-2xl p-4 sm:p-6"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 12 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }
                }
                onTouchStart={(e) => {
                  touchStartXRef.current = e.changedTouches[0].clientX
                  touchDeltaXRef.current = 0
                }}
                onTouchMove={(e) => {
                  if (touchStartXRef.current == null) return
                  touchDeltaXRef.current = e.changedTouches[0].clientX - touchStartXRef.current
                }}
                onTouchEnd={() => {
                  const delta = touchDeltaXRef.current
                  const threshold = 60
                  if (Math.abs(delta) > threshold) {
                    if (delta < 0) setActiveIndex((i) => (i == null ? i : Math.min(items.length - 1, i + 1)))
                    else setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1)))
                  }
                  touchStartXRef.current = null
                  touchDeltaXRef.current = 0
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">{activeItem.title}</h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-600 text-neutral-300 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
                      onClick={() => setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1)))}
                      aria-label="Previous"
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </motion.button>
                    <motion.button
                      type="button"
                      className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-600 text-neutral-300 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
                      onClick={() => setActiveIndex((i) => (i == null ? i : Math.min(items.length - 1, i + 1)))}
                      aria-label="Next"
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </motion.button>
                    <motion.button
                      ref={closeBtnRef}
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>

                <div className="relative">
                  <ComparisonSlider
                    beforeUrl={activeItem.beforeUrl}
                    afterUrl={activeItem.afterUrl}
                    altBefore={`${activeItem.title} - before detailing`}
                    altAfter={`${activeItem.title} - after detailing`}
                    initialPosition={50}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default GalleryGrid
