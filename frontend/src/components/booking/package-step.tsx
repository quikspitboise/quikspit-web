'use client'

import { useBookingCopy } from './booking-copy'

import { useState, useCallback } from 'react'
import type { CatalogCategory } from '@/lib/content/types'
import { formatCents } from '@/lib/content/catalog'
import { optionCardClass } from './option-card'

type PackageRef = { categoryId: string; packageId: string }

interface PackageStepProps {
  categories: CatalogCategory[]
  selected: PackageRef | null
  sizeAddCents: number
  onSelect: (ref: PackageRef) => void
}

export function PackageStep({ categories, selected, sizeAddCents, onSelect }: PackageStepProps) {
  const text = useBookingCopy()
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const toggleExpand = useCallback((cardKey: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardKey)) next.delete(cardKey)
      else next.add(cardKey)
      return next
    })
  }, [])

  const toggleCategory = useCallback((category: CatalogCategory, e: React.MouseEvent) => {
    e.preventDefault()
    const keys = category.packages.map((pkg) => `${category.id}-${pkg.id}`)
    setExpandedCards((prev) => {
      const allExpanded = keys.every((k) => prev.has(k))
      const next = new Set(prev)
      if (allExpanded) {
        keys.forEach((k) => next.delete(k))
      } else {
        keys.forEach((k) => next.add(k))
      }
      return next
    })
  }, [])

  return (
    <div>
      <h3 className="text-white font-semibold text-xl mb-1">{text('packageHeading')}</h3>
      <p className="text-neutral-400 mb-6">
        {text('packageDescription')}
      </p>
      <div className="space-y-8" role="radiogroup" aria-label={text('packageLabel')}>
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-baseline justify-between mb-3">
              <h4 className="text-white font-semibold">
                {category.label}
              </h4>
              <button
                type="button"
                onClick={(e) => toggleCategory(category, e)}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {category.packages.every((p) => expandedCards.has(`${category.id}-${p.id}`))
                  ? text('hideDetailsLabel')
                  : text('compareDetailsLabel')}
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {category.packages.map((pkg) => {
                const cardKey = `${category.id}-${pkg.id}`
                const active =
                  selected?.packageId === pkg.id &&
                  selected?.categoryId === category.id
                const adjustedPrice = pkg.basePriceCents + sizeAddCents
                const isExpanded = expandedCards.has(cardKey)
                return (
                  <label
                    key={cardKey}
                    className={optionCardClass(active)}
                  >
                    <input
                      type="radio"
                      name="selectedPackage"
                      className="sr-only"
                      checked={active}
                      onChange={() => onSelect({ categoryId: category.id, packageId: pkg.id })}
                    />
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-white">
                        {pkg.name}
                      </span>
                      <span className={`font-display text-xl tabular ${active ? 'text-red-400' : 'text-white'}`}>
                        {formatCents(adjustedPrice)}
                      </span>
                    </div>
                    {pkg.tagline && (
                      <p className="text-neutral-400 text-sm">{pkg.tagline}</p>
                    )}

                    {pkg.features && pkg.features.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(cardKey, e)}
                          aria-expanded={isExpanded}
                          className="relative mt-2 -ml-1 inline-flex min-h-8 items-center gap-1 px-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          <span>{isExpanded ? text('hideDetailsLabel') : text('showDetailsLabel')}</span>
                          <svg
                            aria-hidden="true"
                            className={`h-3 w-3 transition-transform duration-300 ease-out-expo ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className="grid transition-[grid-template-rows] duration-300 ease-out-expo"
                          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                        >
                          <div className="overflow-hidden" inert={!isExpanded}>
                            <ul className="pt-2 space-y-1">
                              {pkg.features.map((feature, index) => (
                                <li key={index} className="text-neutral-400 text-sm flex items-start gap-2">
                                  <span className="text-red-500 shrink-0" aria-hidden="true">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
