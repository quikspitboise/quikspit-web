'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { buildBookingParams } from '@/lib/booking-params'
import type { PackageCategory } from '@/components/booking/booking-data'

interface PackagesTabsProps {
  categories: PackageCategory[]
}

function getBookingHref(category: PackageCategory, pkg: PackageCategory['packages'][number]) {
  const params = buildBookingParams({
    category: category.id,
    tier: pkg.id,
    size: 'car',
    sizeLabel: 'Car / Sedan',
    addons: '',
    total: pkg.basePrice,
    packageName: `${pkg.name} (${category.label})`,
  })
  return `/booking?${params.toString()}#design-your-detail`
}

export function PackagesTabs({ categories }: PackagesTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const prefersReducedMotion = useReducedMotion()
  const baseId = useId()
  const category = categories[activeIndex]

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = categories.length - 1
    let next: number | null = null
    if (event.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1
    else if (event.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next === null) return
    event.preventDefault()
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Service"
        className="inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 p-1"
        onKeyDown={onKeyDown}
      >
        {categories.map((cat, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={cat.id}
              ref={(el) => { tabRefs.current[index] = el }}
              id={`${baseId}-tab-${cat.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className={`relative min-h-11 whitespace-nowrap rounded-full px-4 sm:px-5 text-sm sm:text-[0.9375rem] font-medium transition-colors duration-200 ${
                selected ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`${baseId}-pill`}
                  className="absolute inset-0 rounded-full bg-red-600"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">{cat.label}</span>
            </button>
          )
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${category.id}`}
        className="mt-6"
      >
        <p className="text-neutral-400 mb-6">{category.blurb}</p>

        <div key={category.id} className="grid gap-4 md:grid-cols-3 animate-fade-in">
          {category.packages.map((pkg) => {
            const featured = pkg.highlight || pkg.bestValue
            return (
              <article
                key={pkg.id}
                className={`flex flex-col rounded-2xl border p-6 ${
                  featured ? 'border-red-600/70 bg-red-600/[0.05]' : 'border-white/10 bg-[#0c0c0c]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
                  {featured && (
                    <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                      {pkg.bestValue ? 'Best value' : 'Most popular'}
                    </span>
                  )}
                </div>
                {pkg.tagline && <p className="mt-1 text-sm text-red-300">{pkg.tagline}</p>}
                {pkg.description && <p className="mt-3 text-sm text-neutral-400 text-pretty">{pkg.description}</p>}

                <p className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl text-white tabular">${pkg.basePrice}</span>
                  <span className="text-sm text-neutral-500">for a car</span>
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/10 pt-5 text-sm text-neutral-300">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={getBookingHref(category, pkg)}
                  className={`mt-6 inline-flex min-h-11 items-center justify-center text-[0.9375rem] ${
                    featured ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Book {pkg.name}
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
