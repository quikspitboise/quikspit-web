import type { Metadata } from 'next'
import Script from 'next/script'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { PackagesTabs } from '@/components/packages-tabs'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import {
  packageCategories,
  addons,
  ceramicServices,
} from '@/components/booking/booking-data'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Pricing for mobile auto detailing in Boise. Exterior, interior, and full detail packages plus add-ons, ceramic coating, and paint correction.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing - QuikSpit Auto Detailing Services',
    description: 'See prices for mobile detailing packages, add-ons, ceramic coating, and paint correction. Base prices for cars; adjust for vehicle size when you book.',
    url: '/pricing',
  },
}

const pricingFaqs = [
  {
    q: 'Do prices vary by vehicle size?',
    a: 'Yes, our base prices are for standard sedans. SUVs, trucks, and larger vehicles have adjusted pricing based on size. Use the Design Your Detail tool on the booking page for accurate estimates.',
  },
  {
    q: 'Is there a travel fee?',
    a: 'Travel is free within our primary service area, Boise and the surrounding communities. Locations outside this area may incur a small travel fee.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, cash, and digital payments including Apple Pay, Google Pay, and Venmo.',
  },
]

const pricingFaqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pricingFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
}

export default function Pricing() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      <Script
        id="pricing-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqStructuredData) }}
      />
      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="Pricing"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="character"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Every package and add-on with its price. Build an estimate for your vehicle size, then book a time.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition />

      {/* All packages, grouped by category */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                Packages
              </FadeHeadline>
              <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
                Three tiers per service, from a quick refresh to a full detail. Base prices shown for cars and sedans.
              </p>
            </div>

            <PackagesTabs categories={packageCategories} />

            <p className="text-center text-neutral-500 text-sm mt-8">
              * Prices shown are for cars and sedans. Larger vehicles have adjusted pricing. Build an estimate on the booking page for your exact size.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Add-ons */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                Add-ons
              </FadeHeadline>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addons.map((addon) => (
                <GlassCard key={addon.name} className="p-5" hover>
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-semibold text-white">{addon.name}</h3>
                    <span className="text-red-500 font-display text-lg whitespace-nowrap">+${addon.price}</span>
                  </div>
                  <p className="text-neutral-400 text-sm">{addon.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Ceramic coating and paint correction */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                  Ceramic coating and <span className="text-red-500">polish</span>
                </FadeHeadline>
                <CeramicInfoPopover />
              </div>
            </div>

            <GlassCard className="p-5 mb-8" gradient="subtle">
              <div className="flex gap-3">
                <span className="text-red-500 font-semibold">Note:</span>
                <p className="text-neutral-300">
                  Ceramic coating and paint correction require a paint decontamination service. This is included with <strong className="text-red-400">Prestige Exterior</strong> or the <strong className="text-red-400">Platinum Package</strong>.
                </p>
              </div>
            </GlassCard>

            <div className="space-y-4">
              {ceramicServices.map((service) => (
                <GlassCard key={service.id} className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                    <span className="text-red-500 font-display text-xl whitespace-nowrap">${service.price}+</span>
                  </div>
                  <p className="text-neutral-400">{service.description}</p>
                  {service.includedValue && (
                    <div className="mt-3 p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                      <p className="text-white font-medium flex items-center gap-2">
                        <span className="text-green-400" aria-hidden="true">✓</span>
                        {service.includedValue}
                      </p>
                    </div>
                  )}
                  {service.note && (
                    <p className="text-neutral-400 text-sm italic mt-2">{service.note}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Design Your Detail CTA */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-8 lg:p-12 text-center" gradient="red" hover={false}>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                Design your <span className="text-red-500">detail</span>
              </FadeHeadline>
              <p className="text-neutral-400 max-w-xl mx-auto mb-8">
                Pick your package, vehicle size, and extras. The price updates as you go, then you choose a time.
              </p>
              <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                Book now
              </MagneticButton>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* FAQ */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide">
                Pricing FAQ
              </FadeHeadline>
            </div>

            <div className="space-y-4">
              {pricingFaqs.map((faq) => (
                <GlassCard key={faq.q} className="p-6">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-neutral-400 text-sm">{faq.a}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Final CTA */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-6">
              Ready to book?
            </FadeHeadline>
            <p className="text-neutral-400 text-lg mb-10">
              Build a package in the booking flow, or call (208) 960-4970 if you are not sure what your car needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                Book now
              </MagneticButton>
              <MagneticButton href="/contact" variant="secondary" size="lg">
                Get in touch
              </MagneticButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
