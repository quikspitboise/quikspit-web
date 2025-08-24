'use server'

import Image from 'next/image'
import { ComparisonSlider } from '@/components/comparison-slider'
import { Reveal } from '@/components/reveal'

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
    <main className="min-h-screen bg-neutral-900 dark:bg-neutral-900">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item) => (
            <Reveal key={item.id} skipOnRouteTransition className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-white font-semibold">{item.title}</h3>
                <span className="text-neutral-400 text-sm">Sample</span>
              </div>
              <ComparisonSlider beforeUrl={item.beforeUrl} afterUrl={item.afterUrl} altBefore={`${item.title} before`} altAfter={`${item.title} after`} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05} skipOnRouteTransition>
          <div className="mt-12 text-center">
            <p className="text-neutral-400 text-sm">
              Want your car to be the next feature?&nbsp;
              <a href="/booking" className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded">Book a service</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  )
}


