import type { Metadata } from 'next'
import BookingClient from './booking-client'

export const metadata: Metadata = {
  title: 'Book a detail',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    url: '/booking',
  },
}

export default function BookingPage() {
  return <BookingClient />
}
