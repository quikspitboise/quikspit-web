'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { parseBookingParams, type BookingSelection } from '@/components/cal-embed'
import { BookingWizard } from '@/components/booking/booking-wizard'
import {
  DEFAULT_BOOKING_SETTINGS,
  hasBookingDeposit,
  normalizeBookingSettings,
  type BookingSettings,
} from '@/lib/booking-settings'

/**
 * Toggle this to show/hide the hero section above the wizard.
 * Useful for A/B testing: set false to make the wizard immediately visible.
 */
const SHOW_HERO = true

const features = [
  { icon: '🕐', title: 'Flexible Scheduling', description: 'Book anytime that works for you' },
  { icon: '📍', title: 'Mobile Service', description: 'We come to your location' },
  { icon: '💳', title: 'Secure Payment', description: 'Safe, encrypted transactions' },
  { icon: '✨', title: 'Quality Guarantee', description: 'Satisfaction guaranteed' },
]

function getBookingFaqs(depositAmount: number) {
  const cancellationAnswer = hasBookingDeposit(depositAmount)
    ? 'You can reschedule or cancel your appointment for a full refund of your deposit with at least 24 hours notice. If you cancel or reschedule within 24 hours of your appointment, the deposit is non-refundable.'
    : 'You can reschedule or cancel your appointment with at least 24 hours notice. Contact us as soon as possible if your schedule changes.'

  return [
    {
      q: 'How far in advance should I book?',
      a: 'We recommend booking at least 48 hours in advance to secure your preferred time slot, though same-day availability may be possible.',
    },
    {
      q: 'What if I need to reschedule or cancel?',
      a: cancellationAnswer,
    },
    {
      q: 'Where do you provide service?',
      a: 'We serve the greater Boise area and surrounding communities. Contact us to confirm service in your location.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, debit cards, and digital payments including Apple Pay and Google Pay.',
    },
  ]
}

export default function Booking() {
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
    <main id="main-content" className="min-h-screen bg-transparent">
      <Script
        id="booking-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookingFaqStructuredData) }}
      />

      {/* Hero Section (toggleable for A/B testing) */}
      {SHOW_HERO && (
        <>
          <section className="relative py-20 lg:py-28 overflow-hidden">
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="max-w-4xl mx-auto text-center">
                <AnimatedHeadline
                  text="BOOK YOUR DETAIL"
                  as="h1"
                  className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
                  splitBy="word"
                />
                <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
                  Design your perfect detail package, pick your time, and we&apos;ll bring the showroom to you.
                </FadeHeadline>
                <MagneticButton href="#design-your-detail" variant="primary" size="lg">
                  Get Started
                </MagneticButton>
              </div>
            </div>
          </section>

          <SectionTransition variant="line" />
        </>
      )}

      {/* Booking Wizard */}
      <AnimatedSection id="design-your-detail" className="py-16 lg:py-24 scroll-mt-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Design & Book</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                DESIGN YOUR <span className="text-red-500">DETAIL</span>
              </FadeHeadline>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Build your package, add extras, and schedule — all in one place.
              </p>
            </div>

            {paramsLoaded && (
              <BookingWizard
                initialSelection={initialSelection}
                initialPackageSelection={initialPackageSelection}
                depositAmount={bookingSettings.depositAmount}
              />
            )}
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Features Grid */}
      <AnimatedSection className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {features.map((feature) => (
                <GlassCard key={feature.title} className="p-4 lg:p-5 text-center" hover>
                  <span className="text-2xl lg:text-3xl mb-2 lg:mb-3 block">{feature.icon}</span>
                  <h3 className="font-semibold text-white text-sm lg:text-base mb-1">{feature.title}</h3>
                  <p className="text-neutral-400 text-xs lg:text-sm">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* FAQ Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Questions?</span>
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide">
                BOOKING FAQ
              </FadeHeadline>
            </div>

            <div className="space-y-4">
              {bookingFaqs.map((faq) => (
                <GlassCard key={faq.q} className="p-5 lg:p-6">
                  <h3 className="font-semibold text-white mb-2 text-sm lg:text-base">{faq.q}</h3>
                  <p className="text-neutral-400 text-xs lg:text-sm">{faq.a}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
