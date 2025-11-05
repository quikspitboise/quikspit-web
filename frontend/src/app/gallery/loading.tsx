import { Reveal } from '@/components/reveal'

export default function GalleryLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Reveal skipOnRouteTransition>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Gallery <span className="text-red-600">Before & After</span>
            </h1>
          </Reveal>
          <Reveal delay={0.05} skipOnRouteTransition>
            <p className="text-lg text-neutral-300">Explore transformations from our detailing services.</p>
          </Reveal>
        </div>

        <Reveal skipOnRouteTransition>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skeleton cards */}
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-600 animate-pulse"
                aria-label="Loading gallery item"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-6 bg-neutral-700 rounded w-32"></div>
                  <div className="h-4 bg-neutral-700 rounded w-24"></div>
                </div>
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-neutral-600 bg-neutral-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-neutral-600 animate-spin" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 text-center">
          <p className="text-neutral-400 text-sm">
            Loading gallery images...
          </p>
        </div>
      </div>
    </main>
  )
}
