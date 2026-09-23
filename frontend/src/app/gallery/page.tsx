import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { PageHeader } from '@/components/ui/page-header'
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
        <p className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
          Showing a saved copy of the gallery. The newest photos will be back shortly.
        </p>
      )}
      <GalleryGrid items={galleryItems} />
    </>
  )
}

export default function Gallery() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageHeader
        title="Gallery"
        lede="Recent work from around the Boise area. Drag the sliders to compare before and after."
      />

      <section className="border-t border-white/[0.07] py-12 lg:py-16">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <Suspense fallback={<GalleryGridSkeleton />}>
            <GalleryContent />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <ReviewsSection />
      </section>

      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase">Follow the work</h2>
            <p className="mt-4 max-w-xl text-neutral-400">
              New jobs and short clips go up on Instagram and TikTok first.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <InstagramEmbedWithSkeleton />
            <TikTokEmbedWithSkeleton />
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-linear-to-b from-red-950/30 to-transparent">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl text-white uppercase text-balance">Your car next</h2>
            <p className="mt-4 max-w-lg text-neutral-400 text-pretty">
              Pick a package and a time. We come to you anywhere in the Boise area.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <MagneticButton href="/booking#design-your-detail" size="lg">Book a detail</MagneticButton>
            <MagneticButton href="/pricing" variant="secondary" size="lg">See prices</MagneticButton>
          </div>
        </div>
      </section>
    </main>
  )
}
