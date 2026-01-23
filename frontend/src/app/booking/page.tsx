'use client'

import { useState, useCallback } from 'react'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { CalEmbed, ServiceSummary, getDepositAmount, type BookingSelection } from '@/components/cal-embed'
import { PricingCalculator } from '@/components/pricing-calculator'

// Package data (same as pricing page)
const packageCategories = [
  {
    id: 'combo',
    label: 'Exterior + Interior',
    packages: [
      { id: 'silver', name: 'Silver Package', tagline: 'The Essentials', basePrice: 200, features: [] },
      { id: 'gold', name: 'Gold Package', tagline: 'The Prestige Clean', basePrice: 240, highlight: true, features: [] },
      { id: 'platinum', name: 'Platinum Package', tagline: 'Executive Treatment', basePrice: 300, features: [] },
    ],
  },
  {
    id: 'interior',
    label: 'Interior Only',
    packages: [
      { id: 'silver', name: 'Basic Interior', tagline: 'The Essentials Reset', basePrice: 125, features: [] },
      { id: 'gold', name: 'Value Interior', tagline: 'Refined & Restored', basePrice: 140, highlight: true, features: [] },
      { id: 'platinum', name: 'Prestige Interior', tagline: 'Showroom Ready', basePrice: 170, features: [] },
    ],
  },
  {
    id: 'exterior',
    label: 'Exterior Only',
    packages: [
      { id: 'silver', name: 'Basic Exterior', tagline: 'Fresh & Clean', basePrice: 100, features: [] },
      { id: 'gold', name: 'Value Exterior', tagline: 'Head-Turning Refresh', basePrice: 125, highlight: true, features: [] },
      { id: 'platinum', name: 'Prestige Exterior', tagline: 'Show-Car Status', basePrice: 150, features: [] },
    ],
  },
]

const sizeAdjustments = [
  { id: 'car', label: 'Car / Sedan', add: 0 },
  { id: 'suv', label: 'Small / Midsize SUV', add: 25 },
  { id: 'large-suv', label: 'Large SUV (3rd row)', add: 40 },
  { id: 'truck', label: 'Truck / Van', add: 55 },
]

const addons = [
  { name: 'Headlight Restoration', price: 60, description: 'Crystal clear headlights' },
  { name: 'Bio Clean', price: 60, description: 'Cleaning any bodily fluids' },
  { name: 'Engine Bay Cleaning', price: 50, description: 'Spotless engine compartment' },
  { name: 'Pet Hair Removal', price: 35, description: 'Deep extraction of embedded pet hair' },
  { name: 'Water Spot Removal', price: 25, description: 'Remove stubborn water spots from paint' },
]

const ceramicServices = [
  { id: 'graphene-coating', name: '5-7 Year Graphene Ceramic Coating', price: 400, description: 'A deep, mirror-like shine that lasts years, not weeks.', note: 'While not required, a 1-step paint correction is strongly recommended for the best results of a ceramic coating.' },
  { id: 'paint-correction-1', name: '1-Step Paint Correction & Polish', price: 450, description: 'Years of swirls and scratches erased in a single session.' },
  { id: 'paint-correction-2', name: '2-Step Paint Correction', price: 650, description: 'Maximum defect removal with multi-stage compounding and polishing for a flawless finish.' },
]

// Flatten packages for the calculator with category info
const allPackagesFlat = packageCategories.flatMap((cat) =>
  cat.packages.map((pkg) => ({
    ...pkg,
    categoryId: cat.id,
    categoryLabel: cat.label,
  }))
)

const steps = [
  {
    number: '01',
    title: 'Design Your Detail',
    description: 'Choose your package, vehicle size, and any add-ons using our builder below.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Pick Your Time',
    description: 'Select a convenient date and time that works with your schedule.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Confirm & Pay',
    description: 'Review your booking details and secure your appointment with a small deposit.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'We Come to You',
    description: 'Sit back and relax while we bring professional detailing to your location.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const features = [
  { icon: '🕐', title: 'Flexible Scheduling', description: 'Book anytime that works for you' },
  { icon: '📍', title: 'Mobile Service', description: 'We come to your location' },
  { icon: '💳', title: 'Secure Payment', description: 'Safe, encrypted transactions' },
  { icon: '✨', title: 'Quality Guarantee', description: 'Satisfaction guaranteed' },
]

export default function Booking() {
  // Lifted state: the selection from the calculator
  const [selection, setSelection] = useState<BookingSelection | null>(null)

  // Called when user completes the "Design Your Detail" calculator
  const handleDesignComplete = useCallback((newSelection: BookingSelection) => {
    setSelection(newSelection)
    // Scroll to booking widget after a short delay to allow state update
    setTimeout(() => {
      const element = document.getElementById('booking-widget')
      if (element) {
        const rect = element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetY = rect.top + scrollTop - 24
        window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    }, 100)
  }, [])

  // Scroll to design section
  const scrollToDesign = useCallback(() => {
    const element = document.getElementById('design-your-detail')
    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const targetY = rect.top + scrollTop - 24
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }, [])

  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background accents */}
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
              Design Your Detail
            </MagneticButton>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* How It Works */}
      <AnimatedSection className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Simple Process</span>
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide">
                HOW IT WORKS
              </FadeHeadline>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {steps.map((step, index) => (
                <GlassCard key={step.number} className="p-4 lg:p-6 relative" hover gradient="subtle">
                  {/* Connector line (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-red-600/50 to-transparent" />
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/20 shrink-0">
                      {step.icon}
                    </div>
                    <span className="font-display text-2xl lg:text-4xl text-neutral-700">{step.number}</span>
                  </div>
                  <h3 className="font-display text-base lg:text-xl text-white mb-2 tracking-wide">{step.title}</h3>
                  <p className="text-neutral-400 text-xs lg:text-sm leading-relaxed">{step.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Design Your Detail Section */}
      <AnimatedSection id="design-your-detail" className="py-16 lg:py-24 scroll-mt-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Step 1</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                DESIGN YOUR <span className="text-red-500">DETAIL</span>
              </FadeHeadline>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Build your custom detail package below. Select your vehicle size, choose a package, and add any extras. When you&apos;re ready, click continue to pick your appointment time.
              </p>
            </div>

            <PricingCalculator
              packages={allPackagesFlat}
              sizeAdjustments={sizeAdjustments}
              addons={addons}
              ceramicServices={ceramicServices}
              onComplete={handleDesignComplete}
              bookButtonLabel="Continue to Scheduling →"
            />
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="line" />

      {/* Booking Widget Section */}
      <AnimatedSection id="booking-widget" className="py-16 lg:py-24 scroll-mt-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-6 lg:p-10" gradient="red">
              <div className="text-center mb-8">
                <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Step 2</span>
                <h2 className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-4">
                  SCHEDULE YOUR <span className="text-red-500">APPOINTMENT</span>
                </h2>
              </div>

              {/* Conditional rendering based on selection state */}
              {selection ? (
                <div className="space-y-6">
                  {/* Service Summary */}
                  <ServiceSummary selection={selection} />

                  {/* Deposit notice */}
                  <GlassCard className="p-5 border-neutral-700/50" gradient="subtle">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/5 flex items-center justify-center shrink-0">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-white font-bold text-lg">
                            Deposit Required: <span className="text-red-500">${getDepositAmount()}</span>
                          </p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700 leading-none">
                            24h Refund Policy
                          </span>
                        </div>
                        <p className="text-neutral-300 text-sm mb-2">
                          The remaining balance of ${selection.total - getDepositAmount()} will be collected at the time of service.
                        </p>
                        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                          <p className="text-neutral-400 text-xs font-medium leading-relaxed">
                            <span className="text-white font-bold underline uppercase mr-1">Flexible Booking:</span>
                            Fully refundable if canceled or rescheduled at least
                            <span className="text-white font-bold mx-1">24 hours</span> before your appointment.
                            Within 24 hours, the deposit becomes non-refundable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Edit Detail Button */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={scrollToDesign}
                      className="text-neutral-400 hover:text-white text-sm underline underline-offset-4 transition-colors"
                    >
                      ← Edit your detail selections
                    </button>
                  </div>

                  {/* Cal.com Embed */}
                  <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-4 min-h-[600px]">
                    <CalEmbed selection={selection} />
                  </div>
                </div>
              ) : (
                /* Gated state: No selection yet */
                <div className="text-center py-12 lg:py-16">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-display text-2xl text-white mb-3">Calendar Locked</h3>
                    <p className="text-neutral-400 max-w-md mx-auto mb-2">
                      Design your detail package first to unlock the scheduling calendar.
                    </p>
                    <p className="text-neutral-500 text-sm max-w-sm mx-auto">
                      This ensures we have all the information we need to prepare for your service.
                    </p>
                  </div>
                  <MagneticButton 
                    href="#design-your-detail" 
                    variant="primary" 
                    size="lg"
                  >
                    ↑ Design Your Detail First
                  </MagneticButton>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

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
              {[
                {
                  q: 'How far in advance should I book?',
                  a: 'We recommend booking at least 48 hours in advance to secure your preferred time slot, though same-day availability may be possible.',
                },
                {
                  q: 'What if I need to reschedule or cancel?',
                  a: 'You can reschedule or cancel your appointment for a full refund of your deposit with at least 24 hours notice. If you cancel or reschedule within 24 hours of your appointment, the deposit is non-refundable.',
                },
                {
                  q: 'Where do you provide service?',
                  a: 'We serve the greater Boise area and surrounding communities. Contact us to confirm service in your location.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and digital payments including Apple Pay and Google Pay.',
                },
              ].map((faq) => (
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
