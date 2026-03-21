"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ComparisonSlider } from './comparison-slider'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CldImage } from 'next-cloudinary'

export type GalleryItem = {
  id: string
  title: string
  description?: string
  category?: string
  // For comparison images (before/after)
  beforeUrl?: string
  afterUrl?: string
  // For single images
  imageUrl?: string
}

type GalleryGridProps = {
  items: GalleryItem[]
}

/* ─── Filter Tab ─────────────────────────────────────────────── */
function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`filter-tab ${active ? 'filter-tab--active' : ''}`}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      aria-pressed={active}
    >
      {label}
    </motion.button>
  )
}

/* ─── Gallery Card ───────────────────────────────────────────── */
function GalleryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem
  index: number
  onOpen: (idx: number) => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const isComparison = !!(item.beforeUrl && item.afterUrl)

  return (
    <motion.div
      layout={!prefersReducedMotion}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="gallery-card break-inside-avoid mb-5"
    >
      <div
        className="group relative overflow-hidden rounded-2xl border border-white/6 bg-neutral-900/60 backdrop-blur-sm cursor-pointer"
        onClick={() => onOpen(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(index)
          }
        }}
        aria-label={`View ${item.title}`}
      >
        {/* Image / Comparison */}
        {isComparison ? (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ComparisonSlider
              beforeUrl={item.beforeUrl!}
              afterUrl={item.afterUrl!}
              altBefore={`${item.title} - before detailing`}
              altAfter={`${item.title} - after detailing`}
            />
            {/* Badge */}
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white tracking-wide uppercase shadow-lg">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
              Before &amp; After
            </span>
            {/* Clickable overlay for lightbox on comparison cards */}
            <button
              type="button"
              className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium py-2 px-3 rounded-lg transition-all"
              onClick={(e) => { e.stopPropagation(); onOpen(index) }}
              aria-label={`Enlarge ${item.title}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              Expand
            </button>
          </div>
        ) : item.imageUrl ? (
          <>
            <div className="relative aspect-4/3 overflow-hidden">
              <CldImage
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            {/* Hover overlay */}
            <div className="gallery-card__overlay">
              <span className="text-white font-semibold text-sm leading-snug drop-shadow-lg">{item.title}</span>
              <span className="inline-flex items-center gap-1 text-white/70 text-xs mt-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                View
              </span>
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  )
}

/* ─── Main Gallery Grid ──────────────────────────────────────── */
export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const zoomContainerRef = useRef<HTMLDivElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchDeltaXRef = useRef<number>(0)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Build categories dynamically from data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach((item) => {
      if (item.category) cats.add(item.category)
      else if (item.beforeUrl && item.afterUrl) cats.add('comparison')
      else cats.add('showcase')
    })
    return ['all', ...Array.from(cats)]
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter((item) => {
      const cat = item.category || (item.beforeUrl && item.afterUrl ? 'comparison' : 'showcase')
      return cat === activeCategory
    })
  }, [items, activeCategory])

  const comparisonTopItems = useMemo(() => {
    if (activeCategory !== 'all') return []
    return filteredItems.slice(0, 2)
  }, [activeCategory, filteredItems])

  const exteriorTopItems = useMemo(() => {
    if (activeCategory !== 'all') return []
    return filteredItems.slice(2, 5)
  }, [activeCategory, filteredItems])

  const masonryItems = useMemo(() => {
    if (activeCategory !== 'all') return filteredItems
    return filteredItems.slice(5)
  }, [activeCategory, filteredItems])

  // Active item for lightbox — index is relative to filtered list
  const activeItem = useMemo(
    () => (activeIndex == null ? null : filteredItems[activeIndex]),
    [activeIndex, filteredItems],
  )

  const onOpen = useCallback((idx: number) => { setActiveIndex(idx); setIsZoomed(false) }, [])
  const onClose = useCallback(() => { setActiveIndex(null); setIsZoomed(false) }, [])

  // Keyboard nav for lightbox
  useEffect(() => {
    if (activeIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (isZoomed) { setIsZoomed(false); return } onClose() }
      if (e.key === 'ArrowRight') { setIsZoomed(false); setActiveIndex((i) => (i == null ? i : Math.min(filteredItems.length - 1, i + 1))) }
      if (e.key === 'ArrowLeft') { setIsZoomed(false); setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1))) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, filteredItems.length, onClose])

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

  // Pretty-print the category label
  const labelFor = (cat: string) => {
    if (cat === 'all') return 'All'
    if (cat === 'comparison') return 'Before & After'
    return cat.charAt(0).toUpperCase() + cat.slice(1)
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <FilterTab
            key={cat}
            label={labelFor(cat)}
            active={activeCategory === cat}
            onClick={() => { setActiveCategory(cat); setActiveIndex(null) }}
          />
        ))}
      </div>

      {(comparisonTopItems.length > 0 || exteriorTopItems.length > 0) && (
        <motion.div
          className="gallery-featured"
          layout={!prefersReducedMotion}
        >
          {comparisonTopItems.length > 0 && (
            <div className="gallery-featured__comparisons">
              <AnimatePresence mode="popLayout">
                {comparisonTopItems.map((item, idx) => (
                  <GalleryCard key={item.id} item={item} index={idx} onOpen={onOpen} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {exteriorTopItems.length > 0 && (
            <div className="gallery-featured__images">
              <AnimatePresence mode="popLayout">
                {exteriorTopItems.map((item, idx) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    index={comparisonTopItems.length + idx}
                    onOpen={onOpen}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Masonry Grid */}
      {masonryItems.length > 0 && (
        <motion.div
          className="gallery-masonry"
          layout={!prefersReducedMotion}
        >
          <AnimatePresence mode="popLayout">
            {masonryItems.map((item, idx) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={comparisonTopItems.length + exteriorTopItems.length + idx}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Counter */}
      <div className="text-center mt-8 text-neutral-500 text-sm tracking-wide">
        {filteredItems.length} {filteredItems.length === 1 ? 'photo' : 'photos'}
      </div>

      {/* ─── Lightbox Modal ─────────────────────────────────────── */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeItem && (
            <motion.div
              key="lightbox-root"
              className="fixed inset-0 z-9999 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label={`${activeItem.title} enlarged view`}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.button
                key="backdrop"
                type="button"
                aria-label="Close"
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
                onClick={onClose}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              />

              {/* Dialog content */}
              <motion.div
                key="dialog"
                className="relative z-1 w-full max-w-[95vw] max-h-[92vh] mx-2 sm:mx-4 bg-neutral-900/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/60 p-3 sm:p-5 flex flex-col"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 16 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 26, mass: 0.5 }
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
                    setIsZoomed(false)
                    if (delta < 0) setActiveIndex((i) => (i == null ? i : Math.min(filteredItems.length - 1, i + 1)))
                    else setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1)))
                  }
                  touchStartXRef.current = null
                  touchDeltaXRef.current = 0
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold">{activeItem.title}</h3>
                    <span className="text-neutral-500 text-sm">
                      {activeIndex! + 1} / {filteredItems.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all"
                      onClick={() => setActiveIndex((i) => (i == null ? i : Math.max(0, i - 1)))}
                      aria-label="Previous"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </motion.button>
                    <motion.button
                      type="button"
                      className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all"
                      onClick={() => setActiveIndex((i) => (i == null ? i : Math.min(filteredItems.length - 1, i + 1)))}
                      aria-label="Next"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </motion.button>
                    <motion.button
                      ref={closeBtnRef}
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-all"
                      aria-label="Close"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Image */}
                <div className="relative flex-1 min-h-0 flex items-center justify-center">
                  {activeItem.beforeUrl && activeItem.afterUrl ? (
                    <div 
                      className="w-full"
                      style={{
                        maxHeight: 'calc(92vh - 10rem)',
                        maxWidth: 'calc((92vh - 10rem) * 1.6)'
                      }}
                    >
                      <ComparisonSlider
                        beforeUrl={activeItem.beforeUrl}
                        afterUrl={activeItem.afterUrl}
                        altBefore={`${activeItem.title} - before detailing`}
                        altAfter={`${activeItem.title} - after detailing`}
                        initialPosition={50}
                      />
                    </div>
                  ) : activeItem.imageUrl ? (
                    <div
                      ref={zoomContainerRef}
                      className={`relative w-full overflow-hidden rounded-xl ${
                        isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      style={{ height: 'calc(92vh - 6rem)' }}
                      onClick={() => setIsZoomed((z) => !z)}
                      onMouseMove={(e) => {
                        if (!isZoomed || !zoomContainerRef.current) return
                        const rect = zoomContainerRef.current.getBoundingClientRect()
                        const x = ((e.clientX - rect.left) / rect.width) * 100
                        const y = ((e.clientY - rect.top) / rect.height) * 100
                        setZoomOrigin({ x, y })
                      }}
                    >
                      <CldImage
                        src={activeItem.imageUrl}
                        alt={activeItem.title}
                        fill
                        sizes="(max-width: 1920px) 100vw, 1920px"
                        className={`transition-transform duration-300 ease-out ${
                          isZoomed ? 'scale-[2.5]' : 'scale-100'
                        } object-contain`}
                        style={isZoomed ? { transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` } : undefined}
                      />
                      {/* Zoom hint */}
                      {!isZoomed && (
                        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-lg pointer-events-none">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                          Click to zoom
                        </div>
                      )}
                    </div>
                  ) : null}
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
