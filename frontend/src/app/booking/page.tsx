'use client'

import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'

const steps = [
  {
    number: '01',
    title: 'Choose Your Service',
    description: 'Browse our packages and select the perfect detailing option for your vehicle.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Pick Your Time',
    description: 'Select a convenient date and time that works with your schedule.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Confirm & Pay',
    description: 'Review your booking details and secure your appointment with easy payment.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'We Come to You',
    description: 'Sit back and relax while we bring professional detailing to your location.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const features = [
  { icon: '🕐', title: 'Flexible Scheduling', description: 'Book anytime that works for you' },
  { icon: '📍', title: 'Mobile Service', description: 'We come to your location' },
  { icon: '💳', title: 'Secure Payment', description: 'Safe, encrypted transactions' },
  { icon: '✨', title: 'Quality Guarantee', description: 'Satisfaction guaranteed' },
]

export default function Booking() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="BOOK YOUR DETAIL"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="word"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
              Schedule your premium mobile detailing service in just a few clicks. We&apos;ll bring the showroom to you.
            </FadeHeadline>
            <MagneticButton href="#booking-widget" variant="primary" size="lg">
              Start Booking
            </MagneticButton>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* How It Works */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Simple Process</span>
              <FadeHeadline as="h2" className="font-display text-4xl lg:text-5xl text-white tracking-wide">
                HOW IT WORKS
              </FadeHeadline>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <GlassCard key={step.number} className="p-6 relative" hover gradient="subtle">
                  {/* Connector line (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-red-600/50 to-transparent" />
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                      {step.icon}
                    </div>
                    <span className="font-display text-4xl text-neutral-700">{step.number}</span>
                  </div>
                  <h3 className="font-display text-xl text-white mb-2 tracking-wide">{step.title}</h3>
                  <p className="text-neutral-400 text-sm">{step.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Grid */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature) => (
                <GlassCard key={feature.title} className="p-5 text-center" hover>
                  <span className="text-3xl mb-3 block">{feature.icon}</span>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Booking Widget Section */}
      <AnimatedSection id="booking-widget" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 lg:p-12" gradient="red">
              <div className="text-center mb-10">
                <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Schedule Now</span>
                <h2 className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-4">
                  BOOK YOUR APPOINTMENT
                </h2>
                <p className="text-neutral-400 max-w-xl mx-auto">
                  Select your preferred service and time below. Our online booking system makes scheduling quick and easy.
                </p>
              </div>

              {/* Booking Widget Placeholder */}
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-8 lg:p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-red-600/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-white mb-3 tracking-wide">BOOKING COMING SOON</h3>
                <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                  Our online booking system is being finalized. In the meantime, contact us directly to schedule your detail.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton href="/contact" variant="primary">
                    Contact Us
                  </MagneticButton>
                  <MagneticButton href="tel:+12089604970" variant="secondary">
                    Call (208) 960-4970
                  </MagneticButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Questions?</span>
              <FadeHeadline as="h2" className="font-display text-3xl lg:text-4xl text-white tracking-wide">
                BOOKING FAQ
              </FadeHeadline>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'How far in advance should I book?',
                  a: 'We recommend booking at least 48 hours in advance to secure your preferred time slot, though same-day availability may be possible.',
                },
                {
                  q: 'What if I need to reschedule?',
                  a: 'No problem! You can reschedule your appointment with at least 24 hours notice at no additional charge.',
                },
                {
                  q: 'Where do you provide service?',
                  a: 'We serve the greater Boise area and surrounding communities. Contact us to confirm service in your location.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and digital payments including Apple Pay and Google Pay.',
                },
              ].map((faq) => (
                <GlassCard key={faq.q} className="p-6">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-neutral-400 text-sm">{faq.a}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
