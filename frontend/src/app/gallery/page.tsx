'use client'

import { Reveal } from '@/components/reveal'

export default function Gallery() {
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
            <p className="text-lg text-neutral-300">
              Explore sample transformations from our detailing services. Placeholder images are shown for now.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(6)].map((_, index) => (
            <Reveal key={index} skipOnRouteTransition className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-white font-semibold">Vehicle {index + 1}</h3>
                <span className="text-neutral-400 text-sm">Sample</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <figure className="">
                  <div className="aspect-[16/10] w-full rounded-lg bg-neutral-700/80 border-2 border-dashed border-neutral-600 flex items-center justify-center text-neutral-300">
                    <span className="sr-only">Before image placeholder for vehicle {index + 1}</span>
                    <span aria-hidden className="text-neutral-300">Before Image</span>
                  </div>
                  <figcaption className="mt-2 text-neutral-400 text-sm">Before</figcaption>
                </figure>
                <figure className="">
                  <div className="aspect-[16/10] w-full rounded-lg bg-neutral-700/80 border-2 border-dashed border-neutral-600 flex items-center justify-center text-neutral-300">
                    <span className="sr-only">After image placeholder for vehicle {index + 1}</span>
                    <span aria-hidden className="text-neutral-300">After Image</span>
                  </div>
                  <figcaption className="mt-2 text-neutral-400 text-sm">After</figcaption>
                </figure>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05} skipOnRouteTransition>
          <div className="mt-12 text-center">
            <p className="text-neutral-400 text-sm">
              Want your car to be the next feature?&nbsp;
              <a href="/booking" className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded">
                Book a service
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  )
}


