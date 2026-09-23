'use client'

import { useEffect, useState } from 'react'
import { fetchReviews, type ReviewsData } from '@/lib/reviews'

const baseData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'QuikSpit Auto Detailing',
  image: 'https://quikspitboise.com/hero_fallback.jpg',
  description: 'Mobile auto detailing in Boise, ID. Exterior, interior, ceramic coating, and paint correction services at your home or office.',
  '@id': 'https://quikspitboise.com',
  url: 'https://quikspitboise.com',
  telephone: '+1-208-960-4970',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mobile Service',
    addressLocality: 'Boise',
    addressRegion: 'ID',
    postalCode: '83702',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.615,
    longitude: -116.2023,
  },
  sameAs: [
    'https://www.instagram.com/quikspitboise/',
    'https://www.tiktok.com/@quikspitboise',
    'https://www.facebook.com/people/QuikSpit-Auto-Detailing/61577268493375/',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Car Detailing Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Exterior Detailing',
          description: 'Complete exterior wash, clay bar treatment, polishing, and premium wax protection',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Interior Cleaning',
          description: 'Deep vacuum, steam cleaning, leather conditioning, and sanitization',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Premium Packages',
          description: 'Full interior and exterior detailing with ceramic coating and paint protection',
        },
      },
    ],
  },
}

/**
 * LocalBusiness JSON-LD. The aggregate rating comes from the reviews API,
 * which the reviews section also reads (the fetch is cached and shared).
 */
export function HomeStructuredData() {
  const [reviews, setReviews] = useState<ReviewsData | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchReviews().then((data) => {
      if (!cancelled) setReviews(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const data =
    reviews?.available && reviews.totalReviews > 0
      ? {
          ...baseData,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviews.rating.toString(),
            reviewCount: reviews.totalReviews.toString(),
          },
        }
      : baseData

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
