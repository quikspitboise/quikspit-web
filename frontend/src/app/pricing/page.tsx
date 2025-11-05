import { Reveal } from '@/components/reveal'
import { PricingInteractive } from '@/components/pricing-interactive'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing & Packages',
  description: 'Explore our mobile detailing packages - Silver, Gold, and Platinum options. From essential detailing to premium protection with ceramic coating. Transparent pricing for cars, trucks, and SUVs.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing & Packages - QuikSpit Auto Detailing',
    description: 'Choose from our Silver, Gold, and Platinum detailing packages. Professional mobile car care with transparent pricing.',
    url: '/pricing',
  },
}

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
    basePrice: 125,
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
    basePrice: 140,
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
    basePrice: 170,
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
    basePrice: 100,
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
    basePrice: 125,
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
    basePrice: 150,
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
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
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

          {/* Interactive pricing section */}
          <PricingInteractive categories={categories} sizeAdjustments={sizeAdjustments} />

          {/* Ceramic Coating & Polish */}
          <div className="grid lg:grid-cols-3 gap-10 mb-16">
            <Reveal skipOnRouteTransition className="lg:col-span-2 space-y-8">
              <div className="bg-brand-charcoal-light p-8 rounded-xl border border-neutral-600">
                <h2 className="text-2xl font-bold text-white mb-6">Ceramic Coating & Polish</h2>
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
                  <p className="text-neutral-300 text-sm">
                    <span className="font-semibold text-red-600">Note:</span> All ceramic coating and paint correction services require a full exterior detail and paint decontamination. This service starts at $150.
                  </p>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">5-7 Year Graphene Ceramic Coating</h3>
                      <span className="text-2xl font-bold text-red-600">$400</span>
                    </div>
                    <p className="text-neutral-300 text-sm">A deep, mirror-like shine that lasts years, not weeks.</p>
                    <p className="text-neutral-400 text-xs mt-2 italic">
                      While not required, a 1-step paint correction is strongly recommended for the best results of a ceramic coating.
                    </p>
                  </div>
                  <div className="border-t border-neutral-700 pt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">1-Step Paint Correction & Polish</h3>
                      <span className="text-2xl font-bold text-red-600">$450</span>
                    </div>
                    <p className="text-neutral-300 text-sm">Years of swirls & scratches erased in a single session (≈65% correction or more).</p>
                  </div>
                  <div className="border-t border-neutral-700 pt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">2-Step Paint Correction</h3>
                      <span className="text-2xl font-bold text-red-600">$650+</span>
                    </div>
                    <p className="text-neutral-300 text-sm">Maximum defect removal with multi-stage compounding and polishing for a flawless finish.</p>
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
