import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | QuikSpit Shine',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8">
          {/* Large 404 with styling */}
          <div className="relative">
            <h1 className="text-[150px] sm:text-[200px] lg:text-[250px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-800 leading-none select-none" aria-label="Error 404">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg 
                className="w-24 h-24 sm:w-32 sm:h-32 text-red-600/20" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-neutral-300 mb-6 max-w-2xl mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-brand-charcoal-light border border-neutral-600 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-red-600 text-neutral-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </div>
            </Link>
            <Link
              href="/pricing"
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-red-600 text-neutral-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pricing
              </div>
            </Link>
            <Link
              href="/gallery"
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-red-600 text-neutral-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gallery
              </div>
            </Link>
            <Link
              href="/contact"
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-red-600 text-neutral-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal-light"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </div>
            </Link>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Go to Homepage
          </Link>
          <Link
            href="/contact"
            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Contact Us
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-12 text-sm text-neutral-300">
          If you believe this is a mistake, please{' '}
          <Link href="/contact" className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600 rounded">
            let us know
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
