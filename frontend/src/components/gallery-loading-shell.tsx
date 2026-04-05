import { FadeHeadline, AnimatedHeadline } from '@/components/ui/animated-headline'
import { SectionTransition } from '@/components/ui/section-transition'

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-neutral-900/60 backdrop-blur-sm">
      <div className={`w-full animate-pulse bg-neutral-800/80 ${tall ? 'aspect-[4/5]' : 'aspect-4/3'}`} />
      <div className="space-y-3 p-4">
        <div className="h-4 w-36 animate-pulse rounded-full bg-neutral-800/80" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-800/60" />
      </div>
    </div>
  )
}

export function GalleryGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-center gap-2">
        {['All', 'Before & After', 'Interior', 'Exterior'].map((label) => (
          <div
            key={label}
            className="h-9 rounded-full border border-white/8 bg-white/5 px-5"
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <SkeletonCard />
          <SkeletonCard tall />
        </div>
        <div className="space-y-5">
          <SkeletonCard tall />
          <SkeletonCard />
        </div>
        <div className="space-y-5">
          <SkeletonCard />
          <SkeletonCard tall />
        </div>
      </div>
    </div>
  )
}

export function GalleryPageSkeleton() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      <section className="relative overflow-hidden py-28 lg:py-40">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-red-600/6 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-red-600/3 blur-[100px] pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-6 block text-sm font-medium uppercase tracking-[0.3em] text-red-500">
              Portfolio
            </span>
            <AnimatedHeadline
              text="THE SHOWROOM"
              as="h1"
              className="mb-6 text-6xl text-white sm:text-7xl lg:text-8xl"
              splitBy="character"
            />
            <FadeHeadline
              as="p"
              delay={0.3}
              className="mx-auto max-w-2xl text-xl font-light text-neutral-400 lg:text-2xl"
            >
              Every detail, on display. Browse our work and see the transformation for yourself.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <GalleryGridSkeleton />
          </div>
        </div>
      </section>
    </main>
  )
}
