/**
 * Pure pricing calculation utilities — no React dependency.
 *
 * @module components/booking/pricing-utils
 */

import type { Package, SizeAdjustment, Addon, CeramicService } from './booking-data'
import { sizeAdjustments, addons as allAddons, ceramicServices } from './booking-data'

export interface PricingBreakdown {
  packagePrice: number
  sizeAdd: number
  addonsTotal: number
  ceramicTotal: number
  grandTotal: number
}

/**
 * Calculate the full pricing breakdown given current selections.
 */
export function calculatePricing(opts: {
  selectedPackage: Package | null
  vehicleSize: string
  selectedAddons: Set<string>
  ceramicCoatingSelected: boolean
  selectedPaintCorrection: string | null
  sizeAdjustmentsData?: SizeAdjustment[]
  addonsData?: Addon[]
  ceramicServicesData?: CeramicService[]
}): PricingBreakdown {
  const sizes = opts.sizeAdjustmentsData ?? sizeAdjustments
  const addonList = opts.addonsData ?? allAddons
  const ceramicList = opts.ceramicServicesData ?? ceramicServices

  const sizeData = sizes.find((s) => s.id === opts.vehicleSize)
  const sizeAdd = sizeData?.add ?? 0
  const packagePrice = opts.selectedPackage ? opts.selectedPackage.basePrice + sizeAdd : 0

  // Add-ons total
  let addonsTotal = 0
  opts.selectedAddons.forEach((addonName) => {
    const addon = addonList.find((a) => a.name === addonName)
    if (addon) addonsTotal += addon.price
  })

  // Ceramic / paint correction total
  const upgradePrice = getPaintCorrectionUpgradePrice(ceramicList)
  let ceramicTotal = 0

  if (opts.ceramicCoatingSelected) {
    const coating = ceramicList.find((s) => s.id === 'graphene-coating')
    if (coating) ceramicTotal += coating.price
    if (opts.selectedPaintCorrection === 'paint-correction-2-upgrade') {
      ceramicTotal += upgradePrice
    }
  } else {
    if (
      opts.selectedPaintCorrection &&
      opts.selectedPaintCorrection !== 'paint-correction-2-upgrade'
    ) {
      const correction = ceramicList.find((s) => s.id === opts.selectedPaintCorrection)
      if (correction) ceramicTotal += correction.price
    }
  }

  return {
    packagePrice,
    sizeAdd,
    addonsTotal,
    ceramicTotal,
    grandTotal: packagePrice + addonsTotal + ceramicTotal,
  }
}

/**
 * Get the upgrade price delta from 1-step to 2-step paint correction.
 */
export function getPaintCorrectionUpgradePrice(
  ceramicList: CeramicService[] = ceramicServices
): number {
  const step1 = ceramicList.find((s) => s.id === 'paint-correction-1')
  const step2 = ceramicList.find((s) => s.id === 'paint-correction-2')
  if (step1 && step2) return step2.price - step1.price
  return 200 // fallback
}
