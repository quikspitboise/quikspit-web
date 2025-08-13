'use client'

import { Reveal } from '@/components/reveal'

export default function About() {
  return (
    <main className="min-h-screen bg-neutral-900 dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Reveal skipOnRouteTransition>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                About <span className="text-red-600">QuikSpit Shine</span>
              </h1>
            </Reveal>
            <Reveal delay={0.05} skipOnRouteTransition>
              <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non arcu eget ante tristique cursus.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
              </p>
            </Reveal>
          </div>

          <Reveal skipOnRouteTransition className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700 mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Story</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque non dui ac arcu rutrum aliquet.
              Integer eu velit non turpis consectetur ultrices. Sed ac sapien a magna sodales aliquet. Suspendisse
              tincidunt, lorem in aliquet fermentum, mauris mi malesuada est, at porta justo tellus sit amet erat.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              Curabitur ac orci ac lorem elementum commodo. Aenean ut sapien sed arcu hendrerit bibendum.
              Mauris venenatis, magna in consectetur facilisis, dui odio bibendum nisi, ut finibus ipsum justo in mi.
            </p>
          </Reveal>

          <Reveal delay={0.05} skipOnRouteTransition className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-center">
              <div className="flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center" role="img" aria-label="Owner headshot placeholder">
                  <span className="text-neutral-400 text-sm">Owner Image</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Meet the Owner</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id lacus vitae neque sodales tincidunt.
                  Phasellus at urna non augue consectetur tristique. Cras vitae ultricies lectus, id fermentum mi.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Proin porta, lacus et auctor blandit, nibh massa mattis turpis, sed elementum augue magna vitae ex.
                  Nunc vehicula, elit sed suscipit accumsan, lorem lorem interdum arcu, eu laoreet nunc arcu non ipsum.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} skipOnRouteTransition>
            <div className="mt-10 text-center">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900">
                Get in Touch
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  )
}


