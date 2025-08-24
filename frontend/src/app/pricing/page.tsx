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
  includesFrom?: string // id of lower package whose content is included
}

type Category = {
  id: string
  label: string
  blurb: string
  packages: Package[]
}

const comboPackages: Package[] = [
  {
    id: 'silver',
    name: 'Silver Package',
    tagline: 'The Essentials',
    basePrice: 150,
    description: 'A sleek entry level option that still feels exclusive.',
    features: [
      'Full interior vacuum including trunk',
      'Scrub/Wipe all interior surfaces including door jambs',
      'Stain spot treatment',
      'Streak-free glass clean',
      'Professional hand wash of all exterior surfaces',
      'Deep clean rims and tires',
      'Tire shine applied',
      '3 month ceramic sealant applied'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Package',
    tagline: 'The Prestige Clean',
    basePrice: 190,
    description: 'Mid-tier with enhanced services and deeper care.',
    includesFrom: 'silver',
    features: [
      'Includes everything in Silver Package, plus:',
      'Shampoo of all seats and carpets including trunk',
      'Conditioning of dashboard, trim, and floor mats',
      'Headliner spot treatment',
      'Revive faded exterior plastics'
    ],
    highlight: true
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    tagline: 'Executive Treatment',
    basePrice: 250,
    description: 'For those who want it all, and then some.',
    includesFrom: 'gold',
    features: [
      'Includes everything in Gold Package, plus:',
      'Enzyme odor eliminator',
      'Premium leather conditioning',
      'Paint decontamination',
      'Paint enhancement applied'
    ]
  }
]

const interiorPackages: Package[] = [
  {
    id: 'int-basic',
    name: 'Basic Interior',
    tagline: 'The Essentials Reset',
    basePrice: 75,
    description: 'A simple, but effective reset.',
    features: [
      'Full interior vacuum including trunk',
      'Scrub/wipe down all surfaces including door jambs',
      'Streak-free glass clean',
      'Stain spot treatment'
    ]
  },
  {
    id: 'int-value',
    name: 'Value Interior',
    tagline: 'Refined & Restored',
    basePrice: 90,
    description: 'Added shampoo & conditioning for a deeper clean.',
    includesFrom: 'int-basic',
    features: [
      'Everything in Basic Interior, plus:',
      'Full interior shampoo including trunk',
      'Dashboard, trim, and floor mat conditioning',
      'Headliner spot clean'
    ],
    highlight: true
  },
  {
    id: 'int-prestige',
    name: 'Prestige Interior',
    tagline: 'Showroom Ready',
    basePrice: 120,
    description: 'The ultimate interior transformation.',
    includesFrom: 'int-value',
    features: [
      'Everything in Value Interior, plus:',
      'Enzyme odor eliminator',
      'Premium leather conditioning'
    ]
  }
]

const exteriorPackages: Package[] = [
  {
    id: 'ext-basic',
    name: 'Basic Exterior',
    tagline: 'Fresh & Clean',
    basePrice: 50,
    description: 'Entry-level but sharp and fresh.',
    features: [
      'Professional hand wash/dry',
      'Deep clean rims & tires',
      '3 month ceramic sealant',
      'Tire shine applied'
    ]
  },
  {
    id: 'ext-value',
    name: 'Value Exterior',
    tagline: 'Head-Turning Refresh',
    basePrice: 75,
    description: 'Adds enhancement & plastics revival.',
    includesFrom: 'ext-basic',
    features: [
      'Everything in Basic Exterior, plus:',
      'Paint enhancement applied',
      'Revive faded exterior plastics'
    ],
    highlight: true
  },
  {
    id: 'ext-prestige',
    name: 'Prestige Exterior',
    tagline: 'Show-Car Status',
    basePrice: 100,
    description: 'Maximum exterior pop & protection.',
    includesFrom: 'ext-value',
    features: [
      'Everything in Value Exterior, plus:',
      'Paint decontamination',
      '6 month ceramic sealant applied'
    ]
  }
]

const categories: Category[] = [
  {
    id: 'combo',
    label: 'Exterior + Interior',
    blurb: 'Complete inside & out transformations for total vehicle revival.',
    packages: comboPackages
  },
  {
    id: 'interior',
    label: 'Interior Only',
    blurb: 'Targeted interior care ranging from reset to showroom.',
    packages: interiorPackages
  },
  {
    id: 'exterior',
    label: 'Exterior Only',
    blurb: 'Exterior focused shine, protection & curb appeal.',
    packages: exteriorPackages
  }
]

const sizeAdjustments: { id: string; label: string; add: number }[] = [
  { id: 'car', label: 'Car / Sedan', add: 0 },
  { id: 'suv-mid', label: 'Small / Midsize SUV', add: 25 },
  { id: 'suv-large', label: 'Large SUV (3rd row)', add: 40 },
  { id: 'truck', label: 'Truck / Van', add: 55 }
]

export default function Pricing() {
  const [activeCategory, setActiveCategory] = useState<string>('combo')
  const [vehicleSize, setVehicleSize] = useState<string>('car')

  const sizeAdd = useMemo(() => sizeAdjustments.find(s => s.id === vehicleSize)?.add || 0, [vehicleSize])
  const currentCategory = useMemo(() => categories.find(c => c.id === activeCategory)!, [activeCategory])

  return (
    <main className="min-h-screen bg-brand-charcoal">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal skipOnRouteTransition>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Packages & <span className="text-red-600">Pricing</span>
              </h1>
            </Reveal>
            <Reveal delay={0.05} skipOnRouteTransition>
              <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
                Choose your focus area, adjust for vehicle size, and explore premium enhancements.
              </p>
            </Reveal>
          </div>

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
                  <p className="text-neutral-400 text-sm">Select your vehicle size to preview adjusted starting prices.</p>
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
                  <Reveal key={pkg.id} delay={i * 0.05} skipOnRouteTransition className={`relative ${metalClass || ''} bg-brand-charcoal-light p-6 rounded-xl border ${accent} shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col`}> 
                    {pkg.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs tracking-wide px-3 py-1 rounded-full shadow">Popular</span>
                    )}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-white mb-1">{pkg.name}</h3>
                      {pkg.tagline && <p className="text-red-600 text-sm font-medium italic mb-2">{pkg.tagline}</p>}
                      {pkg.description && <p className="text-neutral-400 text-sm leading-relaxed">{pkg.description}</p>}
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

          {/* Ceramic Coating & Polish */}
          <div className="grid lg:grid-cols-3 gap-10 mb-16">
            <Reveal skipOnRouteTransition className="lg:col-span-2 space-y-8">
              <div className="bg-brand-charcoal-light p-8 rounded-xl border border-neutral-600">
                <h2 className="text-2xl font-bold text-white mb-6">Ceramic Coating & Polish</h2>
                <div className="space-y-8">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">5-7 Year Graphene Ceramic Coating</h3>
                      <span className="text-2xl font-bold text-red-600">$400</span>
                    </div>
                    <p className="text-neutral-300 text-sm">A deep, mirror-like shine that lasts years, not weeks.</p>
                  </div>
                  <div className="border-t border-neutral-700 pt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">1-Step Paint Correction & Polish</h3>
                      <span className="text-2xl font-bold text-red-600">$450</span>
                    </div>
                    <p className="text-neutral-300 text-sm">Years of swirls & scratches erased in a single session (≈80% correction).</p>
                  </div>
                </div>
              </div>

              {/* Optional Add-ons */}
              <div className="bg-brand-charcoal-light p-8 rounded-xl border border-neutral-600">
                <h2 className="text-2xl font-bold text-white mb-6">Optional Add-ons</h2>
                <ul className="divide-y divide-neutral-700">
                  {[
                    ['Headlight Restoration', 60],
                    ['Bio clean (any bodily fluids)', 60],
                    ['Engine Bay Cleaning', 50],
                    ['Pet hair removal (auto if necessary)', 35],
                    ['Water spot removal', 25]
                  ].map(([name, price]) => (
                    <li key={name as string} className="flex items-center justify-between py-3 text-neutral-300 text-sm">
                      <span>{name}</span>
                      <span className="font-semibold text-red-600">${price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vehicle size note + complimentary */}
              <div className="bg-brand-charcoal-light p-6 rounded-xl border border-neutral-600 space-y-4">
                <p className="text-neutral-300 text-sm">All services come with a complimentary air freshener and microfiber cloth.</p>
                <p className="text-neutral-300 text-sm">All package pricing subject to change based on vehicle size & condition.</p>
                <div className="grid sm:grid-cols-3 gap-4 text-xs text-neutral-400">
                  <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700">
                    <p className="font-semibold text-white mb-1">Small / Midsize SUV</p>
                    <p>+ $25</p>
                  </div>
                  <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700">
                    <p className="font-semibold text-white mb-1">Large SUV (3rd Row)</p>
                    <p>+ $40</p>
                  </div>
                  <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700">
                    <p className="font-semibold text-white mb-1">Trucks / Vans</p>
                    <p>+ $55</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">* Adjusted starting price shown reflects selected vehicle size. Final quote provided after quick inspection.</p>
              </div>
            </Reveal>

            {/* Booking CTA */}
            <Reveal delay={0.1} skipOnRouteTransition className="bg-brand-charcoal-light p-8 rounded-xl border border-neutral-600 h-fit sticky top-6 self-start">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Book?</h2>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">Lock in your detailing appointment. Select the package that fits and we will confirm any adjustments for vehicle size & condition when we arrive.</p>
              <a href="/booking" className="block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal">Book Now</a>
              <div className="mt-8 text-xs text-neutral-400 space-y-2">
                <p>Need help choosing? Reach out via the contact page.</p>
                <a href="/contact" className="text-red-600 hover:underline">Contact Us</a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  )
}
