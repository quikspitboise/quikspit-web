'use client'

import { useMemo, useState, useCallback } from 'react'
import type { Package } from './booking-data'

interface PackageStepProps {
  packages: Package[]
  selectedPackage: Package | null
  sizeAdd: number
  onSelect: (pkg: Package) => void
}

export function PackageStep({ packages, selectedPackage, sizeAdd, onSelect }: PackageStepProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

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
    setExpandedCard((prev) => (prev === cardKey ? null : cardKey))
  }, [])

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">Choose Your Package</h3>
      <p className="text-neutral-400 text-sm mb-5">
        Select a service category and tier. All prices include your vehicle size adjustment.
      </p>
      <div className="space-y-6">
        {Object.entries(packagesByCategory).map(([categoryId, pkgs]) => (
          <div key={categoryId}>
            <h4 className="text-red-500 text-sm uppercase tracking-wide font-medium mb-3">
              {pkgs[0]?.categoryLabel}
            </h4>
            <div className="grid sm:grid-cols-3 gap-3">
              {pkgs.map((pkg) => {
                const cardKey = `${pkg.categoryId}-${pkg.id}`
                const active =
                  selectedPackage?.id === pkg.id &&
                  selectedPackage?.categoryId === pkg.categoryId
                const adjustedPrice = pkg.basePrice + sizeAdd
                const isExpanded = expandedCard === cardKey
                return (
                  <label
                    key={cardKey}
                    className={`cursor-pointer select-none p-4 rounded-xl border transition-colors duration-150 ${
                      active
                        ? 'bg-red-600/10 border-red-600 shadow-sm shadow-red-600/20'
                        : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedPackage"
                      className="sr-only"
                      checked={active}
                      onChange={() => onSelect(pkg)}
                    />
                    <div className="flex items-start justify-between mb-1">
                      <span className={`font-medium ${active ? 'text-white' : 'text-neutral-200'}`}>
                        {pkg.name}
                      </span>
                      <span className={`font-display ${active ? 'text-red-400' : 'text-red-500'}`}>
                        ${adjustedPrice}
                      </span>
                    </div>
                    {pkg.tagline && (
                      <p className="text-neutral-400 text-xs italic">{pkg.tagline}</p>
                    )}

                    {pkg.features && pkg.features.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(cardKey, e)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide details' : "What's included?"}</span>
                          <svg
                            className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className="grid transition-[grid-template-rows] duration-200 ease-out"
                          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                        >
                          <div className="overflow-hidden">
                            <ul className="pt-2 space-y-1">
                              {pkg.features.map((feature) => (
                                <li key={feature} className="text-neutral-400 text-xs flex items-start gap-1.5">
                                  <span className="text-red-500 mt-0.5 shrink-0">✓</span>
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
