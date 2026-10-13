/**
 * Pure helpers over the published service catalog. Prices stay in integer
 * cents until display. calculateQuote mirrors ContentService.quote on the
 * backend so the booking total shown before a quote request matches it.
 * content.test.mjs compares both implementations over selections and edits.
 */
import type {
  CatalogAddon,
  CatalogCategory,
  CatalogContent,
  CatalogPackage,
  CeramicService,
  Duration,
  VehicleSize,
} from './types'

export type CatalogSelection = {
  categoryId: string
  packageId: string
  vehicleSizeId: string
  addonIds: string[]
  coatingId?: string
  correctionId?: string
}

export type QuoteLineItem = { id: string; description: string; amountCents: number }

export type CatalogQuote = {
  selection: CatalogSelection
  category: CatalogCategory
  pkg: CatalogPackage
  size: VehicleSize
  addons: CatalogAddon[]
  coating?: CeramicService
  correction?: CeramicService
  lineItems: QuoteLineItem[]
  totalCents: number
  duration: Duration
  calLink: string
}

export function formatCents(cents: number): string {
  const dollars = cents / 100
  return Number.isInteger(dollars)
    ? `$${dollars.toLocaleString('en-US')}`
    : `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/** Enabled categories that still have at least one enabled package. */
export function publicCategories(catalog: CatalogContent): CatalogCategory[] {
  return catalog.categories
    .filter((category) => category.enabled)
    .map((category) => ({ ...category, packages: category.packages.filter((pkg) => pkg.enabled) }))
    .filter((category) => category.packages.length > 0)
}

export function publicVehicleSizes(catalog: CatalogContent): VehicleSize[] {
  return catalog.vehicleSizes.filter((size) => size.enabled)
}

export function publicAddons(catalog: CatalogContent): CatalogAddon[] {
  return catalog.addons.filter((addon) => addon.enabled)
}

export function publicCeramicServices(catalog: CatalogContent, kind?: CeramicService['kind']): CeramicService[] {
  return catalog.ceramicServices.filter((service) => service.enabled && (!kind || service.kind === kind))
}

export function defaultVehicleSize(catalog: CatalogContent): VehicleSize | undefined {
  const sizes = publicVehicleSizes(catalog)
  return sizes.find((size) => size.surchargeCents === 0) ?? sizes[0]
}

/** "$25 to $55", the spread of vehicle size surcharges above the base price. */
export function surchargeRange(catalog: CatalogContent): string {
  const surcharges = publicVehicleSizes(catalog)
    .map((size) => size.surchargeCents)
    .filter((cents) => cents > 0)
  if (surcharges.length === 0) return formatCents(0)
  const low = Math.min(...surcharges)
  const high = Math.max(...surcharges)
  return low === high ? formatCents(low) : `${formatCents(low)} to ${formatCents(high)}`
}

export function categoryFromPriceCents(catalog: CatalogContent, categoryId: string): number | null {
  const category = publicCategories(catalog).find((item) => item.id === categoryId)
  if (!category) return null
  return Math.min(...category.packages.map((pkg) => pkg.basePriceCents))
}

export function ceramicEligiblePackages(catalog: CatalogContent): (CatalogPackage & { category: CatalogCategory })[] {
  return publicCategories(catalog).flatMap((category) =>
    category.packages.filter((pkg) => pkg.ceramicEligible).map((pkg) => ({ ...pkg, category })),
  )
}

/** Lowest bookable total for a ceramic service, including the cheapest eligible package. */
export function serviceFromPriceCents(
  catalog: CatalogContent,
  serviceId: string,
  includeEligiblePackage: boolean,
): number | null {
  const service = publicCeramicServices(catalog).find((item) => item.id === serviceId)
  if (!service) return null
  if (!includeEligiblePackage) return service.priceCents
  const packages = ceramicEligiblePackages(catalog)
  if (packages.length === 0) return null
  return service.priceCents + Math.min(...packages.map((pkg) => pkg.basePriceCents))
}

export function includedCorrection(catalog: CatalogContent, coating: CeramicService | undefined): CeramicService | undefined {
  if (!coating?.includedCorrectionId) return undefined
  return catalog.ceramicServices.find((service) => service.id === coating.includedCorrectionId)
}

/**
 * Corrections a customer can pick alongside the chosen coating (or alone),
 * with the amount actually charged. A coating's included correction is
 * already in its price, so only upgrades are offered and they cost the
 * difference.
 */
export function correctionOptions(
  catalog: CatalogContent,
  coating: CeramicService | undefined,
): { service: CeramicService; amountCents: number }[] {
  const included = includedCorrection(catalog, coating)
  return publicCeramicServices(catalog, 'correction')
    .filter((service) => !included || (service.id !== included.id && service.priceCents >= included.priceCents))
    .map((service) => ({ service, amountCents: service.priceCents - (included?.priceCents ?? 0) }))
}

export function calculateQuote(catalog: CatalogContent, selection: CatalogSelection): CatalogQuote | null {
  const category = publicCategories(catalog).find((item) => item.id === selection.categoryId)
  const pkg = category?.packages.find((item) => item.id === selection.packageId)
  const size = publicVehicleSizes(catalog).find((item) => item.id === selection.vehicleSizeId)
  if (!category || !pkg || !size) return null

  const lineItems: QuoteLineItem[] = [
    { id: `${category.id}/${pkg.id}`, description: `${pkg.name} (${category.label})`, amountCents: pkg.basePriceCents },
    { id: size.id, description: size.label, amountCents: size.surchargeCents },
  ]

  const addons: CatalogAddon[] = []
  for (const id of selection.addonIds) {
    const addon = publicAddons(catalog).find((item) => item.id === id)
    if (!addon) return null
    addons.push(addon)
    lineItems.push({ id: addon.id, description: addon.name, amountCents: addon.priceCents })
  }

  const findService = (id: string | undefined, kind: CeramicService['kind']) =>
    id ? publicCeramicServices(catalog, kind).find((item) => item.id === id) : undefined
  const coating = findService(selection.coatingId, 'coating')
  const correction = findService(selection.correctionId, 'correction')
  if ((selection.coatingId && !coating) || (selection.correctionId && !correction)) return null
  if ((coating || correction) && !pkg.ceramicEligible) return null

  let { minMinutes, maxMinutes } = pkg.duration
  if (coating) {
    lineItems.push({ id: coating.id, description: coating.name, amountCents: coating.priceCents })
    minMinutes += coating.duration.minMinutes
    maxMinutes += coating.duration.maxMinutes
  }
  if (correction) {
    const included = includedCorrection(catalog, coating)
    if (included && correction.priceCents < included.priceCents) return null
    lineItems.push({
      id: correction.id,
      description: correction.name,
      amountCents: correction.priceCents - (included?.priceCents ?? 0),
    })
    if (correction.id !== included?.id) {
      minMinutes += correction.duration.minMinutes
      maxMinutes += correction.duration.maxMinutes
    }
  }

  return {
    selection,
    category,
    pkg,
    size,
    addons,
    coating,
    correction,
    lineItems,
    totalCents: lineItems.reduce((total, line) => total + line.amountCents, 0),
    duration: { minMinutes, maxMinutes },
    calLink: `${catalog.calUsername}/${category.calEventSlug}`,
  }
}

/**
 * Keep a partial selection bookable after the catalog or package changes:
 * unknown add-ons are dropped, ceramic choices need an eligible package, and
 * a correction must be one offered with the chosen coating.
 */
export function normalizeSelection(catalog: CatalogContent, selection: CatalogSelection): CatalogSelection {
  const pkg = publicCategories(catalog)
    .find((category) => category.id === selection.categoryId)
    ?.packages.find((item) => item.id === selection.packageId)
  const addonIds = selection.addonIds.filter((id) => publicAddons(catalog).some((addon) => addon.id === id))
  if (!pkg?.ceramicEligible) return { ...selection, addonIds, coatingId: undefined, correctionId: undefined }

  const coating = publicCeramicServices(catalog, 'coating').find((item) => item.id === selection.coatingId)
  const correctionId = correctionOptions(catalog, coating).some((option) => option.service.id === selection.correctionId)
    ? selection.correctionId
    : undefined
  return { ...selection, addonIds, coatingId: coating?.id, correctionId }
}

function formatHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10
  return `${hours}`
}

/** "2–3 hours", or minutes for short jobs. */
export function formatDuration(duration: Duration): string {
  const { minMinutes, maxMinutes } = duration
  if (maxMinutes < 60) {
    return minMinutes === maxMinutes ? `${minMinutes} minutes` : `${minMinutes}–${maxMinutes} minutes`
  }
  if (minMinutes === maxMinutes) {
    return `${formatHours(minMinutes)} ${minMinutes === 60 ? 'hour' : 'hours'}`
  }
  return `${formatHours(minMinutes)}–${formatHours(maxMinutes)} hours`
}
