import type { CatalogSelection } from '@/lib/content/catalog'
import type { CatalogContent } from '@/lib/content/types'

export type InitialBookingSelection = Partial<CatalogSelection>

function listParam(value: string | null): string[] {
  return (value ?? '').split(',').map((entry) => entry.trim()).filter(Boolean)
}

/**
 * Read a deep link into the booking wizard. IDs are preferred; older links
 * that named add-ons and ceramic services are matched by name.
 */
export function parseBookingParams(searchParams: URLSearchParams, catalog: CatalogContent): InitialBookingSelection | null {
  const categoryId = searchParams.get('category') ?? undefined
  const packageId = searchParams.get('tier') ?? searchParams.get('package') ?? undefined
  if (!categoryId && !packageId && !searchParams.has('size')) return null

  const byIdOrName = <T extends { id: string; name: string }>(items: T[], value: string | null | undefined) =>
    value ? items.find((item) => item.id === value || item.name === value)?.id : undefined

  return {
    categoryId,
    packageId,
    vehicleSizeId: searchParams.get('size') ?? undefined,
    addonIds: listParam(searchParams.get('addons'))
      .map((value) => byIdOrName(catalog.addons, value))
      .filter((id): id is string => Boolean(id)),
    coatingId: byIdOrName(catalog.ceramicServices, searchParams.get('coating') ?? searchParams.get('ceramic')),
    correctionId: byIdOrName(catalog.ceramicServices, searchParams.get('correction') ?? searchParams.get('paintCorrection')),
  }
}

/** Build URL search params that deep-link a selection into the booking page. */
export function buildBookingParams(selection: InitialBookingSelection): URLSearchParams {
  const params = new URLSearchParams()
  if (selection.categoryId) params.set('category', selection.categoryId)
  if (selection.packageId) params.set('tier', selection.packageId)
  if (selection.vehicleSizeId) params.set('size', selection.vehicleSizeId)
  if (selection.addonIds?.length) params.set('addons', selection.addonIds.join(','))
  if (selection.coatingId) params.set('coating', selection.coatingId)
  if (selection.correctionId) params.set('correction', selection.correctionId)
  return params
}
