'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { PageHeader } from '@/components/ui/page-header'
import { FaqList } from '@/components/ui/faq-list'
import { parseBookingParams } from '@/lib/booking-params'
import type { BookingSelection } from '@/components/booking/booking-data'
import { BookingWizard } from '@/components/booking/booking-wizard'
import {
  DEFAULT_BOOKING_SETTINGS,
  hasBookingDeposit,
  normalizeBookingSettings,
  type BookingSettings,
} from '@/lib/booking-settings'

function getBookingFaqs(depositAmount: number) {
  const cancellationAnswer = hasBookingDeposit(depositAmount)
    ? 'Reschedule or cancel at least 24 hours ahead and your deposit is refunded in full. Inside 24 hours, the deposit is kept.'
    : 'Reschedule or cancel at least 24 hours ahead. If something comes up later than that, call or text as soon as you can.'

  return [
    {
      q: 'How far in advance should I book?',
      a: 'Two days ahead gets you the widest choice of times. Same-day slots open up sometimes, so check the calendar.',
    },
    {
      q: 'What if I need to reschedule or cancel?',
      a: cancellationAnswer,
    },
    {
      q: 'Where is the detail done?',
      a: 'In a private garage in the Boise area. We don’t publish the address. It comes in your confirmation email once you book.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'Credit and debit cards, cash, Apple Pay, Google Pay, and Venmo.',
    },
  ]
}

export default function BookingClient() {
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS)
  const [initialSelection, setInitialSelection] = useState<BookingSelection | null>(null)
  const [initialPackageSelection, setInitialPackageSelection] = useState<{
    categoryId: string
    packageId: string
  } | null>(null)
  const [paramsLoaded, setParamsLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadBookingSettings() {
      try {
        const response = await fetch('/api/settings/booking', {
          cache: 'no-store',
        })
        if (!response.ok) return

        const settings = normalizeBookingSettings(await response.json())
        if (isMounted) setBookingSettings(settings)
      } catch (error) {
        console.warn('[Booking] Unable to load booking settings', error)
      }
    }

    loadBookingSettings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const parsedSelection = parseBookingParams(searchParams)
    if (parsedSelection) setInitialSelection(parsedSelection)

    const category = searchParams.get('category')
    const tier = searchParams.get('tier')
    if (category && tier) {
      setInitialPackageSelection({ categoryId: category, packageId: tier })
    }
    setParamsLoaded(true)
  }, [])

  const bookingFaqs = getBookingFaqs(bookingSettings.depositAmount)
  const bookingFaqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: bookingFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <main id="main-content" className="min-h-screen">
      <Script
        id="booking-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookingFaqStructuredData) }}
      />

      <PageHeader
        title="Book your detail"
        lede="Choose a package, add extras, and pick a time. The garage address comes with your confirmation."
      />

      <section id="design-your-detail" className="scroll-mt-[calc(var(--nav-total-height)+1rem)] border-t border-white/[0.07] py-10 lg:py-16">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          {paramsLoaded ? (
            <BookingWizard
              initialSelection={initialSelection}
              initialPackageSelection={initialPackageSelection}
              depositAmount={bookingSettings.depositAmount}
            />
          ) : (
            <div className="min-h-[560px]" aria-hidden="true" />
          )}
        </div>
      </section>

      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <h2 className="lg:col-span-4 font-display text-3xl sm:text-4xl text-white uppercase">Before you book</h2>
          <div className="lg:col-span-8">
            <FaqList faqs={bookingFaqs} />
          </div>
        </div>
      </section>
    </main>
  )
}
