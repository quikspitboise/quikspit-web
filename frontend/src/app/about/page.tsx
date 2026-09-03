import type { Metadata } from 'next'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { OwnerImage } from '@/components/owner-image'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'QuikSpit Auto Detailing is a mobile detailing business serving Boise and the surrounding area. Learn about our approach and the owner behind it.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About QuikSpit Auto Detailing',
    description: 'A Boise mobile detailing business built on efficient work, fair prices, and cars treated like our own.',
    url: '/about',
  },
}

export default function About() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="About QuikSpit"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="word"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              A Boise detailer who comes to you, run by an Idaho native who likes a job done right the first time.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition />

      {/* Mission */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-8 lg:p-12" gradient="subtle" hover={false}>
              <div className="grid lg:grid-cols-[1fr,2fr] gap-10 items-center">
                <div>
                  <h2 className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                    How we work
                  </h2>
                </div>
                <div className="space-y-5 text-neutral-300 leading-relaxed">
                  <p>
                    QuikSpit exists to save you time. Instead of waiting at a shop, you park the car at home or work and get on with your day while we clean it.
                  </p>
                  <p>
                    We keep the work efficient without cutting corners, so a detail costs less than you might expect and still holds up when you look closely. Every vehicle gets the same care we would give our own.
                  </p>
                  <p>
                    Most of our customers come back and send their neighbors. That matters more to us than any single job.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Values */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                What we value
              </FadeHeadline>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Trust',
                  description: 'Your vehicle is in safe hands. We treat every car like it is our own.',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                  title: 'Quality',
                  description: 'Professional-grade products and methods, applied with patience.',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: 'Community',
                  description: 'Proud to serve Boise and the towns around it.',
                },
              ].map((value) => (
                <GlassCard key={value.title} className="text-center p-8" hover gradient="subtle">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-red-600/20" aria-hidden="true">
                    {value.icon}
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3 tracking-wide">{value.title}</h3>
                  <p className="text-neutral-400">{value.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* Owner */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-8 lg:p-12" gradient="red" hover={false}>
              <div className="grid lg:grid-cols-[300px,1fr] gap-10 items-center">
                {/* Owner photo */}
                <div className="relative mx-auto lg:mx-0">
                  <div className="relative w-64 h-64 lg:w-72 lg:h-72">
                    <div className="absolute inset-0 rounded-full border-2 border-red-600/30" aria-hidden="true" />
                    <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-red-600 shadow-2xl shadow-red-600/20 bg-neutral-800">
                      <OwnerImage />
                    </div>
                  </div>
                </div>

                {/* Owner bio */}
                <div>
                  <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Meet the owner</span>
                  <h3 className="font-display text-3xl lg:text-4xl text-white mb-6 tracking-wide">Garret</h3>
                  <div className="space-y-4 text-neutral-300 leading-relaxed">
                    <p>
                      Garret was born and raised in Idaho and works in healthcare, where doing right by people is the whole job. He brings that same standard to QuikSpit: show up on time, do the work well, charge fairly for it.
                    </p>
                    <p>
                      He started the business because he saw how much time people lose waiting on car care. Mobile detailing fixes that, and it lets him build something of his own in the community he grew up in.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition />

      {/* CTA */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-6">
              Ready to get started?
            </FadeHeadline>
            <p className="text-neutral-400 text-lg mb-10">
              Book a detail or ask a question. We work across the Boise area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get in touch
              </MagneticButton>
              <MagneticButton href="/pricing" variant="secondary" size="lg">
                See pricing
              </MagneticButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
