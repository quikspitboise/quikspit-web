'use client'

import { useEffect, useState } from 'react'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { BookingCopyProvider } from '@/components/booking/booking-copy'
import { parseBookingParams, type InitialBookingSelection } from '@/lib/booking-params'
import type { CatalogContent } from '@/lib/content/types'

export type BookingSectionProps = {
  catalog: CatalogContent
  catalogRevisionId: string | null
  depositAmount: number
  depositPolicy: string
  preview: boolean
  copy?: Record<string, unknown>
}

export function BookingSection(props: BookingSectionProps) {
  const [initialSelection, setInitialSelection] = useState<InitialBookingSelection | null | undefined>(undefined)

  // Deep links live in the query string, which a static page reads after hydration.
  useEffect(() => {
    setInitialSelection(parseBookingParams(new URLSearchParams(window.location.search), props.catalog))
  }, [props.catalog])

  if (initialSelection === undefined) {
    return <div className="min-h-[560px]" aria-hidden="true" />
  }
  return (
    <BookingCopyProvider copy={props.copy}>
      <BookingWizard {...props} initialSelection={initialSelection} />
    </BookingCopyProvider>
  )
}
