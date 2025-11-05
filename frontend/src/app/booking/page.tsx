'use client'

import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Service',
  description: 'Schedule your professional mobile detailing service with QuikSpit Shine. Choose your package and preferred time. Call (208) 960-4970 to book today.',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    title: 'Book Your Mobile Detailing Service - QuikSpit Shine',
    description: 'Schedule your professional mobile detailing service. Choose from our premium packages and get your vehicle looking like new.',
    url: '/booking',
  },
}

export default function Booking() {
  return (
  <main id="main-content" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Reveal skipOnRouteTransition>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Book Your <span className="text-red-600">Service</span>
              </h1>
            </Reveal>
            <Reveal delay={0.05} skipOnRouteTransition>
              <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
                Choose from our premium mobile detailing services and schedule your appointment.
                Professional car care delivered to your location.
              </p>
            </Reveal>
          </div>

          <div className="max-w-3xl mx-auto">
            <Reveal skipOnRouteTransition className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
              <h2 className="text-2xl font-semibold text-white mb-6">Schedule Your Service</h2>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Booking System Coming Soon!</h3>
                <p className="text-neutral-300 mb-8">We&apos;re working on an advanced booking system that will allow you to:</p>
                <ul className="text-left text-neutral-300 space-y-3 mb-10 max-w-sm mx-auto">
                  <li className="flex items-center"><svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Select your preferred date and time</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Choose from our service packages</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Secure online payment processing</li>
                  <li className="flex items-center"><svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Real-time appointment confirmations</li>
                </ul>
                <div className="space-y-4">
                  <p className="text-neutral-300">For now, please call us to schedule your appointment:</p>
                  <a href="tel:+12089604970" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800">Call (208) 960-4970</a>
                  <p className="text-sm text-neutral-300">Need package details? Visit our <Link href="/pricing" className="text-red-600 hover:underline font-medium">pricing page</Link>.</p>
                  <p className="text-sm text-neutral-300">Or visit our <Link href="/contact" className="text-red-600 hover:underline font-medium">contact page</Link> to send us a message.</p>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="mt-16 bg-brand-charcoal-light p-8 rounded-xl shadow-lg border border-neutral-600">
            <Reveal skipOnRouteTransition>
              <h2 className="text-2xl font-semibold text-white mb-8 text-center">What to Expect</h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Reveal skipOnRouteTransition className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-semibold text-white mb-3">Quick & Efficient</h3>
                <p className="text-neutral-300">Fast service without compromising quality</p>
              </Reveal>
              <Reveal delay={0.05} skipOnRouteTransition className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-semibold text-white mb-3">Professional Results</h3>
                <p className="text-neutral-300">Expert care for your vehicle</p>
              </Reveal>
              <Reveal delay={0.1} skipOnRouteTransition className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="font-semibold text-white mb-3">Satisfaction Guaranteed</h3>
                <p className="text-neutral-300">100% satisfaction or your money back</p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
