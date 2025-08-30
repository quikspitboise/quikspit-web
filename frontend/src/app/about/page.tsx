'use client'

import { Reveal } from '@/components/reveal'

export default function About() {
  return (
    <main className="min-h-screen bg-brand-charcoal dark:bg-brand-charcoal">
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
                At QuikSpit Auto Detailing, we believe a great detail is about more than just a clean car—it’s about the experience behind it. Our mission is to deliver efficient, high-quality services that save you time while providing results you can count on.
              </p>
            </Reveal>
          </div>

          <Reveal skipOnRouteTransition className="bg-brand-charcoal-light p-8 rounded-xl shadow-lg border border-neutral-600 mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Story</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              We take pride in combining efficiency with efficacy, ensuring every vehicle is done right the first time. By focusing on value, we aim to give clients not only spotless vehicles at a great price, but also peace of mind that comes from knowing their investment is in safe hands.
            </p>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Building strong relationships is at the heart of what we do. Every vehicle is treated with the same care and attention we’d give our own, because to us it’s not just about cars, it’s about those who drive them.
            </p>
            <p className="text-neutral-300 leading-relaxed mb-4">
              As proud members of the community, we believe in giving back—whether it’s supporting local causes or lending a hand where it’s needed most, we’re committed to making a positive impact on and off the road.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              With QuikSpit, you’re not just getting a clean car, you’re joining a company that values trust, quality, and community.
            </p>
          </Reveal>

          <Reveal delay={0.05} skipOnRouteTransition className="bg-brand-charcoal-light p-8 rounded-xl shadow-lg border border-neutral-600">
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-center">
              <div className="flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-red-600/10 border border-red-600 flex items-center justify-center" role="img" aria-label="Owner headshot placeholder">
                  <span className="text-red-600 text-sm">Owner Image</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">About the Owner</h3>
                <p className="text-neutral-300 leading-relaxed mb-3">
                  Born and raised in Idaho, Garret has always carried a strong sense of community and hard work. With a career in healthcare, he has dedicated himself to helping others—something that naturally extends into his passion for business. His drive to create a mobile detailing business comes from the same place: a commitment to making life easier, more enjoyable, and more efficient for those around him.
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Balancing healthcare with entrepreneurship, Garret is proud to bring both compassion and professionalism to the detailing industry, with the goal of building lasting relationships and a business that truly serves his community.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} skipOnRouteTransition>
            <div className="mt-10 text-center">
              <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal">
                Get in Touch
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  )
}


