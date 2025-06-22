'use client'

import Link from 'next/link'

export default function Booking() {
  return (
    <main className="min-h-screen bg-neutral-900 dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Book Your <span className="text-red-600">Service</span>
            </h1>
            <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
              Choose from our premium mobile detailing services and schedule your appointment. 
              Professional car care delivered to your location.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Service Packages */}            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Our Services
              </h2>
              
              {/* Main Service Packages */}
              <div className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Interior Detail
                </h3>
                <ul className="text-neutral-300 mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Deep Vacuum
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Clean all plastics/vinyls/leathers
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Light shampoo of upholstery (if equipped)
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-red-600">$80</span>
                </div>
              </div>

              <div className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Exterior Detail
                </h3>
                <ul className="text-neutral-300 mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Handwash of all exterior portions
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Wheel/Tire clean & shine
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Iron Decontamination
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-red-600">$60</span>
                </div>
              </div>

              <div className="bg-neutral-800 p-8 rounded-xl shadow-lg border-2 border-red-600 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    Interior + Exterior
                  </h3>
                  <span className="ml-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    BEST VALUE
                  </span>
                </div>
                <p className="text-neutral-300 mb-6">
                  Complete interior and exterior detail package - save $20!
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-red-600">$120</span>
                  <span className="text-lg text-neutral-400 line-through">$140</span>
                </div>
              </div>

              {/* Vehicle Size Adjustments */}
              <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Vehicle Size Adjustments
                </h4>
                <div className="space-y-3 text-neutral-300">
                  <div className="flex justify-between items-center">
                    <span>Small/Midsize SUV</span>
                    <span className="font-semibold text-red-600">+$30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Large SUV/Trucks/Vans</span>
                    <span className="font-semibold text-red-600">+$60</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pet Hair Removal</span>
                    <span className="font-semibold text-red-600">+$35</span>
                  </div>
                </div>
              </div>

              {/* Optional Add-Ons */}
              <div className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-6">
                  Optional Add-Ons
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-start p-4 bg-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-white">Leather Conditioner</span>
                      <p className="text-neutral-300 text-xs mt-1">Softens leather and protects against harmful UV rays</p>
                    </div>
                    <span className="font-semibold text-red-600 ml-4">+$45</span>
                  </div>
                  <div className="flex justify-between items-start p-4 bg-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-white">Hybrid Ceramic Sealant</span>
                      <p className="text-neutral-300 text-xs mt-1">Enhances gloss & adds temporary protection to paint from harmful UV rays</p>
                    </div>
                    <span className="font-semibold text-red-600 ml-4">+$35</span>
                  </div>
                  <div className="flex justify-between items-start p-4 bg-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-white">Deep Clean/Extract Seats & Carpet</span>
                      <p className="text-neutral-300 text-xs mt-1">Removes unwanted stains that a light shampoo cannot remove</p>
                    </div>
                    <span className="font-semibold text-red-600 ml-4">+$55</span>
                  </div>
                  <div className="flex justify-between items-start p-4 bg-neutral-700 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-white">Headlight Restore</span>
                      <p className="text-neutral-300 text-xs mt-1">Provides clarity to oxidized headlights</p>
                    </div>
                    <span className="font-semibold text-red-600 ml-4">+$25 each</span>
                  </div>
                </div>
              </div>

              {/* Pricing Note */}
              <div className="bg-orange-900/20 border-l-4 border-orange-400 p-6 rounded-r-lg">
                <p className="text-sm text-orange-200">
                  <strong>Note:</strong> Pricing based on sedans only & varies based on size of vehicle and presence of excessive dirt.
                </p>
              </div>
            </div>

            {/* Booking Form Placeholder */}
            <div className="bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-700">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Schedule Your Service
              </h2>
              
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Booking System Coming Soon!
                </h3>
                <p className="text-neutral-300 mb-8">
                  We're working on an advanced booking system that will allow you to:
                </p>
                <ul className="text-left text-neutral-300 space-y-3 mb-10 max-w-sm mx-auto">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Select your preferred date and time
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Choose from our service packages
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Secure online payment processing
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Real-time appointment confirmations
                  </li>
                </ul>
                
                <div className="space-y-4">
                  <p className="text-neutral-300">
                    For now, please call us to schedule your appointment:
                  </p>
                  <a
                    href="tel:+12082060531"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800"
                  >
                    Call (208) 206-0531
                  </a>
                  <p className="text-sm text-neutral-400">
                    Or visit our <Link href="/contact" className="text-red-600 hover:underline font-medium">contact page</Link> to send us a message.
                  </p>
                </div>
              </div>
            </div>
          </div>          {/* Additional Information */}
          <div className="mt-16 bg-brand-charcoal-light p-8 rounded-xl shadow-lg border border-neutral-600">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>                <h3 className="font-semibold text-white mb-3">Quick & Efficient</h3>
                <p className="text-neutral-300">Fast service without compromising quality</p>
              </div>
              <div className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-3">Professional Results</h3>
                <p className="text-neutral-300">Expert care for your vehicle</p>
              </div>              <div className="text-center">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-3">Satisfaction Guaranteed</h3>
                <p className="text-neutral-300">100% satisfaction or your money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}