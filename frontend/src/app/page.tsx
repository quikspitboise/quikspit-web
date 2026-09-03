'use client'

import Script from 'next/script'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { VideoHero } from '@/components/ui/video-hero'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard, FeatureCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { SectionTransition, AnimatedSection } from '@/components/ui/section-transition'
import { Reveal } from '@/components/reveal'
import { ReviewsSection } from '@/components/reviews-section'
import { fetchReviews, type ReviewsData } from '@/lib/reviews'

// Heavy third-party embeds: code-split and loaded after hydration. The embed
// components also defer their scripts until they are near the viewport.
const InstagramEmbed = dynamic(() => import('../components/InstagramEmbedWithSkeleton'), {
  ssr: false,
  loading: () => <EmbedSkeleton />,
})
const TikTokEmbed = dynamic(() => import('../components/TikTokEmbedWithSkeleton'), {
  ssr: false,
  loading: () => <EmbedSkeleton />,
})

function EmbedSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 overflow-hidden" aria-hidden="true">
      <div className="h-[3px] bg-white/10" />
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="min-h-[360px] p-6 space-y-3">
        <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
        <div className="h-3 w-4/6 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  )
}

const SparkleIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const DiamondIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

const TruckIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
)

const services = [
  {
    icon: <SparkleIcon />,
    title: 'Exterior and interior',
    description: 'Hand wash, decontamination, and a full interior clean. Covers paint, wheels, glass, trim, and the whole cabin.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Ceramic coatings',
    description: 'Graphene ceramic coating applied after paint correction. Water beads off, UV damage slows, and washes get easier for years.',
  },
  {
    icon: <DiamondIcon />,
    title: 'Packages for every car',
    description: 'Silver, Gold, and Platinum tiers for each service. Add-ons and ceramic protection slot in where you want them.',
  },
]

export default function Home() {
  const [reviewsData, setReviewsData] = useState<ReviewsData>({
    available: false,
    rating: 4.9,
    totalReviews: 127,
    reviews: [],
    reviewLink: '',
  })

  useEffect(() => {
    fetchReviews().then(setReviewsData)
  }, [])

  const { rating, totalReviews } = reviewsData

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "QuikSpit Auto Detailing",
    "image": "https://quikspitboise.com/og-image.jpg",
    "description": "Mobile auto detailing in Boise, ID. Exterior, interior, ceramic coating, and paint correction services at your home or office.",
    "@id": "https://quikspitboise.com",
    "url": "https://quikspitboise.com",
    "telephone": "+1-208-960-4970",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Mobile Service",
      "addressLocality": "Boise",
      "addressRegion": "ID",
      "postalCode": "83702",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.6150,
      "longitude": -116.2023
    },
    "sameAs": [
      "https://www.instagram.com/quikspitboise/",
      "https://www.tiktok.com/@quikspitboise",
      "https://www.facebook.com/people/QuikSpit-Auto-Detailing/61577268493375/"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "reviewCount": totalReviews.toString()
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Car Detailing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Exterior Detailing",
            "description": "Complete exterior wash, clay bar treatment, polishing, and premium wax protection"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Interior Cleaning",
            "description": "Deep vacuum, steam cleaning, leather conditioning, and sanitization"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Premium Packages",
            "description": "Full interior and exterior detailing with ceramic coating and paint protection"
          }
        }
      ]
    }
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-transparent">
        {/* The one fixed red glow; everything else stays quiet */}
        <div className="ambient-glow" aria-hidden="true" />

        {/* Hero */}
        <VideoHero overlayOpacity={0.7}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center pt-20 lg:pt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-8"
              >
                <span className="inline-flex rounded-full h-2 w-2 bg-red-500" aria-hidden="true" />
                <span className="text-sm text-white/80 tracking-wide font-medium">Mobile detailing in Boise, ID</span>
              </motion.div>

              <AnimatedHeadline
                text="Professional mobile detailing"
                as="h1"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]"
                delay={0.3}
                splitBy="word"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-xl lg:text-2xl text-white/70 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
              >
                We come to your home or office, clean the car inside and out, and leave the paint protected. You do nothing but park.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                  Book now
                </MagneticButton>
                <MagneticButton href="/pricing" variant="secondary" size="lg">
                  See pricing
                </MagneticButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="mt-14 text-sm text-white/50"
              >
                Same-day slots when open · Free travel in the Boise area · Card, cash, or Venmo
              </motion.p>
            </div>
          </div>
        </VideoHero>

        {/* Services */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                What we do
              </FadeHeadline>
              <Reveal delay={0.15} skipOnRouteTransition>
                <p className="text-neutral-400 text-lg mt-6 max-w-2xl mx-auto">
                  Three ways to book: a full detail inside and out, protective coatings, or a package tier that fits the car and the budget.
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <Reveal key={service.title} delay={i * 0.08} skipOnRouteTransition className="h-full">
                  <FeatureCard
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                  />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15} skipOnRouteTransition className="mt-8">
              <GlassCard className="p-8 lg:p-10" gradient="red" hover={false}>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30" aria-hidden="true">
                    <TruckIcon />
                  </div>
                  <div className="flex-grow text-center lg:text-left">
                    <h3 className="font-display text-3xl text-white mb-2 tracking-wide">We come to you</h3>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                      No drop-off, no waiting room. We detail at your home or office anywhere in the Boise area.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <MagneticButton href="/pricing" variant="secondary">
                      See pricing
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        <SectionTransition />

        {/* Google reviews */}
        <AnimatedSection className="py-16 lg:py-24">
          <ReviewsSection />
        </AnimatedSection>

        <SectionTransition />

        {/* Social embeds and CTA */}
        <AnimatedSection className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl text-white tracking-wide">
                See the results
              </FadeHeadline>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <Reveal delay={0.1} skipOnRouteTransition>
                <InstagramEmbed />
              </Reveal>

              <Reveal delay={0.2} skipOnRouteTransition className="text-center py-8">
                <div className="font-display text-5xl lg:text-6xl text-white mb-4 tracking-wide leading-tight">
                  Ready for<br />
                  <span className="text-red-500 text-6xl lg:text-7xl">a clean car?</span>
                </div>
                <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
                  Pick a package and a time. We bring everything to you.
                </p>
                <div className="flex flex-col gap-4">
                  <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                    Book now
                  </MagneticButton>
                  <a
                    href="tel:+12089604970"
                    className="text-white/60 hover:text-white transition-colors text-sm py-2"
                  >
                    Or call (208) 960-4970
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.3} skipOnRouteTransition>
                <TikTokEmbed />
              </Reveal>
            </div>
          </div>
        </AnimatedSection>

        <SectionTransition />

        {/* Final CTA */}
        <AnimatedSection className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="text-center py-16 lg:py-20" gradient="red" hover={false}>
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-6">
                Questions?
              </FadeHeadline>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10">
                Call or text (208) 960-4970, or send a message. We usually reply within a day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton href="/contact" variant="primary" size="lg">
                  Get in touch
                </MagneticButton>
                <MagneticButton href="/gallery" variant="secondary" size="lg">
                  See the gallery
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>
      </main>
    </>
  )
}
