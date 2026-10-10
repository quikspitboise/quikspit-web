import type { BookingSelection } from '@/components/booking/booking-data'

export function parseBookingParams(searchParams: URLSearchParams): BookingSelection | null {
  const category = searchParams.get('category')
  const tier = searchParams.get('tier')
  const total = searchParams.get('total')

  if (!category || !tier || !total) return null

  return {
    category,
    tier,
    size: searchParams.get('size') || 'car',
    sizeLabel: searchParams.get('sizeLabel') || undefined,
    addons: searchParams.get('addons') || '',
    ceramic: searchParams.get('ceramic') || undefined,
    paintCorrection: searchParams.get('paintCorrection') || undefined,
    total: parseInt(total, 10) || 0,
    packageName: searchParams.get('packageName') || undefined,
  }
}

/** Build URL search params that deep-link a selection into the booking page. */
export function buildBookingParams(selection: BookingSelection): URLSearchParams {
  const params = new URLSearchParams()

  params.set('category', selection.category)
  params.set('tier', selection.tier)
  params.set('size', selection.size)
  if (selection.sizeLabel) params.set('sizeLabel', selection.sizeLabel)
  if (selection.addons) params.set('addons', selection.addons)
  if (selection.ceramic) params.set('ceramic', selection.ceramic)
  if (selection.paintCorrection) params.set('paintCorrection', selection.paintCorrection)
  params.set('total', selection.total.toString())
  if (selection.packageName) params.set('packageName', selection.packageName)

  return params
}
