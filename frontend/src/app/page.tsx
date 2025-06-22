'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="block">Professional</span>
            <span className="text-red-600">Mobile Detailing</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience premium car detailing services that come to you. 
            We make your vehicle shine like new with our professional-grade equipment and expert techniques.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/booking"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
              aria-label="Book a detailing service"
            >
              Book Service Now
            </Link>
            <Link
              href="/contact"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
              aria-label="Contact us for more information"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Professional mobile detailing services designed to keep your vehicle looking its best
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-600">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Exterior Detailing
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                Complete exterior wash, clay bar treatment, polishing, and premium wax protection for a showroom finish.
              </p>
            </div>
            
            <div className="bg-neutral-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-600">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Interior Cleaning
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                Deep vacuum, steam cleaning, leather conditioning, and sanitization for a fresh, clean interior.
              </p>
            </div>
            
            <div className="bg-neutral-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-600">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Premium Packages
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                Comprehensive full-service packages combining interior and exterior detailing for ultimate protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Make Your Car 
            <span className="text-red-600 block sm:inline sm:ml-2">Shine?</span>
          </h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Book your mobile detailing service today and experience the convenience of professional car care at your location.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Schedule Service
          </Link>
        </div>
      </section>
    </main>
  );
}
