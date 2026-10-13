'use client'

import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { BOOKING_COPY_DEFAULTS, visitorCopy } from '@/components/content/visitor-copy'

const BookingCopyContext = createContext<Record<string, unknown> | undefined>(undefined)

export function BookingCopyProvider({ copy, children }: { copy?: Record<string, unknown>; children: ReactNode }) {
  return <BookingCopyContext.Provider value={copy}>{children}</BookingCopyContext.Provider>
}

export function useBookingCopy() {
  const copy = useContext(BookingCopyContext)
  return useCallback((key: keyof typeof BOOKING_COPY_DEFAULTS, values?: Record<string, string | number>) =>
    visitorCopy(copy, BOOKING_COPY_DEFAULTS, key, values), [copy])
}
