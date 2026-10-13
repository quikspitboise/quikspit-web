import { proxyAdminRequest } from '@/lib/server/gallery-api';
import { BOOKING_SETTINGS_CACHE_TAG } from '@/lib/server/booking-settings-api';
import { refreshPublicCache } from '@/lib/server/public-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyAdminRequest(request, '/settings/admin/booking', {
    method: 'GET',
  });
}

export async function PATCH(request: Request) {
  const response = await proxyAdminRequest(request, '/settings/admin/booking', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });

  if (response.ok) {
    // The booking page renders deposit text statically.
    refreshPublicCache({ tags: [BOOKING_SETTINGS_CACHE_TAG], paths: ['/booking'] });
  }
  return response;
}
