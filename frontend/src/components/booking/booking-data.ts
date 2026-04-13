/**
 * Shared pricing data, types, and constants for the booking wizard.
 * Single source of truth — used by both /pricing and /booking.
 *
 * @module components/booking/booking-data
 */

// Re-export BookingSelection from cal-embed (canonical location)
export type { BookingSelection } from '@/components/cal-embed'

// ============================================================================
// TYPES
// ============================================================================

export type Package = {
  id: string
  name: string
  tagline?: string
  description?: string
  basePrice: number
  features: string[]
  highlight?: boolean
  bestValue?: boolean
  categoryId: string
  categoryLabel: string
}

export type PackageCategory = {
  id: string
  label: string
  blurb: string
  packages: Omit<Package, 'categoryId' | 'categoryLabel'>[]
}

export type SizeAdjustment = {
  id: string
  label: string
  add: number
}

export type Addon = {
  name: string
  price: number
  description: string
}

export type CeramicService = {
  id: string
  name: string
  price: number
  description: string
  includedValue?: string
  note?: string
}

// ============================================================================
// DURATION ESTIMATES (industry defaults — adjust as needed)
// ============================================================================

/** Duration ranges in hours keyed by `${categoryId}-${tierId}` */
export const DURATION_ESTIMATES: Record<string, [number, number]> = {
  'combo-silver': [2, 3],
  'combo-gold': [2.5, 3.5],
  'combo-platinum': [3, 4],
  'interior-silver': [1, 1.5],
  'interior-gold': [1.5, 2],
  'interior-platinum': [2, 2.5],
  'exterior-silver': [1, 1.5],
  'exterior-gold': [1.5, 2],
  'exterior-platinum': [2, 2.5],
}

/** Additional hours added when ceramic coating is selected */
export const CERAMIC_DURATION_ADD: [number, number] = [3, 5]

/** Additional hours added for standalone paint correction (no ceramic) */
export const PAINT_CORRECTION_DURATION_ADD: [number, number] = [2, 4]

/**
 * Get a formatted duration string like "2–3 hours"
 */
export function getDurationEstimate(
  categoryId: string | undefined,
  tierId: string | undefined,
  hasCeramic: boolean,
  hasPaintCorrection: boolean
): string | null {
  if (!categoryId || !tierId) return null
  const base = DURATION_ESTIMATES[`${categoryId}-${tierId}`]
  if (!base) return null

  let [low, high] = base
  if (hasCeramic) {
    low += CERAMIC_DURATION_ADD[0]
    high += CERAMIC_DURATION_ADD[1]
  } else if (hasPaintCorrection) {
    low += PAINT_CORRECTION_DURATION_ADD[0]
    high += PAINT_CORRECTION_DURATION_ADD[1]
  }

  const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : `${n}`)
  return `${fmt(low)}–${fmt(high)} hours`
}

// ============================================================================
// PACKAGE DATA
// ============================================================================

export const packageCategories: PackageCategory[] = [
  {
    id: 'combo',
    label: 'Exterior + Interior',
    blurb: 'Complete inside & out transformations for total vehicle revival.',
    packages: [
      {
        id: 'silver',
        name: 'Silver Package',
        tagline: 'The Essentials',
        description: 'A sleek entry level option that still feels exclusive.',
        basePrice: 200,
        features: [
          'Full interior vacuum including trunk',
          'Scrub/Wipe all interior surfaces including door jambs',
          'Stain spot treatment',
          'Streak-free glass clean',
          'Professional hand wash of all exterior surfaces',
          'Deep clean rims and tires',
          'Tire shine applied',
          '3 month ceramic sealant applied',
        ],
      },
      {
        id: 'gold',
        name: 'Gold Package',
        tagline: 'The Prestige Clean',
        description: 'Mid-tier with enhanced services and deeper care.',
        basePrice: 240,
        highlight: true,
        features: [
          'Includes everything in Silver Package, plus:',
          'Shampoo of all seats and carpets including trunk',
          'Conditioning of dashboard, trim, and floor mats',
          'Headliner spot treatment',
          'Revive faded exterior plastics',
        ],
      },
      {
        id: 'platinum',
        name: 'Platinum Package',
        tagline: 'Executive Treatment',
        description: 'For those who want it all, and then some.',
        basePrice: 300,
        bestValue: true,
        features: [
          'Includes everything in Gold Package, plus:',
          'Enzyme odor eliminator',
          'Premium leather conditioning',
          'Paint decontamination',
          'Paint enhancement applied',
        ],
      },
    ],
  },
  {
    id: 'interior',
    label: 'Interior Only',
    blurb: 'Targeted interior care ranging from reset to showroom.',
    packages: [
      {
        id: 'silver',
        name: 'Basic Interior',
        tagline: 'The Essentials Reset',
        description: 'A simple, but effective reset.',
        basePrice: 125,
        features: [
          'Full interior vacuum including trunk',
          'Scrub/wipe down all surfaces including door jambs',
          'Streak-free glass clean',
          'Stain spot treatment',
        ],
      },
      {
        id: 'gold',
        name: 'Value Interior',
        tagline: 'Refined & Restored',
        description: 'Added shampoo & conditioning for a deeper clean.',
        basePrice: 140,
        highlight: true,
        features: [
          'Everything in Basic Interior, plus:',
          'Full interior shampoo including trunk',
          'Dashboard, trim, and floor mat conditioning',
          'Headliner spot clean',
        ],
      },
      {
        id: 'platinum',
        name: 'Prestige Interior',
        tagline: 'Showroom Ready',
        description: 'The ultimate interior transformation.',
        basePrice: 170,
        features: [
          'Everything in Value Interior, plus:',
          'Enzyme odor eliminator',
          'Premium leather conditioning',
        ],
      },
    ],
  },
  {
    id: 'exterior',
    label: 'Exterior Only',
    blurb: 'Exterior focused shine, protection & curb appeal.',
    packages: [
      {
        id: 'silver',
        name: 'Basic Exterior',
        tagline: 'Fresh & Clean',
        description: 'Entry-level but sharp and fresh.',
        basePrice: 100,
        features: [
          'Professional hand wash/dry',
          'Deep clean rims & tires',
          '3 month ceramic sealant',
          'Tire shine applied',
        ],
      },
      {
        id: 'gold',
        name: 'Value Exterior',
        tagline: 'Head-Turning Refresh',
        description: 'Adds enhancement & plastics revival.',
        basePrice: 125,
        highlight: true,
        features: [
          'Everything in Basic Exterior, plus:',
          'Paint enhancement applied',
          'Revive faded exterior plastics',
        ],
      },
      {
        id: 'platinum',
        name: 'Prestige Exterior',
        tagline: 'Show-Car Status',
        description: 'Maximum exterior pop & protection.',
        basePrice: 150,
        features: [
          'Everything in Value Exterior, plus:',
          'Paint decontamination',
          '6 month ceramic sealant applied',
        ],
      },
    ],
  },
]

export const sizeAdjustments: SizeAdjustment[] = [
  { id: 'car', label: 'Car / Sedan', add: 0 },
  { id: 'suv', label: 'Small / Midsize SUV', add: 25 },
  { id: 'large-suv', label: 'Large SUV (3rd row)', add: 40 },
  { id: 'truck', label: 'Truck / Van', add: 55 },
]

export const addons: Addon[] = [
  { name: 'Headlight Restoration', price: 65, description: 'Crystal clear headlights' },
  { name: 'Bio Clean', price: 60, description: 'Cleaning any bodily fluids' },
  { name: 'Engine Bay Cleaning', price: 50, description: 'Spotless engine compartment' },
  { name: 'Pet Hair Removal', price: 35, description: 'Deep extraction of embedded pet hair' },
  { name: 'Water Spot Removal', price: 25, description: 'Remove stubborn water spots from paint' },
]

export const ceramicServices: CeramicService[] = [
  {
    id: 'graphene-coating',
    name: '5-7 Year Graphene Ceramic Coating',
    price: 850,
    description: 'A deep, mirror-like shine that lasts years, not weeks.',
    includedValue: 'Includes 1-step paint correction for optimal results—a $450 value built into this package!',
    note: 'Want even more perfection? Upgrade to 2-step paint correction for maximum defect removal.',
  },
  {
    id: 'paint-correction-1',
    name: '1-Step Paint Correction & Polish',
    price: 450,
    description: 'Years of swirls & scratches erased in a single session (≈65% correction or more).',
  },
  {
    id: 'paint-correction-2',
    name: '2-Step Paint Correction',
    price: 650,
    description: 'Maximum defect removal with multi-stage compounding and polishing for a flawless finish.',
  },
]

// Flattened package list with category metadata
export const allPackagesFlat: Package[] = packageCategories.flatMap((cat) =>
  cat.packages.map((pkg) => ({
    ...pkg,
    categoryId: cat.id,
    categoryLabel: cat.label,
  }))
)

// ============================================================================
// HELPERS
// ============================================================================

/** Check if ceramic services are available for a given package */
export function isCeramicEligible(pkg: { id: string; categoryId: string } | null): boolean {
  if (!pkg) return false
  return (
    (pkg.id === 'platinum' && pkg.categoryId === 'combo') ||
    (pkg.id === 'platinum' && pkg.categoryId === 'exterior')
  )
}
