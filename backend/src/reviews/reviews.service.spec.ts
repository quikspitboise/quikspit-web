import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger.service';
import { ReviewsService } from './reviews.service';

const OVERALL_TIMEOUT_MS = 25000;

describe('ReviewsService', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  function createService(
    configOverrides: Record<string, string | undefined> = {},
  ): ReviewsService {
    const configValues = {
      GOOGLE_PLACES_API_KEY: 'test-api-key',
      GOOGLE_PLACE_ID: 'place-id',
      GOOGLE_BUSINESS_PHONE: undefined,
      ...configOverrides,
    };
    const config = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;
    const logger = {
      debug: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;

    return new ReviewsService(config, logger);
  }

  it('aborts a hanging cold refresh at the shared deadline and stops lookup retries', async () => {
    jest.useFakeTimers();
    const service = createService({ GOOGLE_PLACE_ID: undefined });

    fetchMock.mockImplementation(
      (_url: string, options: RequestInit = {}) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = options.signal;
          const rejectOnAbort = () =>
            reject(signal?.reason ?? new Error('request aborted'));

          if (signal?.aborted) {
            rejectOnAbort();
          } else {
            signal?.addEventListener('abort', rejectOnAbort, { once: true });
          }
        }),
    );

    const refresh = service.getReviews();
    await jest.advanceTimersByTimeAsync(OVERALL_TIMEOUT_MS);

    await expect(refresh).resolves.toBeNull();

    const requestsAtDeadline = fetchMock.mock.calls.length;
    expect(requestsAtDeadline).toBeGreaterThan(0);
    expect(requestsAtDeadline).toBeLessThan(7);

    await jest.advanceTimersByTimeAsync(OVERALL_TIMEOUT_MS);
    expect(fetchMock).toHaveBeenCalledTimes(requestsAtDeadline);
    for (const [, options] of fetchMock.mock.calls) {
      expect((options as RequestInit).signal?.aborted).toBe(true);
    }
    expect(jest.getTimerCount()).toBe(0);
  });

  it('coalesces concurrent cold refreshes into one details request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        result: {
          rating: 4.9,
          user_ratings_total: 127,
          reviews: [],
        },
      }),
    } as Response);
    const service = createService();

    const firstRefresh = service.getReviews();
    const secondRefresh = service.getReviews();

    const [first, second] = await Promise.all([firstRefresh, secondRefresh]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/details/json');
    expect(first).toBe(second);
    expect(first).toMatchObject({ rating: 4.9, totalReviews: 127 });
  });
});
