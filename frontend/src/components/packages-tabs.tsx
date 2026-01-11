'use client'

import { useState } from 'react'
import { Reveal } from '@/components/reveal'

interface Package {
    id: string
    name: string
    tagline?: string
    description?: string
    basePrice: number
    highlight?: boolean
    features: string[]
}

interface PackageCategory {
    id: string
    label: string
    blurb: string
    packages: Package[]
}

interface PackagesTabsProps {
    categories: PackageCategory[]
}

export function PackagesTabs({ categories }: PackagesTabsProps) {
    const [activeCategory, setActiveCategory] = useState(0)

    const category = categories[activeCategory]

    return (
        <div>
            {/* Tab Buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10">
                {categories.map((cat, index) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(index)}
                        className={`
              px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300
              ${activeCategory === index
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-white border border-neutral-700'
                            }
            `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Category Blurb */}
            <div className="text-center mb-8">
                <p className="text-neutral-300">{category.blurb}</p>
            </div>

            {/* Package Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {category.packages.map((pkg) => {
                    const accent = pkg.highlight ? 'border-red-600 shadow-red-600/20' : 'border-neutral-600'
                    const metalClass =
                        pkg.id === 'silver'
                            ? 'metal-base metal-silver'
                            : pkg.id === 'gold'
                                ? 'metal-base metal-gold'
                                : pkg.id === 'platinum'
                                    ? 'metal-base metal-platinum'
                                    : ''
                    return (
                        <div
                            key={`${category.id}-${pkg.id}`}
                            className={`relative ${metalClass || ''} bg-brand-charcoal-light p-6 rounded-xl border ${accent} shadow-lg hover:shadow-xl flex flex-col transition-all duration-300`}
                        >
                            {pkg.highlight && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs tracking-wide px-3 py-1 rounded-full shadow">
                                    Popular
                                </span>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-white mb-1">{pkg.name}</h3>
                                {pkg.tagline && <p className="text-red-600 text-sm font-medium italic mb-2">{pkg.tagline}</p>}
                                {pkg.description && <p className="text-neutral-300 text-sm leading-relaxed">{pkg.description}</p>}
                            </div>
                            <ul className="text-neutral-300 text-sm space-y-2 mb-6 flex-1">
                                {pkg.features.map((f) => (
                                    <li key={f} className="flex items-start">
                                        <span className="text-red-600 mr-2">•</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto pt-4 border-t border-neutral-700 flex items-center justify-between">
                                <span className="text-3xl font-bold text-white">
                                    <span className="text-red-600">${pkg.basePrice}</span>
                                    <span className="text-neutral-400 text-base align-top ml-1">+*</span>
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
