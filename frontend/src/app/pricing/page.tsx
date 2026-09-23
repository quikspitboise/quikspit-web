import type { Metadata } from 'next'
import Script from 'next/script'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { PageHeader } from '@/components/ui/page-header'
import { FaqList } from '@/components/ui/faq-list'
import { PackagesTabs } from '@/components/packages-tabs'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import {
  packageCategories,
  addons,
  ceramicServices,
  sizeAdjustments,
} from '@/components/booking/booking-data'

const surcharges = sizeAdjustments.map((size) => size.add).filter((add) => add > 0)
const surchargeRange = `$${Math.min(...surcharges)} to $${Math.max(...surcharges)}`

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
    a: `Yes. The prices on this page are for cars and sedans. SUVs, trucks, and vans cost ${surchargeRange} more depending on size. The booking page shows the exact price for your vehicle before you pick a time.`,
  },
  {
    q: 'Is there a travel fee?',
    a: 'Travel is free in Boise and the surrounding towns. Farther out there may be a small travel fee. Call and ask if you are not sure.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Credit and debit cards, cash, Apple Pay, Google Pay, and Venmo.',
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

function SectionHeading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="lg:col-span-4">
      <h2 className="font-display text-3xl sm:text-4xl text-white uppercase">{children}</h2>
      {aside && <div className="mt-4 max-w-sm text-neutral-400 text-pretty">{aside}</div>}
    </div>
  )
}

function PriceRow({ name, description, price, children }: { name: string; description: string; price: string; children?: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b border-white/10 py-5">
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <span className="font-display text-xl sm:text-2xl text-white tabular text-right">{price}</span>
      <p className="col-span-2 text-neutral-400 text-pretty max-w-xl">{description}</p>
      {children && <div className="col-span-2">{children}</div>}
    </li>
  )
}

export default function Pricing() {
  return (
    <main id="main-content" className="min-h-screen">
      <Script
        id="pricing-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqStructuredData) }}
      />

      <PageHeader
        title="Pricing"
        lede="Every package and add-on, with its price. The prices here are for cars and sedans; the booking page adjusts them for your vehicle."
      />

      {/* Packages */}
      <section id="packages" className="scroll-mt-24 border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase mb-8">Packages</h2>
          <PackagesTabs categories={packageCategories} />
          <p className="text-neutral-500 text-sm mt-8">
            Prices shown are for cars and sedans. SUVs, trucks, and vans cost {surchargeRange} more.
          </p>
        </div>
      </section>

      {/* Add-ons */}
      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <SectionHeading aside="Add any of these to a package when you book.">Add-ons</SectionHeading>
          <ul className="lg:col-span-8 border-t border-white/10">
            {addons.map((addon) => (
              <PriceRow key={addon.name} name={addon.name} description={addon.description} price={`+$${addon.price}`} />
            ))}
          </ul>
        </div>
      </section>

      {/* Ceramic coating and paint correction */}
      <section id="ceramic" className="scroll-mt-24 border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <SectionHeading
            aside={
              <>
                <p>
                  Coating and paint correction need clean, decontaminated paint first. That comes with the Prestige Exterior and the Platinum Package.
                </p>
                <div className="mt-5">
                  <CeramicInfoPopover />
                </div>
              </>
            }
          >
            Ceramic coating and paint correction
          </SectionHeading>
          <ul className="lg:col-span-8 border-t border-white/10">
            {ceramicServices.map((service) => (
              <PriceRow key={service.id} name={service.name} description={service.description} price={`$${service.price}+`}>
                {service.includedValue && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-600/10 px-3 py-1.5 text-sm text-red-200">
                    <svg className="h-4 w-4 text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                    {service.includedValue}
                  </p>
                )}
                {service.note && <p className="mt-2 text-sm text-neutral-500">{service.note}</p>}
              </PriceRow>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <SectionHeading>Questions about price</SectionHeading>
          <div className="lg:col-span-8">
            <FaqList faqs={pricingFaqs} />
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-white/[0.07] bg-linear-to-b from-red-950/30 to-transparent">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl text-white uppercase text-balance">See the price for your car</h2>
            <p className="mt-4 max-w-lg text-neutral-400 text-pretty">
              Pick a package, your vehicle size, and any extras. The total updates as you go, then you choose a time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <MagneticButton href="/booking#design-your-detail" size="lg">Build your detail</MagneticButton>
            <MagneticButton href="tel:+12089604970" variant="secondary" size="lg">Call (208) 960-4970</MagneticButton>
          </div>
        </div>
      </section>
    </main>
  )
}
