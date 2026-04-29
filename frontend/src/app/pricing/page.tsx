import type { Metadata } from 'next'
import Script from 'next/script'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { PackagesTabs } from '@/components/packages-tabs'
import { Reveal } from '@/components/reveal'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import {
  packageCategories,
  addons,
  ceramicServices,
} from '@/components/booking/booking-data'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for professional mobile auto detailing services in Boise. Choose from exterior wash, interior detail, full detail packages, and add-on services.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing - QuikSpit Auto Detailing Services',
    description: 'View our competitive pricing for professional mobile detailing. Exterior, interior, and full detail packages available.',
    url: '/pricing',
  },
}

const pricingFaqs = [
  {
    q: 'Do prices vary by vehicle size?',
    a: 'Yes, our base prices are for standard sedans. SUVs, trucks, and larger vehicles have adjusted pricing based on size. Use our Design Your Detail tool on the booking page for accurate estimates.',
  },
  {
    q: 'Is there a travel fee?',
    a: 'We offer free travel within our primary service area (Boise and surrounding communities). Locations outside this area may incur a small travel fee.',
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
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="PRICING"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="character"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Transparent pricing for premium mobile detailing. Choose the package that fits your needs—we bring the showroom to you.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* Value Props */}
      <AnimatedSection className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '📍', label: 'Mobile Service' },
                { icon: '💯', label: 'Satisfaction Guaranteed' },
                { icon: '🌿', label: 'Eco-Friendly Products' },
                { icon: '⚡', label: 'Same-Day Available' },
              ].map((prop) => (
                <div key={prop.label} className="flex items-center justify-center gap-2 text-neutral-400">
                  <span className="text-xl">{prop.icon}</span>
                  <span className="text-sm">{prop.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* All Packages Display - Grouped by Category */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                OUR <span className="text-red-500">PACKAGES</span>
              </FadeHeadline>
              <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
                From quick refreshes to executive treatments, we have a package for every need. Base prices shown for cars/sedans.
              </p>
            </div>

            {/* Package Categories with Tabs */}
            <PackagesTabs categories={packageCategories} />

            <p className="text-center text-neutral-500 text-sm mt-8">
              * Prices shown are for cars/sedans. Larger vehicles have adjusted pricing. Use our calculator below for an accurate estimate.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Add-ons Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Customize Your Detail</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                ADD-ON SERVICES
              </FadeHeadline>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addons.map((addon) => (
                <GlassCard key={addon.name} className="p-5" hover>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{addon.name}</h3>
                    <span className="text-red-500 font-display text-lg">+${addon.price}</span>
                  </div>
                  <p className="text-neutral-400 text-sm">{addon.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="line" />

      {/* Ceramic Coating & Paint Correction Info Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Premium Services</span>
              <div className="flex items-center justify-center gap-3">
                <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                  CERAMIC COATING &amp; <span className="text-red-500">POLISH</span>
                </FadeHeadline>
                <CeramicInfoPopover />
              </div>
            </div>

            {/* Important Note */}
            <GlassCard className="p-5 mb-8" gradient="subtle">
              <div className="flex gap-3">
                <span className="text-red-500 font-semibold">Note:</span>
                <p className="text-neutral-300">
                  Ceramic coating and paint correction services require a paint decontamination service. This is included with <strong className="text-red-500">Prestige Exterior</strong> or <strong className="text-red-500">Platinum Package</strong>.
                </p>
              </div>
            </GlassCard>

            {/* Ceramic Services List */}
            <div className="space-y-4">
              {ceramicServices.map((service) => (
                <GlassCard key={service.id} className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                    <span className="text-red-500 font-display text-xl whitespace-nowrap">${service.price}+</span>
                  </div>
                  <p className="text-neutral-400">{service.description}</p>
                  {service.includedValue && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-600/20 to-orange-500/10 border border-red-500/40 rounded-lg">
                      <p className="text-white font-medium flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {service.includedValue}
                      </p>
                    </div>
                  )}
                  {service.note && (
                    <p className="text-neutral-500 text-sm italic mt-2">{service.note}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Design Your Detail CTA */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-8 lg:p-12 text-center" gradient="red">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-600/10 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Get Your Estimate</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                DESIGN YOUR <span className="text-red-500">DETAIL</span>
              </FadeHeadline>
              <p className="text-neutral-400 max-w-xl mx-auto mb-8">
                Use our interactive builder to customize your detail package, see pricing for your vehicle size, and add any extras. Get an instant estimate and book your appointment in one seamless flow.
              </p>
              <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                Build Your Custom Package →
              </MagneticButton>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Common Questions</span>
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide">
                PRICING FAQ
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

      {/* CTA Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-6">
              READY TO BOOK?
            </FadeHeadline>
            <p className="text-neutral-400 text-lg mb-10">
              Design your custom detail package or reach out if you have any questions. We can&apos;t wait to make your vehicle shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                Design Your Detail
              </MagneticButton>
              <MagneticButton href="/contact" variant="secondary" size="lg">
                Have Questions?
              </MagneticButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
