'use client'

import { useEffect, useState } from 'react'
import { fetchReviews, type ReviewsData } from '@/lib/reviews'

/**
 * LocalBusiness JSON-LD. The base data comes from published site content;
 * the aggregate rating comes from the reviews API, which the reviews section
 * also reads (the fetch is cached and shared).
 */
export function HomeStructuredData({ baseData }: { baseData: Record<string, unknown> }) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
