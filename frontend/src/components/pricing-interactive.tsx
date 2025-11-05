'use client'

import { Reveal } from '@/components/reveal'
import { useState, useMemo } from 'react'

type Package = {
  id: string
  name: string
  tagline?: string
  description?: string
  basePrice: number
  features: string[]
  highlight?: boolean
  includesFrom?: string
}

type Category = {
  id: string
  label: string
  blurb: string
  packages: Package[]
}

type SizeAdjustment = {
  id: string
  label: string
  add: number
}

type PricingInteractiveProps = {
  categories: Category[]
  sizeAdjustments: SizeAdjustment[]
}

export function PricingInteractive({ categories, sizeAdjustments }: PricingInteractiveProps) {
  const [activeCategory, setActiveCategory] = useState<string>('combo')
  const [vehicleSize, setVehicleSize] = useState<string>('car')

  const sizeAdd = useMemo(() => sizeAdjustments.find(s => s.id === vehicleSize)?.add || 0, [vehicleSize, sizeAdjustments])
  const currentCategory = useMemo(() => categories.find(c => c.id === activeCategory)!, [activeCategory, categories])

  return (
    <>
      {/* Category Tabs */}
      <Reveal delay={0.1} skipOnRouteTransition>
        <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist" aria-label="Detailing categories">
          {categories.map(cat => {
            const active = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal border ${active ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30' : 'bg-brand-charcoal-light text-neutral-300 border-neutral-600 hover:text-white hover:border-red-600'} `}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </Reveal>

      {/* Vehicle size selector */}
      <Reveal delay={0.15} skipOnRouteTransition>
        <div className="bg-brand-charcoal-light border border-neutral-600 rounded-xl p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Vehicle Size Adjustment</h2>
              <p className="text-neutral-300 text-sm">Select your vehicle size to preview adjusted starting prices.</p>
            </div>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Vehicle size">
              {sizeAdjustments.map(size => {
                const active = size.id === vehicleSize
                return (
                  <label key={size.id} className={`cursor-pointer select-none px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${active ? 'bg-red-600 text-white border-red-600 shadow shadow-red-600/30' : 'bg-neutral-800 text-neutral-300 border-neutral-600 hover:border-red-600 hover:text-white'}`}> 
                    <input
                      type="radio"
                      name="vehicleSize"
                      value={size.id}
                      className="sr-only"
                      checked={active}
                      onChange={() => setVehicleSize(size.id)}
                    />
                    {size.label}{size.add > 0 && <span className="ml-1 text-neutral-400">+${size.add}</span>}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Active category panel */}
      <div id={`panel-${currentCategory.id}`} role="tabpanel" aria-labelledby={currentCategory.id} className="mb-16">
        <Reveal skipOnRouteTransition>
          <p className="text-center text-neutral-300 mb-8 max-w-3xl mx-auto">{currentCategory.blurb}</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {currentCategory.packages.map((pkg, i) => {
            const adjusted = pkg.basePrice + sizeAdd
            const accent = pkg.highlight ? 'border-red-600 shadow-red-600/20' : 'border-neutral-600'
            const metalClass = pkg.id === 'silver' ? 'metal-base metal-silver' : pkg.id === 'gold' ? 'metal-base metal-gold' : pkg.id === 'platinum' ? 'metal-base metal-platinum' : ''
            return (
              <Reveal key={pkg.id} delay={i * 0.05} skipOnRouteTransition className={`relative ${metalClass || ''} bg-brand-charcoal-light p-6 rounded-xl border ${accent} shadow-lg hover:shadow-xl flex flex-col`}> 
                {pkg.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs tracking-wide px-3 py-1 rounded-full shadow">Popular</span>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-1">{pkg.name}</h3>
                  {pkg.tagline && <p className="text-red-600 text-sm font-medium italic mb-2">{pkg.tagline}</p>}
                  {pkg.description && <p className="text-neutral-300 text-sm leading-relaxed">{pkg.description}</p>}
                </div>
                <ul className="text-neutral-300 text-sm space-y-2 mb-6 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start"><span className="text-red-600 mr-2">•</span><span>{f}</span></li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-neutral-700 flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">
                    <span className="text-red-600">${adjusted}</span><span className="text-neutral-400 text-base align-top ml-1">+*</span>
                  </span>
                  <a href="/booking" className="text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal shadow">Book</a>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </>
  )
}
