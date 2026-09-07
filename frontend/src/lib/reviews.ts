import { buildBackendApiUrl } from './backend-api';
import { createTimeoutSignal } from './fetch-with-timeout';

export interface Review {
  authorName: string;
  authorUrl: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
}

export interface ReviewsData {
  available: boolean;
  rating: number;
  totalReviews: number;
  reviews: Review[];
  reviewLink: string;
  stale?: boolean;
}

export const UNAVAILABLE_REVIEWS: ReviewsData = {
  available: false,
  rating: 0,
  totalReviews: 0,
  reviews: [],
  reviewLink: '',
};

export const REVIEWS_CACHE_TTL_MS = 5 * 60 * 1000;
export const REVIEWS_RETRY_DELAY_MS = 15 * 1000;

let cachedData: { data: ReviewsData; expiresAt: number } | null = null;
let inFlightPromise: Promise<ReviewsData> | null = null;
let retryAfter = 0;

export async function fetchReviews(): Promise<ReviewsData> {
  const now = Date.now();
  if (cachedData && now < cachedData.expiresAt) return cachedData.data;
  if (inFlightPromise) return inFlightPromise;
  if (now < retryAfter) return cachedData?.data ?? UNAVAILABLE_REVIEWS;

  inFlightPromise = (async () => {
    try {
      const response = await fetch(buildBackendApiUrl('/reviews'), {
        cache: 'no-store',
        signal: createTimeoutSignal(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ReviewsData;
      if (!data.available) {
        retryAfter = Date.now() + REVIEWS_RETRY_DELAY_MS;
        return cachedData ? { ...cachedData.data, stale: true } : UNAVAILABLE_REVIEWS;
      }
      cachedData = { data, expiresAt: Date.now() + REVIEWS_CACHE_TTL_MS };
      retryAfter = 0;
      return data;
    } catch {
      retryAfter = Date.now() + REVIEWS_RETRY_DELAY_MS;
      return cachedData ? { ...cachedData.data, stale: true } : UNAVAILABLE_REVIEWS;
    }
  })();

  try {
    return await inFlightPromise;
  } finally {
    inFlightPromise = null;
  }
}

export function clearReviewsCache() {
  cachedData = null;
  inFlightPromise = null;
  retryAfter = 0;
}
