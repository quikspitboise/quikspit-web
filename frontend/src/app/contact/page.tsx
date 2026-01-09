import type { Metadata } from 'next'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedSection, SectionTransition } from '@/components/ui/section-transition'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with QuikSpit Auto Detailing for a free quote, to schedule a service, or ask any questions. We serve the Boise, Idaho area with professional mobile car detailing.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact QuikSpit Shine - Get a Free Quote',
    description: 'Ready for a spotless vehicle? Contact us for professional mobile detailing services in Boise. Get a free quote today!',
    url: '/contact',
  },
}

const contactMethods = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Phone',
    value: '(208) 960-4970',
    href: 'tel:+12089604970',
    description: 'Call or text anytime',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Email',
    value: 'contact@quikspitboise.com',
    href: 'mailto:contact@quikspitboise.com',
    description: 'We reply within 24 hours',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Service Area',
    value: 'Boise, ID & Surrounding Areas',
    href: null,
    description: 'Mobile service - we come to you',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Availability',
    value: 'By Appointment',
    href: null,
    description: 'Flexible scheduling to fit your needs',
  },
]

export default function Contact() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedHeadline
              text="GET IN TOUCH"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
              splitBy="word"
            />
            <FadeHeadline as="p" delay={0.3} className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Ready for a showroom-quality detail? Reach out for a free quote or to schedule your service.
            </FadeHeadline>
          </div>
        </div>
      </section>

      <SectionTransition variant="line" />

      {/* Contact Methods */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method) => (
                <GlassCard key={method.title} hover gradient="subtle">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-4 text-white shadow-lg shadow-red-600/20">
                      {method.icon}
                    </div>
                    <h3 className="font-display text-lg text-white mb-2 tracking-wide">{method.title}</h3>
                    {method.href ? (
                      <a 
                        href={method.href}
                        className="text-red-500 hover:text-red-400 font-medium transition-colors block mb-1"
                      >
                        {method.title === 'Email' ? (
                          <>
                            <span className="block italic opacity-90 text-[0.95em]">contact</span>
                            <span className="block">@quikspitboise.com</span>
                          </>
                        ) : (
                          method.value
                        )}
                      </a>
                    ) : (
                      <p className="text-white font-medium mb-1">{method.value}</p>
                    )}
                    <p className="text-neutral-500 text-sm">{method.description}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Form Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[1fr,1.5fr] gap-10 items-start">
              {/* Info Side */}
              <div>
                <span className="text-red-500 text-sm uppercase tracking-[0.2em] font-medium mb-4 block">Send a Message</span>
                <h2 className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-6">
                  LET&apos;S TALK
                </h2>
                <div className="space-y-4 text-neutral-300 mb-8">
                  <p>
                    Have questions about our services? Want a custom quote for your vehicle? We&apos;re here to help.
                  </p>
                  <p>
                    Fill out the form and we&apos;ll get back to you within 24 hours. For immediate assistance, give us a call.
                  </p>
                </div>

                {/* Social Links */}
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/quikspitboise/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-red-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@quikspitboise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-red-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300"
                    aria-label="Follow us on TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61576770498756"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-red-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300"
                    aria-label="Follow us on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Form Side */}
              <GlassCard className="p-8" gradient="red">
                <ContactForm />
              </GlassCard>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionTransition variant="dots" />

      {/* Map/Service Area Section */}
      <AnimatedSection className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8 lg:p-12 text-center" gradient="subtle">
              <div className="w-20 h-20 rounded-2xl bg-red-600/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl text-white tracking-wide mb-4">
                MOBILE SERVICE AREA
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto mb-8">
                We proudly serve the greater Boise area including Meridian, Nampa, Eagle, Star, Caldwell, and surrounding communities. Not sure if you&apos;re in our service area? Just ask!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Boise', 'Meridian', 'Nampa', 'Eagle', 'Star', 'Caldwell', 'Kuna', 'Garden City'].map((city) => (
                  <span
                    key={city}
                    className="px-4 py-2 bg-neutral-800/50 rounded-full text-neutral-300 text-sm border border-neutral-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
