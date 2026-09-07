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
