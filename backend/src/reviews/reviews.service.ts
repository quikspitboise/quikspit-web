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

  private async resolvePlaceId(apiKey: string): Promise<string | null> {
    const explicitPlaceId = this.configService.get('GOOGLE_PLACE_ID');
    if (explicitPlaceId) return explicitPlaceId;

    const businessName = this.configService.get('GOOGLE_BUSINESS_NAME') || 'QuikSpit Auto Detailing Boise ID';

    this.logger.log(`Auto-resolving Place ID for: "${businessName}"`);

    try {
      const encoded = encodeURIComponent(businessName);
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encoded}&inputtype=textquery&fields=place_id&key=${apiKey}`;
      this.logger.log(`Calling Find Place API: ${url.replace(apiKey, 'REDACTED')}`);
      const response = await fetch(url);
      const raw = await response.text();
      this.logger.log(`Find Place response: ${response.status} - ${raw.slice(0, 500)}`);
      const data = JSON.parse(raw);

      if (data.status === 'OK' && data.candidates?.length > 0) {
        const placeId = data.candidates[0].place_id;
        this.logger.log(`Resolved Place ID: ${placeId}`);
        return placeId;
      }

      this.logger.error(`Place ID auto-resolve failed: ${data.status} - ${data.error_message || 'No candidates'}`);
      return null;
    } catch (error) {
      this.logger.error('Place ID auto-resolve error', error instanceof Error ? error.stack : '');
      return null;
    }
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
