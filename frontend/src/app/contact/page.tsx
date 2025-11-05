import React from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { ContactForm } from '@/components/contact-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with QuikSpit Auto Detailing for quotes, questions, or to schedule your mobile detailing service. Call (208) 960-4970 or send us a message with photos of your vehicle.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact QuikSpit Auto Detailing - Mobile Detailing',
    description: 'Get in touch for quotes, questions, or to schedule your mobile detailing service. We\'re here to help!',
    url: '/contact',
  },
}

export default function Contact() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <h1 className="text-4xl font-bold text-white mb-4">
                Contact <span className="text-red-600">Us</span>
              </h1>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-lg text-neutral-300">
                Get in touch with us for any questions or to schedule a service. 
                We&apos;d love to hear from you!
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Information */}
            <div className="space-y-8 h-full flex flex-col">
              <Reveal className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-700">
                <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-neutral-300">Mobile Service - We Come To You!</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+12089604970" className="text-neutral-300 hover:text-red-600 transition-colors">(208) 960-4970</a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:quikspitboise@gmail.com" className="text-neutral-300 hover:text-red-600 transition-colors">quikspitboise@gmail.com</a>
                  </div>
                </div>
              </Reveal>

              <Reveal className="bg-red-600 p-6 rounded-xl shadow-lg flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Ready to Book?</h3>
                  <p className="text-red-100 mb-4">Call or book online to schedule your mobile detailing service!</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
                  <a
                    href="tel:+12089604970"
                    className="inline-block bg-white text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Call (208) 960-4970
                  </a>
                  <Link
                    href="/booking"
                    className="inline-block bg-white text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                  >
                    Book Online
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
