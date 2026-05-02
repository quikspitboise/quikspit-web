import { proxyAdminRequest } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyAdminRequest(request, '/settings/admin/booking', {
    method: 'GET',
  });
}

export async function PATCH(request: Request) {
  return proxyAdminRequest(request, '/settings/admin/booking', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}
