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
  description: 'See QuikSpit detailing work in Boise: before and after comparisons, interior details, and exterior polish results.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Gallery - QuikSpit Auto Detailing Work',
    description: 'Browse before and after detailing work from QuikSpit Auto Detailing around the Boise area.',
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
      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="The showroom"
              as="h1"
              className="text-6xl sm:text-7xl lg:text-8xl text-white mb-6"
              splitBy="character"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl lg:text-2xl text-neutral-400 max-w-2xl mx-auto font-light">
              Recent work from around the Boise area. Drag the sliders to compare before and after.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition />

      {/* Main gallery */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<GalleryGridSkeleton />}>
              <GalleryContent />
            </Suspense>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Google reviews */}
      <AnimatedSection className="py-16 lg:py-24">
        <ReviewsSection />
      </AnimatedSection>

      <SectionTransition />

      {/* Social */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-4">
                Follow the work
              </FadeHeadline>
              <p className="text-neutral-400 max-w-xl mx-auto">
                Latest jobs and behind-the-scenes clips on Instagram and TikTok.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <InstagramEmbedWithSkeleton />
              <TikTokEmbedWithSkeleton />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* CTA */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard className="p-8 lg:p-12" gradient="red" hover={false}>
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-4">
                Your car could be next
              </FadeHeadline>
              <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
                Pick a package and a time. We come to you across the Boise area.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton href="/booking#design-your-detail" variant="primary" size="lg">
                  Book now
                </MagneticButton>
                <MagneticButton href="/pricing" variant="secondary" size="lg">
                  See pricing
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
