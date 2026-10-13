/**
 * The booking wizard's view of a priced selection. Prices and options come
 * from the published service catalog (see lib/content/catalog.ts); this is
 * what the summary, Cal.com notes, and confirmation display.
 *
 * @module components/booking/booking-data
 */
import type { CatalogQuote, CatalogSelection } from '@/lib/content/catalog'
import type { Duration } from '@/lib/content/types'

export type BookingSelection = CatalogSelection & {
  /** "Platinum Package (Exterior + Interior)" */
  packageName: string
  sizeLabel: string
  addonNames: string[]
  coatingName?: string
  correctionName?: string
  totalCents: number
  duration: Duration
  /** Cal.com `username/event-slug` for the chosen category. */
  calLink: string
}

export function toBookingSelection(quote: CatalogQuote, totalCents = quote.totalCents): BookingSelection {
  return {
    ...quote.selection,
    packageName: `${quote.pkg.name} (${quote.category.label})`,
    sizeLabel: quote.size.label,
    addonNames: quote.addons.map((addon) => addon.name),
    coatingName: quote.coating?.name,
    correctionName: quote.correction?.name,
    totalCents,
    duration: quote.duration,
    calLink: quote.calLink,
  }
}
