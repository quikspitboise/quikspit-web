import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger.service';

export interface GoogleReview {
  authorName: string;
  authorUrl: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
}

export interface ReviewsData {
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  reviewLink: string;
}

interface ReviewsCache {
  data: ReviewsData;
  timestamp: number;
}

@Injectable()
export class ReviewsService {
  private isConfigured = false;
  private cache: ReviewsCache | null = null;
  private resolvedPlaceId: string | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const apiKey = this.configService.get('GOOGLE_PLACES_API_KEY');
    this.isConfigured = !!apiKey;

    if (!this.isConfigured) {
      this.logger.warn(
        'Google Places API not configured (missing GOOGLE_PLACES_API_KEY). Reviews feature disabled.',
      );
    }
  }

  private async tryFindPlace(apiKey: string, input: string, inputtype: string): Promise<string | null> {
    const encoded = encodeURIComponent(input);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encoded}&inputtype=${inputtype}&fields=place_id,name&locationbias=circle:50000@43.60,-116.20&key=${apiKey}`;
    console.log(`[Reviews] FindPlace (${inputtype}): "${input}"`);
    const response = await fetch(url);
    const raw = await response.text();
    console.log(`[Reviews] FindPlace response: ${raw.slice(0, 500)}`);
    const data = JSON.parse(raw);

    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id;
    }
    console.log(`[Reviews] FindPlace failed: ${data.status} - ${data.error_message || 'No candidates'}`);
    return null;
  }

  private async tryTextSearch(apiKey: string, query: string): Promise<string | null> {
    const encoded = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&location=43.60,-116.20&radius=50000&key=${apiKey}`;
    console.log(`[Reviews] TextSearch: "${query}"`);
    const response = await fetch(url);
    const raw = await response.text();
    console.log(`[Reviews] TextSearch response: ${raw.slice(0, 500)}`);
    const data = JSON.parse(raw);

    if (data.status === 'OK' && data.results?.length > 0) {
      return data.results[0].place_id;
    }
    console.log(`[Reviews] TextSearch failed: ${data.status} - ${data.error_message || 'No results'}`);
    return null;
  }

  private async tryNearbySearch(apiKey: string, keyword: string): Promise<string | null> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${encodeURIComponent(keyword)}&location=43.603582,-116.4087469&radius=5000&key=${apiKey}`;
    console.log(`[Reviews] NearbySearch: "${keyword}"`);
    const response = await fetch(url);
    const raw = await response.text();
    console.log(`[Reviews] NearbySearch response: ${raw.slice(0, 500)}`);
    const data = JSON.parse(raw);

    if (data.status === 'OK' && data.results?.length > 0) {
      return data.results[0].place_id;
    }
    console.log(`[Reviews] NearbySearch failed: ${data.status} - ${data.error_message || 'No results'}`);
    return null;
  }

  private async resolvePlaceId(apiKey: string): Promise<string | null> {
    if (this.resolvedPlaceId) return this.resolvedPlaceId;

    const explicitPlaceId = this.configService.get('GOOGLE_PLACE_ID');
    if (explicitPlaceId) {
      this.resolvedPlaceId = explicitPlaceId;
      console.log(`[Reviews] Using explicit Place ID: ${explicitPlaceId}`);
      return explicitPlaceId;
    }

    const phone = this.configService.get('GOOGLE_BUSINESS_PHONE') || '+12089604970';

    const attempts: Array<{ method: () => Promise<string | null>; label: string }> = [
      {
        label: 'phone',
        method: () => this.tryFindPlace(apiKey, phone, 'phonenumber'),
      },
      {
        label: 'text-full',
        method: () => this.tryFindPlace(apiKey, 'QuikSpit Auto Detailing Boise ID', 'textquery'),
      },
      {
        label: 'text-short',
        method: () => this.tryFindPlace(apiKey, 'QuikSpit Auto Detailing', 'textquery'),
      },
      {
        label: 'text-brand',
        method: () => this.tryFindPlace(apiKey, 'QuikSpit Boise', 'textquery'),
      },
      {
        label: 'textsearch-full',
        method: () => this.tryTextSearch(apiKey, 'QuikSpit Auto Detailing Boise Idaho'),
      },
      {
        label: 'nearby-quikspit',
        method: () => this.tryNearbySearch(apiKey, 'QuikSpit'),
      },
      {
        label: 'nearby-detailing',
        method: () => this.tryNearbySearch(apiKey, 'QuikSpit Auto Detailing'),
      },
    ];

    for (const attempt of attempts) {
      try {
        const placeId = await attempt.method();
        if (placeId) {
          this.resolvedPlaceId = placeId;
          console.log(`[Reviews] Resolved Place ID: ${placeId} via ${attempt.label}`);
          return placeId;
        }
      } catch (error) {
        console.log(`[Reviews] ${attempt.label} error: ${error}`);
      }
    }

    this.logger.error('All Place ID resolution methods failed');
    return null;
  }

  async getReviews(): Promise<ReviewsData | null> {
    if (!this.isConfigured) {
      return null;
    }

    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    try {
      const apiKey = this.configService.get('GOOGLE_PLACES_API_KEY');
      const placeId = await this.resolvePlaceId(apiKey);

      if (!placeId) {
        this.logger.error('No Place ID available — cannot fetch reviews');
        return null;
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Places API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      const result: ReviewsData = {
        rating: data.result?.rating ?? 0,
        totalReviews: data.result?.user_ratings_total ?? 0,
        reviews: (data.result?.reviews || []).map((r: any) => ({
          authorName: r.author_name,
          authorUrl: r.author_url,
          profilePhotoUrl: r.profile_photo_url,
          rating: r.rating,
          text: r.text,
          time: r.time,
          relativeTimeDescription: r.relative_time_description,
        })),
        reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      };

      this.cache = {
        data: result,
        timestamp: Date.now(),
      };

      this.logger.log('Google Reviews fetched and cached', {
        rating: result.rating,
        totalReviews: result.totalReviews,
        reviewCount: result.reviews.length,
      });

      return result;
    } catch (error) {
      this.logger.error(
        'Failed to fetch Google Reviews',
        error instanceof Error ? error.stack : '',
      );

      if (this.cache) {
        this.logger.warn('Returning stale cached reviews due to fetch failure');
        return this.cache.data;
      }

      return null;
    }
  }
}
