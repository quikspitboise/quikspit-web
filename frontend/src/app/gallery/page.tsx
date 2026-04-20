import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { GalleryGrid } from '@/components/gallery-grid'
import { GalleryGridSkeleton } from '@/components/gallery-loading-shell'
import InstagramEmbedWithSkeleton from '@/components/InstagramEmbedWithSkeleton'
import TikTokEmbedWithSkeleton from '@/components/TikTokEmbedWithSkeleton'
import { ReviewsSection } from '@/components/reviews-section'
import { fetchPublicGalleryItems } from '@/lib/server/gallery-api'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'View our portfolio of professional auto detailing work. See before and after transformations, interior details, and exterior polish results from QuikSpit Auto Detailing.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Gallery - QuikSpit Auto Detailing Work',
    description: 'Browse our portfolio of professional auto detailing transformations. See the quality and attention to detail we bring to every vehicle.',
    url: '/gallery',
  },
}

export const revalidate = 60

async function GalleryContent() {
  const { items: galleryItems, source } = await fetchPublicGalleryItems()
  const isFallbackGallery = source === 'fallback'

  return (
    <>
      {isFallbackGallery && (
        <GlassCard className="mb-8 border border-amber-500/30 bg-amber-500/5 p-5" hover={false}>
          <p className="text-sm text-amber-100">
            The live gallery service is temporarily unavailable. Showing cached portfolio items while the backend reconnects.
          </p>
        </GlassCard>
      )}
      <GalleryGrid items={galleryItems} />
    </>
  )
}

export default function Gallery() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-28 lg:py-40 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-red-500 text-sm uppercase tracking-[0.3em] font-medium mb-6 block">
              Portfolio
            </span>
            <AnimatedHeadline
              text="THE SHOWROOM"
              as="h1"
              className="text-6xl sm:text-7xl lg:text-8xl text-white mb-6"
              splitBy="character"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl lg:text-2xl text-neutral-400 max-w-2xl mx-auto font-light">
              Every detail, on display. Browse our work and see the transformation for yourself.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* Main Gallery */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<GalleryGridSkeleton />}>
              <GalleryContent />
            </Suspense>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Google Reviews Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <ReviewsSection />
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Social Media Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Follow Along</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                ON SOCIAL MEDIA
              </FadeHeadline>
              <p className="text-neutral-400 max-w-xl mx-auto">
                See our latest work, tips, and behind-the-scenes content on Instagram and TikTok.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <InstagramEmbedWithSkeleton />
              <TikTokEmbedWithSkeleton />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard className="p-8 lg:p-12" gradient="red">
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-4">
                YOUR CAR COULD BE NEXT
              </FadeHeadline>
              <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
                Ready to see your vehicle transformed? Book your detail today and experience the QuikSpit difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                  Book Now
                </MagneticButton>
                <MagneticButton href="/pricing" variant="secondary" size="lg">
                  View Pricing
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
