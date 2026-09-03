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
}

const FALLBACK: ReviewsData = {
  available: false,
  rating: 4.9,
  totalReviews: 127,
  reviews: [],
  reviewLink: '',
};

let cachedPromise: Promise<ReviewsData> | null = null;

export async function fetchReviews(): Promise<ReviewsData> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    try {
      const response = await fetch(buildBackendApiUrl('/reviews'), {
        cache: 'no-store',
        signal: createTimeoutSignal(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ReviewsData;
      if (!data.available) return FALLBACK;
      return data;
    } catch {
      return FALLBACK;
    }
  })();

  return cachedPromise;
}
