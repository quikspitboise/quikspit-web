import 'server-only';

import { buildBackendApiUrl } from '../backend-api';
import { createTimeoutSignal } from '../fetch-with-timeout';
import {
  DEFAULT_BOOKING_SETTINGS,
  normalizeBookingSettings,
  type BookingSettings,
} from '../booking-settings';
import { getAdminApiAuth } from './admin-auth';

async function readBookingSettings(cached: boolean): Promise<BookingSettings> {
  try {
    const response = await fetch(buildBackendApiUrl('/settings/booking'), {
      ...(cached
        ? { next: { revalidate: 300, tags: [BOOKING_SETTINGS_CACHE_TAG] } }
        : { cache: 'no-store' as const }),
      signal: createTimeoutSignal(),
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch booking settings: ${response.status}`);
    }

    return normalizeBookingSettings(await response.json());
  } catch (error) {
    console.error(`Falling back to default booking settings (${cached ? 'cached' : 'uncached'} read)`, error);
    return DEFAULT_BOOKING_SETTINGS;
  }
}

export function fetchPublicBookingSettings(): Promise<BookingSettings> {
  return readBookingSettings(false);
}

/** Saving the deposit in admin expires this tag. */
export const BOOKING_SETTINGS_CACHE_TAG = 'booking-settings';

/** Cached read for statically rendered pages that mention the deposit. */
export function fetchCachedBookingSettings(): Promise<BookingSettings> {
  return readBookingSettings(true);
}

export async function fetchAdminBookingSettings(): Promise<BookingSettings> {
  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    throw new Error('Admin session is required');
  }

  const response = await fetch(buildBackendApiUrl('/settings/admin/booking'), {
    cache: 'no-store',
    signal: createTimeoutSignal(),
    headers: {
      Authorization: `Bearer ${adminAuth.token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch admin booking settings (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  return normalizeBookingSettings(await response.json());
}
