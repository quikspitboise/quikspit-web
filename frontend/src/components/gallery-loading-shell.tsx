import { PageHeader } from '@/components/ui/page-header'

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`w-full animate-pulse rounded-xl bg-white/[0.04] ${tall ? 'aspect-[4/5]' : 'aspect-4/3'}`} />
  )
}

export function GalleryGridSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading gallery">
      <div className="flex flex-wrap gap-2">
        {[48, 120, 80, 84].map((width) => (
          <div key={width} className="h-11 rounded-full border border-white/10" style={{ width }} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard tall />
        </div>
        <div className="hidden space-y-4 sm:block">
          <SkeletonCard tall />
          <SkeletonCard />
        </div>
        <div className="hidden space-y-4 lg:block">
          <SkeletonCard />
          <SkeletonCard tall />
        </div>
      </div>
    </div>
  )
}

export function GalleryPageSkeleton() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageHeader
        title="Gallery"
        lede="Recent work from around the Boise area. Drag the sliders to compare before and after."
      />
      <section className="border-t border-white/[0.07] py-12 lg:py-16">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <GalleryGridSkeleton />
        </div>
      </section>
    </main>
  )
}
