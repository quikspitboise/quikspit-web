"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ComparisonSlider } from './comparison-slider'
import { AccessibleDialog } from './ui/accessible-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CldImage } from 'next-cloudinary'
import type { GalleryItem } from '@/lib/gallery'

type GalleryGridProps = {
  items: GalleryItem[]
}

function getItemCategories(item: GalleryItem): string[] {
  const categories = [...(item.categories ?? []), ...(item.tags ?? [])]

  if (categories.length > 0) {
    return Array.from(new Set(categories))
  }

  if (item.beforeUrl && item.afterUrl) {
    return ['comparison']
  }
  return ['showcase']
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
  onOpen: (idx: number, opener: HTMLElement) => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const isComparison = !!(item.beforeUrl && item.afterUrl)
  const itemAlt = item.altText || item.title

  return (
    <motion.div
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="gallery-card break-inside-avoid mb-5"
    >
      <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-neutral-900/60 backdrop-blur-sm">
        {/* Image / Comparison */}
        {isComparison ? (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <ComparisonSlider
              beforeUrl={item.beforeUrl!}
              afterUrl={item.afterUrl!}
              altBefore={`${itemAlt} - before detailing`}
              altAfter={`${itemAlt} - after detailing`}
            />
            {/* Badge */}
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white tracking-wide uppercase shadow-lg">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
              Before &amp; After
            </span>
            {/* Lightbox button on comparison cards */}
            <button
              type="button"
              className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium py-2.5 px-3.5 rounded-lg transition-all"
              onClick={(e) => { e.stopPropagation(); onOpen(index, e.currentTarget) }}
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
          <button
            type="button"
            className="group relative block w-full overflow-hidden text-left"
            onClick={(e) => onOpen(index, e.currentTarget)}
            aria-label={`View ${item.title}`}
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <CldImage
                src={item.imageUrl}
                alt={itemAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                format="auto"
                quality="auto"
                className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out group-hover:scale-105"
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
          </button>
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
  const openerRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Build categories dynamically from data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach((item) => {
      getItemCategories(item).forEach((category) => cats.add(category))
    })
    return ['all', ...Array.from(cats)]
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter((item) => {
      return getItemCategories(item).includes(activeCategory)
    })
  }, [items, activeCategory])

  const featuredItems = useMemo(() => {
    if (activeCategory !== 'all') return []
    return filteredItems.slice(0, 6)
  }, [activeCategory, filteredItems])

  const masonryItems = useMemo(() => {
    if (activeCategory !== 'all') return filteredItems
    return filteredItems.slice(6)
  }, [activeCategory, filteredItems])

  // Active item for lightbox — index is relative to filtered list
  const activeItem = useMemo(
    () => (activeIndex == null ? null : filteredItems[activeIndex]),
    [activeIndex, filteredItems],
  )

  const onOpen = useCallback((idx: number, opener: HTMLElement) => {
    openerRef.current = opener
    setActiveIndex(idx)
    setIsZoomed(false)
  }, [])
  const onClose = useCallback(() => { setActiveIndex(null); setIsZoomed(false) }, [])

  const handleDialogKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (
      target.matches('a, button, input, select, textarea, [contenteditable="true"]') ||
      event.key === 'Tab'
    ) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setIsZoomed(false)
      setActiveIndex((index) => (index == null ? index : Math.min(filteredItems.length - 1, index + 1)))
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setIsZoomed(false)
      setActiveIndex((index) => (index == null ? index : Math.max(0, index - 1)))
    }
  }, [filteredItems.length])

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

      {featuredItems.length > 0 && (
        <motion.div
          className="gallery-featured"
          layout={!prefersReducedMotion}
        >
          <AnimatePresence mode="popLayout">
            {featuredItems.map((item, idx) => (
              <div
                key={item.id}
                className={idx < 6 ? `gallery-featured__item gallery-featured__item--${idx + 1}` : 'gallery-featured__item'}
              >
                <GalleryCard item={item} index={idx} onOpen={onOpen} />
              </div>
            ))}
          </AnimatePresence>
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
                index={featuredItems.length + idx}
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
      {activeItem && (
        <AccessibleDialog
          open
          onClose={onClose}
          labelledBy="gallery-dialog-title"
          initialFocusRef={closeBtnRef}
          openerRef={openerRef}
          onKeyDown={handleDialogKeyDown}
          className="w-full max-w-[95vw] max-h-[92vh] mx-2 sm:mx-4 bg-neutral-900/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/60 p-3 sm:p-5 flex flex-col"
        >
          <div
            className="flex min-h-0 flex-1 flex-col"
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
                    <h3 id="gallery-dialog-title" className="text-white text-lg font-semibold">{activeItem.title}</h3>
                    <span className="text-neutral-500 text-sm">
                      {activeIndex! + 1} / {filteredItems.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      className="hidden sm:inline-flex items-center justify-center h-11 w-11 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all"
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
                      className="hidden sm:inline-flex items-center justify-center h-11 w-11 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all"
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
                      className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-all"
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
                      className="mx-auto w-full"
                      style={{
                        maxWidth: 'min(100%, calc((92vh - 10rem) * 4 / 3))',
                      }}
                    >
                      <ComparisonSlider
                        beforeUrl={activeItem.beforeUrl}
                        afterUrl={activeItem.afterUrl}
                        altBefore={`${activeItem.altText || activeItem.title} - before detailing`}
                        altAfter={`${activeItem.altText || activeItem.title} - after detailing`}
                        initialPosition={50}
                        imageFit="contain"
                        sizes="(max-width: 768px) 100vw, 90vw"
                      />
                    </div>
                  ) : activeItem.imageUrl ? (
                      <div
                        ref={zoomContainerRef}
                        className={`relative w-full overflow-hidden rounded-xl ${
                          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                        style={{ height: 'calc(92vh - 6rem)' }}
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
                        alt={activeItem.altText || activeItem.title}
                        fill
                        sizes="(max-width: 1920px) 100vw, 1920px"
                        format="auto"
                        quality="auto"
                        className={`motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${
                          isZoomed ? 'scale-[2.5]' : 'scale-100'
                        } object-contain`}
                        style={isZoomed ? { transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` } : undefined}
                      />
                      <button
                        type="button"
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition hover:bg-red-600 hover:text-white"
                        onClick={() => setIsZoomed((zoomed) => !zoomed)}
                        aria-pressed={isZoomed}
                        aria-label={isZoomed ? `Zoom out ${activeItem.title}` : `Zoom in ${activeItem.title}`}
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          {isZoomed ? <line x1="8" y1="11" x2="14" y2="11" /> : <><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></>}
                        </svg>
                        {isZoomed ? 'Zoom out' : 'Zoom in'}
                      </button>
                    </div>
                  ) : null}
                </div>
          </div>
        </AccessibleDialog>
      )}
    </>
  )
}

export default GalleryGrid
