import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { LoggerService } from '../common/logger.service';
import { ProviderCacheService } from '../runtime/provider-cache.service';

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
  private refreshPromise: Promise<ReviewsData | null> | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 8000;
  private readonly OVERALL_TIMEOUT_MS = 25000;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @Optional() private readonly sharedCache?: ProviderCacheService,
  ) {
    const apiKey = this.configService.get('GOOGLE_PLACES_API_KEY');
    this.isConfigured = !!apiKey;

    if (!this.isConfigured) {
      this.logger.warn(
        'Google Places API not configured (missing GOOGLE_PLACES_API_KEY). Reviews feature disabled.',
      );
    }
  }

  private async tryFindPlace(
    apiKey: string,
    input: string,
    inputtype: string,
    signal: AbortSignal,
  ): Promise<string | null> {
    const encoded = encodeURIComponent(input);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encoded}&inputtype=${inputtype}&fields=place_id,name&locationbias=circle:50000@43.60,-116.20&key=${apiKey}`;
    this.logger.debug(`Reviews FindPlace request (${inputtype})`);
    const data = await this.fetchJson(url, signal);

    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id;
    }
    this.logger.debug('Reviews FindPlace returned no matching place');
    return null;
  }

  private async tryTextSearch(
    apiKey: string,
    query: string,
    signal: AbortSignal,
  ): Promise<string | null> {
    const encoded = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&location=43.60,-116.20&radius=50000&key=${apiKey}`;
    this.logger.debug('Reviews TextSearch request');
    const data = await this.fetchJson(url, signal);

    if (data.status === 'OK' && data.results?.length > 0) {
      return data.results[0].place_id;
    }
    this.logger.debug('Reviews TextSearch returned no matching place');
    return null;
  }

  private async tryNearbySearch(
    apiKey: string,
    keyword: string,
    signal: AbortSignal,
  ): Promise<string | null> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${encodeURIComponent(keyword)}&location=43.603582,-116.4087469&radius=5000&key=${apiKey}`;
    this.logger.debug('Reviews NearbySearch request');
    const data = await this.fetchJson(url, signal);

    if (data.status === 'OK' && data.results?.length > 0) {
      return data.results[0].place_id;
    }
    this.logger.debug('Reviews NearbySearch returned no matching place');
    return null;
  }

  private async resolvePlaceId(
    apiKey: string,
    signal: AbortSignal,
  ): Promise<string | null> {
    if (this.resolvedPlaceId) return this.resolvedPlaceId;

    const explicitPlaceId = this.configService.get('GOOGLE_PLACE_ID');
    if (explicitPlaceId) {
      this.resolvedPlaceId = explicitPlaceId;
      this.logger.debug('Using configured Google Place ID');
      return explicitPlaceId;
    }

    const phone =
      this.configService.get('GOOGLE_BUSINESS_PHONE') || '+12089604970';

    const attempts: Array<{
      method: () => Promise<string | null>;
      label: string;
    }> = [
      {
        label: 'phone',
        method: () => this.tryFindPlace(apiKey, phone, 'phonenumber', signal),
      },
      {
        label: 'text-full',
        method: () =>
          this.tryFindPlace(
            apiKey,
            'QuikSpit Auto Detailing Boise ID',
            'textquery',
            signal,
          ),
      },
      {
        label: 'text-short',
        method: () =>
          this.tryFindPlace(
            apiKey,
            'QuikSpit Auto Detailing',
            'textquery',
            signal,
          ),
      },
      {
        label: 'text-brand',
        method: () =>
          this.tryFindPlace(apiKey, 'QuikSpit Boise', 'textquery', signal),
      },
      {
        label: 'textsearch-full',
        method: () =>
          this.tryTextSearch(
            apiKey,
            'QuikSpit Auto Detailing Boise Idaho',
            signal,
          ),
      },
      {
        label: 'nearby-quikspit',
        method: () => this.tryNearbySearch(apiKey, 'QuikSpit', signal),
      },
      {
        label: 'nearby-detailing',
        method: () =>
          this.tryNearbySearch(apiKey, 'QuikSpit Auto Detailing', signal),
      },
    ];

    for (const attempt of attempts) {
      try {
        this.throwIfAborted(signal);
        const placeId = await attempt.method();
        if (placeId) {
          this.throwIfAborted(signal);
          this.resolvedPlaceId = placeId;
          this.logger.debug(`Resolved Google Place ID via ${attempt.label}`);
          return placeId;
        }
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }
        this.logger.debug(`Reviews ${attempt.label} lookup failed`);
      }
    }

    this.logger.error('All Place ID resolution methods failed');
    return null;
  }

  private async fetchJson(url: string, signal: AbortSignal): Promise<any> {
    this.throwIfAborted(signal);
    const controller = new AbortController();
    const abortRequest = () => controller.abort(signal.reason);

    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', abortRequest, { once: true });
    }

    const timeout = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Google Places API returned ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abortRequest);
    }
  }

  private throwIfAborted(signal: AbortSignal): void {
    if (signal.aborted) {
      throw (
        signal.reason ?? new Error('Google Reviews refresh deadline exceeded')
      );
    }
  }

  private async refreshReviews(): Promise<ReviewsData | null> {
    const controller = new AbortController();
    const cacheKey =
      'google-reviews:' +
      createHash('sha256')
        .update(
          this.configService.get<string>('GOOGLE_PLACE_ID') ||
            this.configService.get<string>('GOOGLE_BUSINESS_PHONE') ||
            'quikspit-boise',
        )
        .digest('hex');
    let lease: string | null = null;
    const deadline = setTimeout(
      () =>
        controller.abort(new Error('Google Reviews refresh deadline exceeded')),
      this.OVERALL_TIMEOUT_MS,
    );

    try {
      if (this.sharedCache) {
        const cached = await this.beforeDeadline(
          () => this.sharedCache.read<ReviewsData>(cacheKey),
          controller.signal,
        );
        if (cached?.value) {
          this.cache = {
            data: cached.value,
            timestamp: cached.expiresAt - this.CACHE_TTL,
          };
          if (cached.fresh) return cached.value;
        }
        lease = await this.beforeDeadline(
          () => this.sharedCache.claim(cacheKey),
          controller.signal,
        );
        if (!lease) return this.cache?.data ?? null;
      }
      const apiKey = this.configService.get('GOOGLE_PLACES_API_KEY');
      const placeId = await this.resolvePlaceId(apiKey, controller.signal);

      if (!placeId) {
        this.logger.error('No Place ID available to fetch reviews');
        return null;
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

      const data = await this.fetchJson(url, controller.signal);

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error('Google Places returned an unsuccessful response');
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

      if (this.sharedCache && lease) {
        await this.beforeDeadline(
          () =>
            this.sharedCache.complete(cacheKey, lease, result, this.CACHE_TTL),
          controller.signal,
        );
        lease = null;
      }

      this.logger.log('Google Reviews fetched and cached', {
        rating: result.rating,
        totalReviews: result.totalReviews,
        reviewCount: result.reviews.length,
      });

      return result;
    } catch {
      this.logger.error('Failed to refresh Google Reviews');

      if (this.cache) {
        this.logger.warn('Returning stale cached reviews due to fetch failure');
        return this.cache.data;
      }

      return null;
    } finally {
      if (this.sharedCache && lease && !controller.signal.aborted) {
        await this.beforeDeadline(
          () => this.sharedCache.fail(cacheKey, lease),
          controller.signal,
        ).catch(() =>
          this.logger.warn('Reviews cache lease will expire automatically'),
        );
      }
      clearTimeout(deadline);
    }
  }

  private beforeDeadline<T>(
    work: () => Promise<T>,
    signal: AbortSignal,
  ): Promise<T> {
    this.throwIfAborted(signal);
    return new Promise<T>((resolve, reject) => {
      const abort = () => {
        cleanup();
        reject(signal.reason);
      };
      const cleanup = () => signal.removeEventListener('abort', abort);
      signal.addEventListener('abort', abort, { once: true });
      work().then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error) => {
          cleanup();
          reject(error);
        },
      );
    });
  }

  async getReviews(): Promise<ReviewsData | null> {
    if (!this.isConfigured) {
      return null;
    }

    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshPromise = this.refreshReviews();
    this.refreshPromise = refreshPromise;
    void refreshPromise.then(
      () => {
        if (this.refreshPromise === refreshPromise) {
          this.refreshPromise = null;
        }
      },
      () => {
        if (this.refreshPromise === refreshPromise) {
          this.refreshPromise = null;
        }
      },
    );

    return refreshPromise;
  }
}
