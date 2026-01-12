import type { Metadata } from 'next'
import { CldImage } from 'next-cloudinary'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about QuikSpit Auto Detailing - our mission, values, and commitment to delivering efficient, high-quality mobile detailing services. Proud members of the Idaho community.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About QuikSpit Shine - Professional Mobile Detailing',
    description: 'Learn about our mission to deliver efficient, high-quality mobile detailing services that save you time while providing results you can count on.',
    url: '/about',
  },
}

export default function About() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="ABOUT QUIKSPIT"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="word"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              More than just a clean car—it&apos;s about the experience behind it.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* Mission Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-8 lg:p-12" gradient="subtle">
              <div className="grid lg:grid-cols-[1fr,2fr] gap-10 items-center">
                <div>
                  <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Our Mission</span>
                  <h2 className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                    OUR GOALS
                  </h2>
                </div>
                <div className="space-y-5 text-neutral-300 leading-relaxed">
                  <p>
                    At QuikSpit Auto Detailing, we believe a great detail is about more than just a clean car—it&apos;s about the experience behind it. Our mission is to deliver efficient, high-quality services that save you time while providing results you can count on.
                  </p>
                  <p>
                    We take pride in combining efficiency with efficacy, ensuring every vehicle is done right the first time. By focusing on value, we aim to give clients not only spotless vehicles at a great price, but also peace of mind that comes from knowing their investment is in safe hands.
                  </p>
                  <p>
                    Building strong relationships is at the heart of what we do. Every vehicle is treated with the same care and attention we&apos;d give our own, because to us it&apos;s not just about cars, it&apos;s about those who drive them.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      {/* Values Grid */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">What Drives Us</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                OUR VALUES
              </FadeHeadline>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'TRUST',
                  description: "Your vehicle is in safe hands. We treat every car like it's our own.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                  title: 'QUALITY',
                  description: 'Professional-grade results that exceed expectations, every single time.',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: 'COMMUNITY',
                  description: 'Proud to serve Boise and give back to the community that supports us.',
                },
              ].map((value) => (
                <GlassCard key={value.title} className="text-center p-8" hover gradient="subtle">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-red-600/20">
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

      <SectionTransition variant="dots" />

      {/* Owner Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-8 lg:p-12" gradient="red">
              <div className="grid lg:grid-cols-[300px,1fr] gap-10 items-center">
                {/* Owner Photo */}
                <div className="relative mx-auto lg:mx-0">
                  <div className="relative w-64 h-64 lg:w-72 lg:h-72">
                    {/* Decorative ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-pulse" />
                    <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-red-600 shadow-2xl shadow-red-600/20 bg-neutral-800">
                      {CLOUDINARY_ASSETS?.static?.owner && (
                        <CldImage
                          src={CLOUDINARY_ASSETS.static.owner}
                          alt="Garret, Owner of QuikSpit Auto Detailing"
                          fill
                          className="object-cover"
                          sizes="300px"
                          priority
                        />
                      )}
                      {/* Fallback avatar */}
                      {!CLOUDINARY_ASSETS?.static?.owner && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-24 h-24 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Bio */}
                <div>
                  <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Meet the Owner</span>
                  <h3 className="font-display text-3xl lg:text-4xl text-white mb-6 tracking-wide">GARRET</h3>
                  <div className="space-y-4 text-neutral-300 leading-relaxed">
                    <p>
                      Born and raised in Idaho, Garret has always carried a strong sense of community and hard work. With a career in healthcare, he has dedicated himself to helping others—something that naturally extends into his passion for business.
                    </p>
                    <p>
                      His drive to create a mobile detailing business comes from the same place: a commitment to making life easier, more enjoyable, and more efficient for those around him. Balancing healthcare with entrepreneurship, Garret is proud to bring both compassion and professionalism to the detailing industry.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-6">
              READY TO GET STARTED?
            </FadeHeadline>
            <p className="text-neutral-400 text-lg mb-10">
              Experience the QuikSpit difference. Let us bring showroom-quality detailing directly to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Get in Touch
              </MagneticButton>
              <MagneticButton href="/pricing" variant="secondary" size="lg">
                View Pricing
              </MagneticButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
