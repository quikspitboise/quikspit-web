'use client'

import { useMemo, useState, useCallback } from 'react'
import type { Package } from './booking-data'
import { optionCardClass } from './option-card'

interface PackageStepProps {
  packages: Package[]
  selectedPackage: Package | null
  sizeAdd: number
  onSelect: (pkg: Package) => void
}

export function PackageStep({ packages, selectedPackage, sizeAdd, onSelect }: PackageStepProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const packagesByCategory = useMemo(() => {
    const grouped: Record<string, Package[]> = {}
    packages.forEach((pkg) => {
      if (!grouped[pkg.categoryId]) grouped[pkg.categoryId] = []
      grouped[pkg.categoryId].push(pkg)
    })
    return grouped
  }, [packages])

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

  const toggleCategory = useCallback((pkgs: Package[], e: React.MouseEvent) => {
    e.preventDefault()
    const keys = pkgs.map((pkg) => `${pkg.categoryId}-${pkg.id}`)
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
      <h3 className="text-white font-semibold text-xl mb-1">Choose a package</h3>
      <p className="text-neutral-400 mb-6">
        Prices below already include your vehicle size.
      </p>
      <div className="space-y-8" role="radiogroup" aria-label="Package">
        {Object.entries(packagesByCategory).map(([categoryId, pkgs]) => (
          <div key={categoryId}>
            <div className="flex items-baseline justify-between mb-3">
              <h4 className="text-white font-semibold">
                {pkgs[0]?.categoryLabel}
              </h4>
              <button
                type="button"
                onClick={(e) => toggleCategory(pkgs, e)}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {pkgs.every((p) => expandedCards.has(`${p.categoryId}-${p.id}`))
                  ? 'Hide details'
                  : 'Compare what’s included'}
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {pkgs.map((pkg) => {
                const cardKey = `${pkg.categoryId}-${pkg.id}`
                const active =
                  selectedPackage?.id === pkg.id &&
                  selectedPackage?.categoryId === pkg.categoryId
                const adjustedPrice = pkg.basePrice + sizeAdd
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
                      onChange={() => onSelect(pkg)}
                    />
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-white">
                        {pkg.name}
                      </span>
                      <span className={`font-display text-xl tabular ${active ? 'text-red-400' : 'text-white'}`}>
                        ${adjustedPrice}
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
                          <span>{isExpanded ? 'Hide details' : "What's included?"}</span>
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
                              {pkg.features.map((feature) => (
                                <li key={feature} className="text-neutral-400 text-sm flex items-start gap-2">
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
