import type { Metadata } from 'next'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { GalleryGrid } from '@/components/gallery-grid'
import InstagramEmbedWithSkeleton from '@/components/InstagramEmbedWithSkeleton'
import TikTokEmbedWithSkeleton from '@/components/TikTokEmbedWithSkeleton'
import { GALLERY_ITEMS } from '@/data/gallery'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'View our portfolio of professional auto detailing work. See before and after transformations, interior details, and exterior polish results from QuikSpit Auto Detailing.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Gallery - QuikSpit Shine Auto Detailing Work',
    description: 'Browse our portfolio of professional auto detailing transformations. See the quality and attention to detail we bring to every vehicle.',
    url: '/gallery',
  },
}

export default async function Gallery() {
  const galleryItems = GALLERY_ITEMS;
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="OUR WORK"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="character"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Every vehicle tells a story of transformation. Browse our portfolio to see the quality and care we bring to every detail.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* Stats Bar */}
      <AnimatedSection className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '100+', label: 'Vehicles Detailed' },
                { value: '5★', label: 'Average Rating' },
                { value: '98%', label: 'Satisfaction' },
                { value: '24hr', label: 'Response Time' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl lg:text-4xl text-red-500 mb-1">{stat.value}</div>
                  <div className="text-neutral-500 text-sm uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Main Gallery */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Portfolio</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                TRANSFORMATIONS
              </FadeHeadline>
            </div>

            {/* Gallery Grid */}
            <GalleryGrid items={galleryItems} />
          </div>
        </div>
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
              {/* Instagram Section */}
              <GlassCard className="overflow-hidden p-6" hover>
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <h3 className="font-display text-xl text-white tracking-wide">INSTAGRAM</h3>
                </div>
                <InstagramEmbedWithSkeleton />
              </GlassCard>

              {/* TikTok Section */}
              <GlassCard className="overflow-hidden p-6" hover>
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <h3 className="font-display text-xl text-white tracking-wide">TIKTOK</h3>
                </div>
                <TikTokEmbedWithSkeleton />
              </GlassCard>
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
