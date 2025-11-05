"use server"
import { Reveal } from '@/components/reveal'
import { GalleryGrid } from '@/components/gallery-grid'

type GalleryItem = {
  id: string
  title: string
  description?: string
  beforeUrl: string
  afterUrl: string
}

async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gallery`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.items ?? []
}

export default async function Gallery() {
  const items = await fetchGallery()
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
          <GalleryGrid items={items} />
        </Reveal>

        <Reveal delay={0.05} skipOnRouteTransition>
          <div className="mt-12 text-center">
            <p className="text-neutral-300 text-sm">
              Want your car to be the next feature?&nbsp;
              <a href="/booking" className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded">Book a service</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  )
}


