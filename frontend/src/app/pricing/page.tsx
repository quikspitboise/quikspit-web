import type { Metadata } from 'next'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { PricingInteractive } from '@/components/pricing-interactive'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for professional mobile auto detailing services in Boise. Choose from exterior wash, interior detail, full detail packages, and add-on services.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing - QuikSpit Shine Auto Detailing Services',
    description: 'View our competitive pricing for professional mobile detailing. Exterior, interior, and full detail packages available.',
    url: '/pricing',
  },
}

// Data for the interactive pricing calculator - matches original design
const pricingCategories = [
  {
    id: 'combo',
    label: 'Exterior + Interior',
    blurb: 'Complete inside & out transformations for total vehicle revival.',
    packages: [
      {
        id: 'silver',
        name: 'Silver Package',
        tagline: 'The Essentials',
        description: 'A sleek entry level option that still feels exclusive.',
        basePrice: 200,
        features: [
          'Full interior vacuum including trunk',
          'Scrub/Wipe all interior surfaces including door jambs',
          'Stain spot treatment',
          'Streak-free glass clean',
          'Professional hand wash of all exterior surfaces',
          'Deep clean rims and tires',
          'Tire shine applied',
          '3 month ceramic sealant applied',
        ],
      },
      {
        id: 'gold',
        name: 'Gold Package',
        tagline: 'The Prestige Clean',
        description: 'Mid-tier with enhanced services and deeper care.',
        basePrice: 240,
        highlight: true,
        features: [
          'Includes everything in Silver Package, plus:',
          'Shampoo of all seats and carpets including trunk',
          'Conditioning of dashboard, trim, and floor mats',
          'Headliner spot treatment',
          'Revive faded exterior plastics',
        ],
      },
      {
        id: 'platinum',
        name: 'Platinum Package',
        tagline: 'Executive Treatment',
        description: 'For those who want it all, and then some.',
        basePrice: 300,
        features: [
          'Includes everything in Gold Package, plus:',
          'Enzyme odor eliminator',
          'Premium leather conditioning',
          'Paint decontamination',
          'Paint enhancement applied',
        ],
      },
    ],
  },
  {
    id: 'interior',
    label: 'Interior Only',
    blurb: 'Targeted interior care ranging from reset to showroom.',
    packages: [
      {
        id: 'silver',
        name: 'Basic Interior',
        tagline: 'The Essentials Reset',
        description: 'A simple, but effective reset.',
        basePrice: 125,
        features: [
          'Full interior vacuum including trunk',
          'Scrub/wipe down all surfaces including door jambs',
          'Streak-free glass clean',
          'Stain spot treatment',
        ],
      },
      {
        id: 'gold',
        name: 'Value Interior',
        tagline: 'Refined & Restored',
        description: 'Added shampoo & conditioning for a deeper clean.',
        basePrice: 140,
        highlight: true,
        features: [
          'Everything in Basic Interior, plus:',
          'Full interior shampoo including trunk',
          'Dashboard, trim, and floor mat conditioning',
          'Headliner spot clean',
        ],
      },
      {
        id: 'platinum',
        name: 'Prestige Interior',
        tagline: 'Showroom Ready',
        description: 'The ultimate interior transformation.',
        basePrice: 170,
        features: [
          'Everything in Value Interior, plus:',
          'Enzyme odor eliminator',
          'Premium leather conditioning',
        ],
      },
    ],
  },
  {
    id: 'exterior',
    label: 'Exterior Only',
    blurb: 'Exterior focused shine, protection & curb appeal.',
    packages: [
      {
        id: 'silver',
        name: 'Basic Exterior',
        tagline: 'Fresh & Clean',
        description: 'Entry-level but sharp and fresh.',
        basePrice: 100,
        features: [
          'Professional hand wash/dry',
          'Deep clean rims & tires',
          '3 month ceramic sealant',
          'Tire shine applied',
        ],
      },
      {
        id: 'gold',
        name: 'Value Exterior',
        tagline: 'Head-Turning Refresh',
        description: 'Adds enhancement & plastics revival.',
        basePrice: 125,
        highlight: true,
        features: [
          'Everything in Basic Exterior, plus:',
          'Paint enhancement applied',
          'Revive faded exterior plastics',
        ],
      },
      {
        id: 'platinum',
        name: 'Prestige Exterior',
        tagline: 'Show-Car Status',
        description: 'Maximum exterior pop & protection.',
        basePrice: 150,
        features: [
          'Everything in Value Exterior, plus:',
          'Paint decontamination',
          '6 month ceramic sealant applied',
        ],
      },
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
  { name: 'Pet Hair Removal', price: 35, description: 'Deep extraction of embedded pet hair (auto if necessary)' },
  { name: 'Water Spot Removal', price: 25, description: 'Remove stubborn water spots from paint' },
]

const ceramicServices = [
  {
    name: '5-7 Year Graphene Ceramic Coating',
    price: '$550+',
    description: 'A deep, mirror-like shine that lasts years, not weeks.',
    note: 'While not required, a 1-step paint correction is strongly recommended for the best results of a ceramic coating.',
  },
  {
    name: '1-Step Paint Correction & Polish',
    price: '$600+',
    description: 'Years of swirls & scratches erased in a single session (≈65% correction or more).',
  },
  {
    name: '2-Step Paint Correction',
    price: '$800+',
    description: 'Maximum defect removal with multi-stage compounding and polishing for a flawless finish.',
  },
]

export default function Pricing() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
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

      {/* Packages & Pricing - Main Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                PACKAGES &amp; <span className="text-red-500">PRICING</span>
              </FadeHeadline>
            </div>

            <PricingInteractive categories={pricingCategories} sizeAdjustments={sizeAdjustments} />

            <p className="text-center text-neutral-500 text-sm mt-8">
              * Prices may vary based on vehicle condition. Contact us for a custom quote.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Ceramic Coating & Paint Correction Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Premium Services</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                CERAMIC COATING &amp; <span className="text-red-500">POLISH</span>
              </FadeHeadline>
            </div>

            {/* Important Note */}
            <GlassCard className="p-5 mb-8" gradient="subtle">
              <div className="flex gap-3">
                <span className="text-red-500 font-semibold">Note:</span>
                <p className="text-neutral-300">
                  All ceramic coating and paint correction services include a Prestige Exterior detail with paint decontamination.
                </p>
              </div>
            </GlassCard>

            {/* Ceramic Services List */}
            <div className="space-y-4">
              {ceramicServices.map((service) => (
                <GlassCard key={service.name} className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                    <span className="text-red-500 font-display text-xl whitespace-nowrap">{service.price}</span>
                  </div>
                  <p className="text-neutral-400">{service.description}</p>
                  {service.note && (
                    <p className="text-neutral-500 text-sm italic mt-2">{service.note}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="line" />

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
              {[
                {
                  q: 'TEMP: Do prices vary by vehicle size?',
                  a: 'Yes, our base prices are for standard sedans. SUVs, trucks, and larger vehicles may have adjusted pricing based on size.',
                },
                {
                  q: 'TEMP: Is there a travel fee?',
                  a: 'We offer free travel within our primary service area (Boise and surrounding communities). Locations outside this area may incur a small travel fee.',
                },
                {
                  q: 'TEMP: What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, cash, and digital payments including Apple Pay, Google Pay, and Venmo.',
                },
                {
                  q: 'TEMP: Do you offer any discounts?',
                  a: 'Yes! We offer a 10% discount for first-time customers and special rates for recurring service packages. Ask about our referral program too!',
                },
              ].map((faq) => (
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
              Get in touch for a custom quote or book your service online. We can&apos;t wait to make your vehicle shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/booking" variant="primary" size="lg">
                Book Your Detail
              </MagneticButton>
              <MagneticButton href="/contact" variant="secondary" size="lg">
                Get Custom Quote
              </MagneticButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
