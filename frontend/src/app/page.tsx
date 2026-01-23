'use client'

import Link from 'next/link'
import Script from 'next/script';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { VideoHero } from '@/components/ui/video-hero';
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline';
import { GlassCard, FeatureCard } from '@/components/ui/glass-card';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { SectionTransition, AnimatedSection } from '@/components/ui/section-transition';
import InstagramEmbedWithSkeleton from '../components/InstagramEmbedWithSkeleton';
import TikTokEmbedWithSkeleton from '../components/TikTokEmbedWithSkeleton';

// Icons
const SparkleIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DiamondIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
);

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "QuikSpit Auto Detailing",
    "image": "https://quikspitboise.com/og-image.jpg",
    "description": "Professional mobile car detailing services that come to you. Experience premium detailing with expert techniques and professional-grade equipment.",
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
      "https://www.instagram.com/quikspit_shine",
      "https://www.tiktok.com/@quikspit_shine"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
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
  };

  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: '-100px' });

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-transparent">
        {/* Ambient glow effects */}
        <div className="ambient-glow ambient-glow-1" aria-hidden="true" />
        <div className="ambient-glow ambient-glow-2" aria-hidden="true" />

        {/* Hero Section with Video Background */}
        <VideoHero
          overlayOpacity={0.7}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center pt-20 lg:pt-32">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-white/80 tracking-wide">Mobile Detailing in Boise, ID</span>
              </motion.div>

              {/* Main Headline */}
              <AnimatedHeadline
                text="PROFESSIONAL MOBILE DETAILING"
                as="h1"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]"
                delay={0.3}
                splitBy="word"
              />

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-xl lg:text-2xl text-white/70 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
              >
                We bring showroom-quality detailing directly to you.
                Experience the difference of professional-grade care without leaving home.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                  Book Service Now
                </MagneticButton>
                <MagneticButton href="/contact" variant="secondary" size="lg">
                  Got Questions?
                </MagneticButton>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="mt-16 flex flex-wrap justify-center gap-8 text-white/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.9 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>100% Satisfaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Same-Day Available</span>
                </div>
              </motion.div>
            </div>
          </div>
        </VideoHero>

        {/* Services Section - Bento Grid */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-16 lg:mb-20">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block"
              >
                What We Offer
              </motion.span>
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                PREMIUM SERVICES
              </FadeHeadline>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-neutral-400 text-lg mt-6 max-w-2xl mx-auto"
              >
                Professional detailing services designed to exceed your expectations
              </motion.p>
            </div>

            {/* Bento Grid */}
            <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<SparkleIcon />}
                title="EXTERIOR & INTERIOR"
                description="Complete auto restoration bringing your car back to factory-fresh condition. Thorough cleaning, decontamination, and protection."
                delay={0}
              />

              <FeatureCard
                icon={<ShieldIcon />}
                title="CERAMIC COATINGS"
                description="Unparalleled hydrophobics, UV protection, and gloss lasting years. Professional-grade coatings for ultimate paint protection."
                delay={0.1}
              />

              <FeatureCard
                icon={<DiamondIcon />}
                title="PREMIUM PACKAGES"
                description="Comprehensive full-service packages combining interior and exterior detailing with ceramic protection for the ultimate experience."
                delay={0.2}
              />
            </div>

            {/* Mobile Service Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8"
            >
              <GlassCard className="p-8 lg:p-10" gradient="red">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
                    <TruckIcon />
                  </div>
                  <div className="flex-grow text-center lg:text-left">
                    <h3 className="font-display text-3xl text-white mb-2 tracking-wide">WE COME TO YOU</h3>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                      No need to drop off your car anywhere. Our mobile service brings professional detailing directly to your home, office, or anywhere in the Boise area.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <MagneticButton href="/pricing" variant="primary">
                      View Pricing
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        <SectionTransition variant="line" />

        {/* Social Proof & CTA Section */}
        <AnimatedSection className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block"
              >
                Follow Our Work
              </motion.span>
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl text-white tracking-wide">
                SEE THE RESULTS
              </FadeHeadline>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Instagram Embed */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <GlassCard padding="sm" className="overflow-hidden">
                  <div className="aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden">
                    <InstagramEmbedWithSkeleton className="w-full h-full" />
                  </div>
                </GlassCard>
              </motion.div>

              {/* Center CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-8"
              >
                <div className="font-display text-5xl lg:text-6xl text-white mb-4 tracking-wide">
                  READY TO<br />
                  <span className="text-gradient-red">SHINE?</span>
                </div>
                <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
                  Book your mobile detailing service today and experience the QuikSpit difference.
                </p>
                <div className="flex flex-col gap-4">
                  <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                    Schedule Service
                  </MagneticButton>
                  <Link
                    href="tel:+12089604970"
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    Or call (208) 960-4970
                  </Link>
                </div>
              </motion.div>

              {/* TikTok Embed */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <GlassCard padding="sm" className="overflow-hidden">
                  <div className="aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden">
                    <TikTokEmbedWithSkeleton className="w-full h-full" />
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        <SectionTransition variant="dots" />

        {/* Final CTA */}
        <AnimatedSection className="py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="text-center py-16 lg:py-20" gradient="red" spotlight>
              <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-6">
                QUESTIONS? WE&apos;VE GOT ANSWERS
              </FadeHeadline>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10">
                Curious about something? Whether it&apos;s about our services, your specific vehicle, or anything else—we&apos;re happy to chat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton href="/contact" variant="primary" size="lg">
                  Let&apos;s Talk
                </MagneticButton>
                <MagneticButton href="/gallery" variant="secondary" size="lg">
                  View Gallery
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>
      </main>
    </>
  );
}
