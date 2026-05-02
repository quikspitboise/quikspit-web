import 'server-only';

import { buildBackendApiUrl } from '../backend-api';
import {
  DEFAULT_BOOKING_SETTINGS,
  normalizeBookingSettings,
  type BookingSettings,
} from '../booking-settings';
import { getAdminApiAuth } from './admin-auth';

export async function fetchPublicBookingSettings(): Promise<BookingSettings> {
  try {
    const response = await fetch(buildBackendApiUrl('/settings/booking'), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch booking settings: ${response.status}`);
    }

    return normalizeBookingSettings(await response.json());
  } catch (error) {
    console.error('Falling back to default booking settings', error);
    return DEFAULT_BOOKING_SETTINGS;
  }
}

export async function fetchAdminBookingSettings(): Promise<BookingSettings> {
  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    throw new Error('Admin session is required');
  }

  const response = await fetch(buildBackendApiUrl('/settings/admin/booking'), {
    cache: 'no-store',
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
